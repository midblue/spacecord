<script>
  import Point from './Point.svelte'

  export let location,
    minSize = 0.003,
    radius,
    color = 'yellow',
    name,
    z = 3
</script>

<Point {location} {minSize} {radius} {color} {name} {z} />

<style>
</style>
