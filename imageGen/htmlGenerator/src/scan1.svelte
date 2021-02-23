<script>
	import Box from './components/Box.svelte'
  import MapPoint from './components/MapPoint.svelte'
  import MapCircle from './components/MapCircle.svelte'
  import Starfield from './components/Starfield.svelte'

  export let ship
  export let planets
  export let ships
  export let caches
  export let range
  export let repair

  const allColors = ['white', 'green', 'yellow', 'red', 'purple']
  const getColor = (c) => Math.random() < repair ? c : allColors[Math.floor(Math.random() * allColors.length)]
  const getSize = (s) => Math.random() < repair ? s : s + ((Math.random() - .5) * (1-repair) * 5)
  const getRound = (r) => Math.random() < repair ? r : Math.random() > .5
  const getLocation = (coords) => {
    return coords.map(c => Math.random() < repair ? c : c + ((Math.random() - .5) * (1-repair) * range))
  }

  let pointsToShow = [
    {
     location: getLocation(ship.location), color: getColor('white'), size: getSize(6), round: getRound(false), 
    },
    ...planets.map(p => ({
      color: getColor('green'), location: getLocation(p.location), size: getSize(12), round: getRound(true), 
    })), 
    ...caches.map(c => ({
      color: getColor('yellow'), location: getLocation(c.location), size: getSize(6), round: getRound(false), 
    })), 
    ...ships.map(s => ({
      color: getColor('red'), location: getLocation(s.location), size: getSize(6), round: getRound(false), 
    })), //name: s.name,
  ]

  const center = pointsToShow[0].location
  let upperBound = center[1] + range
  let leftBound = center[0] - range

  const diameter = range * 2

  let auBetweenLines = 1
  while (auBetweenLines/diameter < 0.15) auBetweenLines *= 2

  pointsToShow = pointsToShow.map(p => {

    return {
      ...p, 
      label: p.name,
      topPercent:(upperBound - p.location[1])/diameter * 100,
      leftPercent: (p.location[0] - leftBound)/diameter * 100
    }
  })

  const shipPoint = pointsToShow[0]

  const circlesToShow = []
  for (let i = 1; i < 7; i++) {
    circlesToShow.push({
      topPercent: shipPoint.topPercent, 
      leftPercent: shipPoint.leftPercent, 
      radiusPercent: (auBetweenLines/diameter) * i * 100,
      label: auBetweenLines * i + 'AU'
    })
  }

  const blackoutCircle = {
    topPercent: shipPoint.topPercent, 
    leftPercent: shipPoint.leftPercent, 
    radiusPercent: (range/diameter) * 100,
    blackout: true
  }
  
</script>


<Starfield />
<div style="--ui: #fd0; --bg: #210;">
  <Box label={`Area Scan`}>
    <div style="transform: rotate({Math.random() < repair ? 0 : (Math.random() - 0.5) * (1 - repair) * 180}deg);">
      {#each circlesToShow as c}
        <MapCircle {...c} />
      {/each}
      <MapCircle {...blackoutCircle} />
      {#each pointsToShow as p}
        <MapPoint {...p} />
      {/each}
    </div>
  </Box>
</div>


<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>