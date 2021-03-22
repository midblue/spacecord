<script>
  export let topPercent
  export let leftPercent
  export let label
  export let color = 'white'
  export let size = 6
  export let round = true
</script>

<div
  class="holder"
  style="--accent-color: {color}; --size: {size}px; left: {leftPercent}%; top: {topPercent}%; "
>
  {#if label}
    <div class="label minilabel">{label}</div>
  {/if}
  <div class="pointholder">
    <div class="point" style="border-radius: {round ? '100%' : '0'};" />
  </div>
</div>

<style>
  .holder {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .label {
    position: absolute;
    left: 0;
    top: calc(0.3em + var(--size) / 2);
    text-align: center;
    transform: translateX(-50%);
    color: var(--accent-color);
  }

  .pointholder {
    position: absolute;
    top: calc(-1 * var(--size) / 2);
    left: calc(-1 * var(--size) / 2);
    width: var(--size);
    padding-top: var(--size);
  }
  .point {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--accent-color);
  }
</style>
