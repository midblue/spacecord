<script>
  export let label;
</script>

<div class="boxholder">
  {#if label}
    <div class="label minilabel">{label}</div>
  {/if}

  <div class="box">
    <slot></slot>
  </div>
</div>

<style>
  .boxholder {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 1em;
  }
  .label {
    position: absolute;
    left: 1rem;
    top: .3em;
  }
  .box {
    position: relative;
    overflow: hidden;
    height: 100%;
    border: 1px solid var(--ui);
  }
</style>