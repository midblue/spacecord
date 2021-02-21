<script>
  export let topPercent;
  export let leftPercent;
  export let label;
  export let color = 'white';
  console.log({topPercent, leftPercent})
</script>

<div class="pointholder" style="--accent-color: {color}; left: {leftPercent}%; top: {topPercent}%; ">
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
    width: 6px;
    height: 6px;
    background: var(--accent-color);
    position: absolute;
    top: -2px;
    left: -2px;
  }
</style>