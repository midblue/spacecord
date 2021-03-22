<script>
  import Point from './Point.svelte'

  import { popOver as popOverStore } from '../js/stores.js'

  export let location,
    minSize = 0.005,
    radius,
    color,
    name,
    z,
    shipData

  let hovering

  function enter() {
    hovering = true
    popOverStore.set({
      type: 'ship',
      name,
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
  {name}
  {z}
  on:enter={enter}
  on:leave={leave}
/>

<style>
</style>
