<script>
  import { onMount } from 'svelte'
  import {
    scale as scaleStore,
    updateMs as updateMsStore,
    view as viewStore,
  } from './js/stores.js'
  let updateMs
  updateMsStore.subscribe((value) => (updateMs = value))
  let view
  viewStore.subscribe((value) => (view = value))

  const FLAT_SCALE = 100

  // get game data periodically -------------------------------------------

  let gameData
  async function getGameData() {
    const res = await fetch('/game')
    gameData = await res.json()
    // console.log(gameData)
    redraw(gameData)
  }
  onMount(getGameData)

  setInterval(getGameData, updateMs)

  // -------------------------------------------

  import common from './js/imageCommon'

  const KM_PER_AU = 149597900

  import Starfield from './components/Starfield.svelte'
  import PopOver from './components/PopOver.svelte'

  import Planet from './components/Planet.svelte'
  import Ship from './components/Ship.svelte'
  import Cache from './components/Cache.svelte'
  import AttackRemnant from './components/AttackRemnant.svelte'
  import Path from './components/Path.svelte'
  import DistanceMarkers from './components/DistanceMarkers.svelte'

  let maxView = { left: 0, top: 0, width: 1, height: 1 }
  let svgElement
  let ships = [],
    trails = [],
    planets = [],
    caches = [],
    attackRemnants = [],
    points = []

  function redraw(data) {
    ships = data.guilds.map((g) => g.ship)
    planets = data.planets
    caches = data.caches
    attackRemnants = data.attackRemnants

    points = [
      ...planets.map((el) => ({
        type: 'planet',
        location: el.location,
        radius: el.radius / KM_PER_AU,
        minSize: 0.01,
        color: el.validColor || el.color,
        name: el.name,
        z: 2,
      })),
      ...caches.map((el) => ({
        type: 'cache',
        location: el.location,
        color: 'yellow',
        z: 3,
      })),
      ...ships.map((el) => ({
        type: 'ship',
        location: el.location,
        name: el.name,
        z: 4,
        shipData: el,
      })),
      ...attackRemnants.map((el) => ({
        type: 'attackRemnant',
        location: el.location,
        z: 5,
      })),
    ]
    points.forEach((el) => (el.location[1] *= -1)) // flip y values since svg counts up from the top down

    const maxes = common.getMaxes(points.map((p) => p.location))
    Object.keys(maxes).forEach((k) => (maxes[k] *= FLAT_SCALE))

    const windowAspectRatio = window.innerWidth / window.innerHeight

    const hardBuffer = 0.01
    const softBuffer = 0.05 * Math.max(maxes.width, maxes.height)
    const buffer = hardBuffer + softBuffer

    maxView.left = maxes.left - buffer
    maxView.top = maxes.bottom - buffer
    maxView.width = maxes.width
    maxView.height = maxes.height

    maxView.width += buffer * 2
    maxView.height += buffer * 2

    const viewAspectRatio = maxView.width / maxView.height
    const aspectRatioDifferencePercent = viewAspectRatio / windowAspectRatio
    if (aspectRatioDifferencePercent > 1) {
      maxView.top -= (maxView.height * (aspectRatioDifferencePercent - 1)) / 2
      maxView.height = maxView.width / windowAspectRatio
    }
    if (aspectRatioDifferencePercent < 1) {
      maxView.left -= (maxView.width * (1 - aspectRatioDifferencePercent)) / 2
      maxView.width = maxView.height * windowAspectRatio
    }

    if (view.width === 0) viewStore.set({ ...maxView })

    trails = ships.map((s) => [
      ...s.pastLocations.map((l) => [l[0], l[1] * -1]),
      s.location,
    ])
  }

  // set up mouse interaction ------------------------------------

  let isPanning = false,
    startPoint,
    endPoint,
    scale

  scaleStore.subscribe((value) => {
    scale = value
  })

  onMount(() => {
    svgElement.onmousewheel = (e) => {
      e.preventDefault()
      const dw = view.width * e.deltaY * 0.03
      const dh = view.height * e.deltaY * 0.03

      const elBCR = svgElement.getBoundingClientRect()
      const mx = e.offsetX / elBCR.width
      const my = e.offsetY / elBCR.height

      const dx = dw * -1 * mx
      const dy = dh * -1 * my

      viewStore.set({
        left: view.left + dx,
        top: view.top + dy,
        width: view.width + dw,
        height: view.height + dh,
      })
      scaleStore.set(maxView.width / view.width)
    }

    svgElement.onmousedown = function (e) {
      isPanning = true
      startPoint = [e.x, e.y]
    }

    svgElement.onmousemove = function (e) {
      if (!isPanning) return
      const elBCR = svgElement.getBoundingClientRect()
      endPoint = [e.x, e.y]
      const dx = ((startPoint[0] - endPoint[0]) / elBCR.width) * view.width
      const dy = ((startPoint[1] - endPoint[1]) / elBCR.height) * view.height

      viewStore.set({
        left: view.left + dx,
        top: view.top + dy,
        width: view.width,
        height: view.height,
      })
      startPoint = [e.x, e.y]
    }

    svgElement.onmouseup = function (e) {
      isPanning = false
    }

    svgElement.onmouseleave = function (e) {
      isPanning = false
    }
  })
</script>

<Starfield />
<PopOver />
<div class="holder">
  <svg
    bind:this={svgElement}
    viewBox="{view.left} {view.top} {view.width} {view.height}"
  >
    <DistanceMarkers {...view} />

    {#each points.filter((p) => p.type === 'planet') as point}
      <Planet {...point} />
    {/each}

    {#each points.filter((p) => p.type === 'ship') as point}
      <Ship {...point} />
    {/each}

    {#each points.filter((p) => p.type === 'cache') as point}
      <Cache {...point} />
    {/each}

    {#each points.filter((p) => p.type === 'attackRemnant') as point}
      <AttackRemnant {...point} />
    {/each}

    {#each trails as trail}
      <Path points={trail} z={3} />
    {/each}
  </svg>
</div>

<style>
  :root {
    --main-width: 100%;
    --main-height: 100%;
    --text-size: 12px;
  }

  .holder {
    --main-width: 100%;
    --main-height: 100%;
    --text-size: 12px;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 2;
    user-select: none;
  }

  svg {
    width: 100%;
    height: 100%;
  }
</style>
