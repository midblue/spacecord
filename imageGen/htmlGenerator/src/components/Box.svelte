<script>
  import { onMount } from 'svelte'

  export let label
  export let label2
  export let label3
  export let label4

  let boxEl

  onMount(async () => {})
</script>

<div class="boxholder">
  <div class="box" bind:this={boxEl}>
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
    width: calc(var(--main-width) - 1.2rem * 2);
    height: calc(var(--main-height) - 1.2rem * 2);
    margin: 1.2rem;
  }
  .box {
    position: relative;
  }
  .label {
    position: absolute;
    left: 0;
    top: -1.2em;
  }
  .toprightlabel {
    position: absolute;
    right: 0;
    top: -1.2em;
  }
  .bottomleftlabel {
    position: absolute;
    left: 0;
    bottom: -1.2em;
  }
  .bottomrightlabel {
    position: absolute;
    right: 0;
    bottom: -1.2em;
  }
  .box {
    position: relative;
    overflow: hidden;
    height: 100%;
    width: 100%;
    border: 1px solid var(--ui);
  }
</style>
