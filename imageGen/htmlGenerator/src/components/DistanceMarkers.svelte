<script>
  import { scale as scaleStore } from '../js/stores.js'
  let scale
  scaleStore.subscribe((value) => {
    scale = value
  })

  import { winSizeMultiplier as winSizeMultiplierStore } from '../js/stores.js'
  let winSizeMultiplier
  winSizeMultiplierStore.subscribe((value) => (winSizeMultiplier = value))

  const FLAT_SCALE = 100

  export let top, left, width, height

  let horizontalMarkersToDraw = [],
    verticalMarkersToDraw = [],
    roundFactor = 1

  $: if (width) {
    let auBetweenLines = 1 / 2 ** 8
    const diameter = Math.max(width, height)
    while (auBetweenLines / diameter < 0.15) auBetweenLines *= 2

    roundFactor = 1
    while (
      Math.abs(Math.round((auBetweenLines * roundFactor) / FLAT_SCALE)) < 1
    )
      roundFactor *= 10
    roundFactor *= 100

    horizontalMarkersToDraw = []
    verticalMarkersToDraw = []
    const center = [left + width / 2, top + height / 2]
    horizontalMarkersToDraw.push(center[1])
    verticalMarkersToDraw.push(center[0])
    for (let i = 1; i < 4; i++) {
      horizontalMarkersToDraw.push(center[1] + auBetweenLines * i)
      verticalMarkersToDraw.push(center[0] + auBetweenLines * i)
      horizontalMarkersToDraw.push(center[1] - auBetweenLines * i)
      verticalMarkersToDraw.push(center[0] - auBetweenLines * i)
    }
  }
</script>

<g class="distancemarkers">
  {#each horizontalMarkersToDraw as y}
    <line
      x1={left}
      x2={left + width}
      y1={y}
      y2={y}
      stroke={'white'}
      stroke-width={(0.0025 * FLAT_SCALE * winSizeMultiplier) / scale}
    />
    <text
      x={left + width * 0.003}
      y={y - height * 0.01}
      text-anchor="left"
      font-size={(0.03 * FLAT_SCALE * winSizeMultiplier) / scale}
      fill={'white'}
    >
      {Math.round((y / FLAT_SCALE) * roundFactor) / roundFactor}
    </text>
  {/each}

  {#each verticalMarkersToDraw as x}
    <line
      x1={x}
      x2={x}
      y1={top}
      y2={top + height}
      stroke={'white'}
      stroke-width={(0.0025 * FLAT_SCALE * winSizeMultiplier) / scale}
    />
    <text
      x={x + width * 0.003}
      y={top + height * 0.022}
      text-anchor="left"
      font-size={(0.03 * FLAT_SCALE * winSizeMultiplier) / scale}
      fill={'white'}
    >
      {Math.round((x / FLAT_SCALE) * roundFactor) / roundFactor}
    </text>
  {/each}
</g>

<style>
  g {
    z-index: 10;
    position: relative;
  }
  line {
    opacity: 0.1;
  }
  text {
    opacity: 0.4;
    font-weight: bold;
  }
</style>
