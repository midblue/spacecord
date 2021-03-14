<script>
  export let label
</script>

<div class="boxholder">
  {#if label}
    <div class="label minilabel">{label}</div>
  {/if}

  <div class="box">
    <slot />
  </div>
</div>

<style>
  div {
    color: var(--ui);
  }
  .boxholder {
    position: relative;
    width: var(--main-width);
    height: var(--main-width);
    padding: 1rem;
    padding-top: 1.2rem;
  }
  .label {
    position: absolute;
    left: 1rem;
    top: 0.4em;
  }
  .box {
    position: relative;
    overflow: hidden;
    height: 100%;
    width: 100%;
    border: 1px solid var(--ui);
  }
</style>
