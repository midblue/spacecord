<script>
  import { onMount } from 'svelte'

  import MapViewer from './components/MapViewer.svelte'

  import { updateMs as updateMsStore } from './js/stores.js'
  let updateMs
  updateMsStore.subscribe((value) => (updateMs = value))

  // get game data -------------------------------------------

  let gameData
  try {
    gameData = APP_DATA
    console.log(gameData)
  } catch (e) {}

  if (!gameData) {
    async function getGameData() {
      const res = await fetch('/game')
      gameData = await res.json()
      // console.log(gameData)
    }
    onMount(getGameData)

    setInterval(getGameData, updateMs)
  }
</script>

<div class="holder">
  <MapViewer {gameData} />
</div>

<style>
  .holder {
    width: 100%;
    height: 100%;
    --text-size: 12px;
  }
</style>
