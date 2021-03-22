<script>
  import { popOver as popOverStore } from '../js/stores.js'
  let popOver
  popOverStore.subscribe((value) => (popOver = value))
</script>

{#if popOver}
  <div class="popover">
    <div class="popoverbox">
      <h3>{popOver.name}</h3>
      <div class="sub">{popOver.type}</div>
    </div>
    {#if popOver.type === 'ship'}
      <div class="popoverbox">
        <div class="datarow"><b>Members</b>: {popOver.members}</div>
        <div class="datarow"><b>Credits</b>: {popOver.credits}</div>
        <div class="datarow">
          <b>Cargo</b>
          <ul>
            {#each popOver.cargo as c}
              <li class="subrow">{c.cargoType}: {c.amount}</li>
            {/each}
          </ul>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .popover {
    font-size: 15px;
    line-height: 1.4;
    position: absolute;
    bottom: 0;
    right: 0;
    width: 300px;
    padding: 0.2em;
    z-index: 10;
    color: white;
  }
  .popoverbox {
    padding: 1em;
    background: rgba(40, 40, 40, 0.8);
    margin-bottom: 0.2em;
  }
  h3 {
    font-size: 18px;
    margin: 0;
  }
  .datarow {
    margin-bottom: 0.5em;
  }
  ul {
    margin: 0;
  }
</style>
