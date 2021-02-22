<script>
	import Box from './components/Box.svelte';
  import MapPoint from './components/MapPoint.svelte';
  import MapCircle from './components/MapCircle.svelte';
  import Starfield from './components/Starfield.svelte';

  export let ship;
  export let planets;
  export let ships;
  export let caches;
  export let range;

  let pointsToShow = [
    ...planets.map(p => ({type: 'planet', color: 'green', location: p.location, size: 10, })), 
    ...ships.map(p => ({type: 'ship', name: p.name, color: 'red', location: p.location,})), 
    ...caches.map(p => ({type: 'cache', color: 'yellow', location: p.location, })), 
    {type: 'us', name: ship.name + '\n(you)', location: ship.location, color: 'white'}
  ]

  const center = ship.location
  let upperBound = center[1] + range
  let rightBound = center[0] + range
  let lowerBound = center[1] - range
  let leftBound = center[0] - range

  const diameter = range * 2

  let auBetweenLines = 1
  while (auBetweenLines/diameter < 0.15) auBetweenLines *= 2

  // console.log(pointsToShow)

  pointsToShow = pointsToShow.map(p => {

    // console.log('tp',
    //   ((upperBound + diameter / 2) - p.location[1])/diameter, 
    //   leftBound, 
    //   (p.location[0] - (leftBound - diameter / 2))/diameter
    // )

    return {
      ...p, 
      label: p.name,
      topPercent:(upperBound - p.location[1])/diameter * 100,
      leftPercent: (p.location[0] - leftBound)/diameter * 100
    }
  })

  const shipPoint = pointsToShow[pointsToShow.length - 1]

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
  console.log('boc', blackoutCircle)

  // console.log({upperBound, lowerBound, rightBound, leftBound})
  
</script>


<Starfield />
<div style="--ui: #ad0; --bg: #120;">
  <Box label={'Area Scan'}>
    {#each circlesToShow as c}
      <MapCircle {...c} />
    {/each}
    <MapCircle {...blackoutCircle} />
    {#each pointsToShow as p}
      <MapPoint {...p} />
    {/each}
  </Box>
</div>


<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>