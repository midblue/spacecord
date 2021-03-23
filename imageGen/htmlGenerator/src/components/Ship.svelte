<script>
  import Point from './Point.svelte'
  import Path from './Path.svelte'

  import { popOver as popOverStore } from '../js/stores.js'

  export let location,
    minSize = 0.005,
    radius,
    color,
    name,
    z = 4,
    shipData

  let hovering

  let trail = []
  $: trail = [...shipData.pastLocations.map((l) => [l[0], l[1] * -1]), location]

  function enter() {
    hovering = true
    popOverStore.set({
      type: 'ship',
      name,
      location,
      members: shipData.members.length,
      cargo: shipData.cargo,
      credits: shipData.credits,
    })
  }

  function leave() {
    hovering = false
    popOverStore.set()
  }
</script>

<Point
  {location}
  {minSize}
  {radius}
  {color}
  name={shipData.status.docked ? false : name}
  {z}
  on:enter={enter}
  on:leave={leave}
/>

<Path points={trail} z={z - 1} />

<style>
</style>
