<script>
  import { onDestroy, onMount, createEventDispatcher } from 'svelte'
  import {
    scale as scaleStore,
    updateMs as updateMsStore,
    view as viewStore,
  } from '../js/stores.js'
  let updateMs, scale, view
  const unsubscribe = []
  unsubscribe.push(updateMsStore.subscribe((value) => (updateMs = value)))
  unsubscribe.push(
    scaleStore.subscribe((value) => {
      scale = value
    }),
  )
  unsubscribe.push(
    viewStore.subscribe((value) => {
      view = value
    }),
  )
  onDestroy(() => unsubscribe.forEach((u) => u()))

  const FLAT_SCALE = 100

  export let location,
    minSize = 0.005,
    radius = 0,
    color,
    name,
    z

  const dispatch = createEventDispatcher()

  // let previousLocation = [0, 0],
  //   stepSize = [0, 0],
  //   animatedLocation = [0, 0]
  // let lastUpdateTime = Date.now()
  // $: if (
  //   location[0] !== previousLocation[0] ||
  //   location[1] !== previousLocation[1]
  // ) {
  //   stepSize = [
  //     location[0] - previousLocation[0],
  //     location[1] - previousLocation[1],
  //   ]
  //   previousLocation = [...location]
  //   lastUpdateTime = Date.now()
  // }

  // let waitingOnFrame = false,
  //   readyToAnimate = false
  // onMount(() => {
  //   readyToAnimate = true
  //   animatedLocation = [
  //     previousLocation[0] + stepSize[0],
  //     previousLocation[1] + stepSize[1],
  //   ]
  // })

  // $: if (
  //   readyToAnimate &&
  //   !waitingOnFrame &&
  //   animatedLocation &&
  //   (animatedLocation[0] !== previousLocation[0] + stepSize[0] ||
  //     animatedLocation[1] !== previousLocation[1] + stepSize[1])
  // ) {
  //   waitingOnFrame = true
  //   window.requestAnimationFrame(() => {
  //     const movePercent = Math.min(1, (Date.now() - lastUpdateTime) / updateMs)
  //     animatedLocation = [
  //       previousLocation[0] + stepSize[0] * movePercent,
  //       previousLocation[1] + stepSize[1] * movePercent,
  //     ]
  //     waitingOnFrame = false
  //   })
  // }
</script>

<g
  class="point"
  style="z-index: {z}"
  on:mouseenter={() => dispatch('enter')}
  on:mouseleave={() => dispatch('leave')}
>
  <circle
    cx={location[0] * FLAT_SCALE}
    cy={location[1] * FLAT_SCALE}
    r={Math.max(minSize / scale, radius) * FLAT_SCALE}
    fill={color || 'white'}
  />
  {#if name && scale >= 0.9}
    <text
      x={location[0] * FLAT_SCALE}
      y={location[1] * FLAT_SCALE +
        Math.max(minSize / scale, radius) * FLAT_SCALE * -1 -
        view.height * 0.005}
      text-anchor="middle"
      font-size={(0.03 * FLAT_SCALE) / scale}
      fill={color || 'white'}
    >
      {name}
    </text>
  {/if}
</g>

<style>
  text {
    text-transform: uppercase;
    font-weight: bold;
    opacity: 0.5;
  }
</style>
