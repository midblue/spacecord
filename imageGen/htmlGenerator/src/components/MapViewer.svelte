<script>
  import { onMount } from 'svelte'
  import {
    scale as scaleStore,
    view as viewStore,
    winSizeMultiplier as winSizeMultiplierStore,
  } from '../js/stores.js'
  let view
  viewStore.subscribe((value) => (view = value))
  let scale
  scaleStore.subscribe((value) => (scale = value))

  const FLAT_SCALE = 100
  const ZOOM_LEVEL_ONE = 2.5 // AU across viewport
  const KM_PER_AU = 149597900

  import common from '../js/imageCommon'
  import Starfield from './Starfield.svelte'
  import PopOver from './PopOver.svelte'

  import Planet from './Planet.svelte'
  import Ship from './Ship.svelte'
  import Cache from './Cache.svelte'
  import AttackRemnant from './AttackRemnant.svelte'
  import DistanceMarkers from './DistanceMarkers.svelte'
  import DistanceCircles from './DistanceCircles.svelte'
  import Outline from './Outline.svelte'

  export let gameData
  $: if (gameData) {
    redraw()
  }

  let maxView = { left: 0, top: 0, width: 1, height: 1 }
  let svgElement
  let ships = [],
    planets = [],
    caches = [],
    attackRemnants = [],
    radii = []

  const getSizeMultiplier = () =>
    winSizeMultiplierStore.set(
      (2000 / window.innerWidth) * (gameData?.textScaleMultiplier || 1),
    )
  onMount(() => {
    getSizeMultiplier()
    window.addEventListener('resize', () => {
      getSizeMultiplier()
    })
  })
  $: if (gameData?.textScaleMultiplier) getSizeMultiplier()

  function redraw() {
    ships = (gameData.guilds || []).map((el) => ({
      type: 'ship',
      location: el.ship.location,
      name: el.ship.name,
      shipData: el.ship,
      color: el.color || el.ship.color,
    }))
    planets = (gameData.planets || []).map((el) => ({
      type: 'planet',
      location: el.location,
      radius: el.radius / KM_PER_AU,
      minSize: 0.01,
      color: el.validColor || el.color,
      name: el.name,
    }))
    caches = (gameData.caches || []).map((el) => ({
      type: 'cache',
      location: el.location,
      color: 'yellow',
    }))
    attackRemnants = gameData.attackRemnants || []
    radii = gameData.radii || []

    // flip y values since svg counts up from the top down
    ships.forEach((el) => {
      el.location[1] *= -1
      el.shipData.pastLocations = el.shipData.pastLocations.map((l) => [
        l[0],
        l[1] * -1,
      ])
    })
    caches.forEach((el) => (el.location[1] *= -1))
    planets.forEach((el) => (el.location[1] *= -1))

    if (gameData.focus === 'path' && ships.length)
      recalcView([...ships[0].shipData.pastLocations, ships[0].location])
    else recalcView([...ships, ...planets, ...caches])

    // make attackRemnants -------------------------------

    attackRemnants = attackRemnants.map((ar) => {
      const targetJiggle = ar.didHit
        ? [0, 0]
        : ar.attacker.location.map((coord, index) => {
            const randomButStableNumber =
              Math.round((coord + ar.defender.location[index]) * 100000000) % 10
            return randomButStableNumber * 0.000001
          })
      return {
        type: 'attackRemnant',
        z: 5,
        ...ar,
        attacker: {
          ...ar.attacker,
          location: [ar.attacker.location[0], ar.attacker.location[1] * -1],
        },
        defender: {
          ...ar.defender,
          location: [
            ar.defender.location[0] + targetJiggle[0],
            ar.defender.location[1] * -1 + targetJiggle[1],
          ],
        },
      }
    })
  }

  const recalcView = (points) => {
    if (points[0].location) points = points.map((p) => p.location)
    const maxes = common.getMaxes(points)
    Object.keys(maxes).forEach((k) => (maxes[k] *= FLAT_SCALE))

    const hardBuffer = 0.01
    const softBuffer =
      (gameData.buffer || 0.05) * Math.max(maxes.width, maxes.height)
    const buffer = hardBuffer + softBuffer

    if (gameData.center) {
      maxView.left = gameData.center[0] * FLAT_SCALE
      maxView.top = gameData.center[1] * FLAT_SCALE * -1
    } else {
      maxView.left = maxes.left - buffer
      maxView.top = maxes.bottom - buffer
    }

    if (gameData.radius) {
      maxView.width = gameData.radius * 2 * FLAT_SCALE
      maxView.height = gameData.radius * 2 * FLAT_SCALE
    } else {
      maxView.width = maxes.width
      maxView.height = maxes.height

      maxView.width += buffer * 2
      maxView.height += buffer * 2

      const windowAspectRatio = window.innerWidth / window.innerHeight
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
    }

    if (gameData.center) {
      maxView.left -= maxView.width / 2
      maxView.top -= maxView.height / 2
    }

    if (view.width === 0) viewStore.set({ ...maxView })
    scaleStore.set((ZOOM_LEVEL_ONE * FLAT_SCALE) / view.width)
  }

  // set up mouse interaction ------------------------------------

  let isPanning = false,
    startPoint,
    endPoint

  onMount(() => {
    svgElement.onmousewheel = (e) => {
      e.preventDefault()
      if (scale <= 0.1 && e.deltaY > 0) return
      if (scale > 8000 && e.deltaY < 0) return

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
      scaleStore.set((ZOOM_LEVEL_ONE * FLAT_SCALE) / view.width)
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
    {#each planets as point}
      <Planet {...point} />
    {/each}

    {#each ships as point}
      <Ship {...point} />
    {/each}

    {#each caches as point}
      <Cache {...point} />
    {/each}

    {#each attackRemnants as attack}
      <AttackRemnant {...attack} />
    {/each}

    {#each radii as radiusData}
      <Outline
        location={[gameData.center[0], gameData.center[1] * -1]}
        radius={radiusData.radius * FLAT_SCALE}
        color={radiusData.color}
        label={radiusData.label}
        opacity={0.3}
        dash={view.width * 0.01}
      />
    {/each}

    {#if !gameData?.center}
      <DistanceMarkers {...view} />
    {/if}
    {#if gameData?.center}
      <DistanceCircles
        {...view}
        location={[gameData.center[0], gameData.center[1] * -1]}
      />
    {/if}
    {#if gameData?.radius}
      <Outline
        location={[gameData.center[0], gameData.center[1] * -1]}
        radius={gameData.radius * FLAT_SCALE}
        blackout={true}
      />
    {/if}
  </svg>
</div>

<style>
  .holder {
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
