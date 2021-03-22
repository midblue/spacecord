<script>
  import { onMount } from 'svelte'

  export let pathPoints = []
  export let upperBound = 0
  export let leftBound = 0
  export let bufferDistance = 0
  export let displayDiameter = 0
  export let colorRgb = '255,255,255'
  export let fade = true

  let rootElement,
    svgWidth = 100,
    svgHeight = 100

  let pointsToShow = [
    ...pathPoints.map((l, index) => ({
      location: l.location ? l.location : l,
      color: `rgba(${colorRgb},${
        fade ? 0.5 * (index / pathPoints.length) : 0.15
      })`,
    })),
  ]

  let from
  let points = []
  for (let p of pointsToShow) {
    const to = [
      ((upperBound + bufferDistance / 2 - p.location[1]) / displayDiameter) *
        100,
      ((p.location[0] - (leftBound - bufferDistance / 2)) / displayDiameter) *
        100,
    ]
    if (!from) from = to
    points.push({ color: p.color, from, to })
    from = to
  }

  onMount(async () => {
    svgWidth = rootElement.parentElement.offsetWidth
    svgHeight = rootElement.parentElement.offsetHeight
  })
</script>

<svg
  bind:this={rootElement}
  width={svgWidth}
  height={svgHeight}
  viewBox={`0 0 100 100`}
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  {#each points as point}
    <path
      d={`M${point.from[1]} ${point.from[0]} L${point.to[1]} ${point.to[0]}`}
      stroke={point.color}
    />
  {/each}
</svg>

<style>
  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  svg path {
    stroke-width: 1;
  }
</style>
