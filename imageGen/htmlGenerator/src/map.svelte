<script>
	import Box from './components/Box.svelte';
  import MapPoint from './components/MapPoint.svelte';
  import MapCircle from './components/MapCircle.svelte';
  import Starfield from './components/Starfield.svelte';

  export let ship;
  export let planets;

  const edgeBuffer = .7

  let pointsToShow = [
    ...planets.map(p => ({name: p.name, location: p.location, color: p.validColor || p.color})), 
    {name: ship.name + '\n(you)', location: ship.location, color: 'white'}
  ]

  let upperBound = pointsToShow.reduce((max,p) => Math.max((p.location[1]), max), -99999999)
  let rightBound = pointsToShow.reduce((max,p) => Math.max((p.location[0]), max), -99999999)
  let lowerBound = pointsToShow.reduce((min,p) => Math.min((p.location[1]), min), 99999999)
  let leftBound = pointsToShow.reduce((min,p) => Math.min((p.location[0]), min), 99999999)


  const heightDiff = Math.abs(upperBound - lowerBound)
  const widthDiff = Math.abs(rightBound - leftBound)

  const diameter = Math.max(heightDiff, widthDiff)
  if (heightDiff !== diameter){
    upperBound += (diameter - heightDiff) / 2
    lowerBound -= (diameter - heightDiff) / 2
  }
  if (widthDiff !== diameter){
    rightBound += (diameter - widthDiff) / 2
    leftBound -= (diameter - widthDiff) / 2
  }
  const bufferDistance = diameter * edgeBuffer
  const displayDiameter = diameter + bufferDistance

  let auBetweenLines = 1
  while (auBetweenLines/displayDiameter < 0.15) auBetweenLines *= 2

  console.log(pointsToShow)

  pointsToShow = pointsToShow.map(p => {

    console.log('tp',
      ((upperBound + bufferDistance / 2) - p.location[1])/displayDiameter, 
      leftBound, 
      (p.location[0] - (leftBound - bufferDistance / 2))/displayDiameter
    )

    return {
      ...p, 
      label: p.name,
      topPercent:((upperBound + bufferDistance / 2) - p.location[1])/displayDiameter * 100,
      leftPercent: (p.location[0] - (leftBound - bufferDistance / 2))/displayDiameter * 100
    }
  })

  const shipPoint = pointsToShow[pointsToShow.length - 1]

  const circlesToShow = []
  for (let i = 1; i < 7; i++) {
    circlesToShow.push({
      topPercent: shipPoint.topPercent, 
      leftPercent: shipPoint.leftPercent, 
      radiusPercent: (auBetweenLines/displayDiameter) * i * 100,
      label: auBetweenLines * i + 'AU'
    })
  }

  console.log({upperBound,  lowerBound, rightBound, leftBound})
  
</script>


<!-- <Starfield /> -->
<Box label={'Discovered Planets'}>
  {#each circlesToShow as c}
    <MapCircle {...c} />
  {/each}
  {#each pointsToShow as p}
    <MapPoint {...p} />
  {/each}
</Box>


<style>
</style>