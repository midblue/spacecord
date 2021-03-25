<script>
  import Box from './components/Box.svelte'
  import MapViewer from './components/MapViewer.svelte'

  const gameData = APP_DATA
</script>

<Box label={'Ship Path'}>
  <MapViewer {gameData} />
</Box>

<style>
</style>
