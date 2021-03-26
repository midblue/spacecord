<script>
  import Box from './components/Box.svelte'
  import MapViewer from './components/MapViewer.svelte'

  const gameData = APP_DATA
</script>

<Box
  label={'Area Scan | ' + gameData.label}
  label4={`Center: ${Math.round(gameData.center[0] * 100000) / 100000}, ${
    Math.round(gameData.center[1] * 100000) / 100000
  } AU`}
>
  <MapViewer {gameData} />
</Box>

<style>
</style>
