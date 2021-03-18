<script>
  export let topPercent
  export let leftPercent
  export let label
  export let color = 'white'
  export let size = 6
  export let round = false
  // console.log({ topPercent, leftPercent, size, round })
</script>

<div
  class="pointholder"
  style="--accent-color: {color}; --size: {size}px; left: {leftPercent}%; top: {topPercent}%; "
>
  {#if label}
    <div class="label minilabel">{label}</div>
  {/if}
  <div class="point" style="border-radius: {round ? '50%' : '0'};" />
</div>

<style>
  .pointholder {
    position: absolute;
  }
  .label {
    position: absolute;
    left: 0;
    top: 0.3em;
    text-align: center;
    transform: translateX(-50%) translateY(calc(var(--size) / 2));
    color: var(--accent-color);
  }
  .point {
    width: var(--size);
    height: var(--size);
    background: var(--accent-color);
    position: absolute;
    top: calc(-1 * var(--size) / 2);
    left: calc(-1 * var(--size) / 2);
  }
</style>
