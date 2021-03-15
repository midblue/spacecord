<script>
  export let label
  export let label2
  export let label3
  export let label4
</script>

<div class="boxholder">
  <div class="box">
    <slot />
  </div>

  {#if label}
    <div class="label minilabel">{label}</div>
  {/if}

  {#if label2}
    <div class="toprightlabel minilabel">{label2}</div>
  {/if}

  {#if label3}
    <div class="bottomleftlabel minilabel">{label3}</div>
  {/if}

  {#if label4}
    <div class="bottomrightlabel minilabel">{label4}</div>
  {/if}
</div>

<style>
  div {
    color: var(--ui);
  }
  .boxholder {
    position: relative;
    width: var(--main-width);
    height: var(--main-width);
    padding: 1.2rem;
  }
  .label {
    position: absolute;
    left: 1.2rem;
    top: 0.4em;
  }
  .toprightlabel {
    position: absolute;
    right: 1.2rem;
    top: 0.4em;
  }
  .bottomleftlabel {
    position: absolute;
    left: 1.2rem;
    bottom: 0.4em;
  }
  .bottomrightlabel {
    position: absolute;
    right: 1.2rem;
    bottom: 0.4em;
  }
  .box {
    position: relative;
    overflow: hidden;
    height: 100%;
    width: 100%;
    border: 1px solid var(--ui);
  }
</style>
