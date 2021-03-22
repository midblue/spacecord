<script>
  // get game data periodically -------------------------------------------

  let gameData
  async function getGameData() {
    const res = await fetch('/game')
    gameData = await res.json()
    console.log(gameData)
    redraw(gameData)
  }
  getGameData()

  setInterval(getGameData, 10 * 1000)

  // -------------------------------------------

  const KM_PER_AU = 149597900

  import Box from './components/Box.svelte'
  import MapPoint from './components/MapPoint.svelte'
  import MapPlanet from './components/MapPlanet.svelte'
  import MapDistanceCircles from './components/MapDistanceCircles.svelte'
  import Starfield from './components/Starfield.svelte'

  let ships = [],
    planets = [],
    caches = [],
    attackRemnants = [],
    displayDiameter = 0,
    pointsToShow = [],
    mapContainer

  function redraw(data) {
    ships = data.guilds.map((g) => g.ship)
    planets = data.planets
    caches = data.caches
    attackRemnants = data.attackRemnants

    const edgeBuffer = 0.2

    pointsToShow = [
      ...planets.map((p) => ({
        name: p.name,
        location: p.location,
        color: p.validColor || p.color,
        radius: p.radius,
      })),
      ...ships.map((p) => ({
        name: p.name,
        location: p.location,
        color: 'white',
      })),
      ...caches.map((p) => ({
        name: p.name,
        location: p.location,
        color: 'yellow',
        size: 4,
      })),
      ...attackRemnants.map((p) => ({
        location: p.location,
        color: 'red',
      })),
    ]

    let upperBound = pointsToShow.reduce(
      (max, p) => Math.max(p.location[1], max),
      -99999999,
    )
    let rightBound = pointsToShow.reduce(
      (max, p) => Math.max(p.location[0], max),
      -99999999,
    )
    let lowerBound = pointsToShow.reduce(
      (min, p) => Math.min(p.location[1], min),
      99999999,
    )
    let leftBound = pointsToShow.reduce(
      (min, p) => Math.min(p.location[0], min),
      99999999,
    )

    const heightDiff = Math.abs(upperBound - lowerBound)
    const widthDiff = Math.abs(rightBound - leftBound)

    const diameter = Math.max(heightDiff, widthDiff)
    if (heightDiff !== diameter) {
      upperBound += (diameter - heightDiff) / 2
      lowerBound -= (diameter - heightDiff) / 2
    }
    if (widthDiff !== diameter) {
      rightBound += (diameter - widthDiff) / 2
      leftBound -= (diameter - widthDiff) / 2
    }
    const bufferDistance = diameter * edgeBuffer + 0.0001
    displayDiameter = diameter + bufferDistance

    const percentPerKilometer = 1 / displayDiameter / KM_PER_AU
    const pixelsPerAU = mapContainer.offsetWidth / displayDiameter
    console.log(mapContainer)

    pointsToShow.forEach((p) => {
      if (p.radius) p.size = (p.radius * 2 * pixelsPerAU) / KM_PER_AU
    })

    pointsToShow = pointsToShow.map((p) => {
      return {
        ...p,
        label: p.name,
        topPercent:
          ((upperBound + bufferDistance / 2 - p.location[1]) /
            displayDiameter) *
          100,
        leftPercent:
          ((p.location[0] - (leftBound - bufferDistance / 2)) /
            displayDiameter) *
          100,
      }
    })
  }
</script>

<div class="holder">
  <Starfield />
  <Box label={'Game View'} bind:this={mapContainer}>
    {#if displayDiameter}
      <MapDistanceCircles
        centerPoint={{ topPercent: 50, leftPercent: 50 }}
        diameter={displayDiameter}
      />
    {/if}
    {#each pointsToShow.filter((p) => p.radius) as p}
      <MapPlanet {...p} />
    {/each}
    {#each pointsToShow.filter((p) => !p.radius) as p}
      <MapPoint {...p} />
    {/each}
  </Box>
</div>

<style>
  :root {
    --main-width: 100%;
    --main-height: 100%;
    --text-size: 14px;
  }

  .holder {
    --main-width: 100%;
    --main-height: 100%;
    --text-size: 14px;
    width: 100%;
    height: 100%;
  }
</style>
