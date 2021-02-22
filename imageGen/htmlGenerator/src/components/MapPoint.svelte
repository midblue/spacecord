<script>
  export let topPercent;
  export let leftPercent;
  export let label;
  export let color = 'white';
  export let size = 6;
  console.log({topPercent, leftPercent})
</script>

<div class="pointholder" style="--accent-color: {color}; --size: {size}px; left: {leftPercent}%; top: {topPercent}%; ">
  {#if label}
    <div class="label minilabel">{label}</div>
  {/if}
  <div class="point"></div>
</div>

<style>
  .pointholder {
    position: absolute;
  }
  .label {
    position: absolute;
    left: 0;
    top: .3em;
    text-align: center;
    transform: translateX(-50%);
    color: var(--accent-color);
  }
  .point {
    width: var(--size);
    height: var(--size);
    background: var(--accent-color);
    position: absolute;
    top: -2px;
    left: -2px;
  }
</style>