<script>
  import { onDestroy } from 'svelte'
  import Path from './Path.svelte'
  import { popOver as popOverStore } from '../js/stores.js'

  export let attacker,
    defender,
    didHit,
    time,
    z = 3,
    weaponId

  const id = 'g' + Math.random()
  const endTime = 60 * 60 * 1000
  let opacity = 1,
    opacityTimer

  const updateOpacity = () => {
    opacity = Math.max(
      0.2,
      Math.min(1, 1 - ((Date.now() - time) / endTime) * 0.8),
    )
  }
  updateOpacity()
  opacityTimer = setInterval(updateOpacity, 60 * 1000)
  onDestroy(() => {
    clearInterval(opacityTimer)
  })

  function angle(x1, y1, x2, y2) {
    return ((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + 360) % 360
  }

  function degreesToUnitVector(degrees) {
    let rad = (Math.PI * degrees) / 180
    let r = 1
    return [r * Math.cos(rad), r * Math.sin(rad)]
  }

  const uvFromAToD = degreesToUnitVector(
    angle(...attacker.location, ...defender.location),
  )

  let hovering
  function enter() {
    hovering = true
    popOverStore.set({
      type: 'attack',
      name: `🚀${attacker.name} → 🚀${defender.name}`,
      location: attacker.location,
      attacker,
      defender,
      didHit,
      time,
      weaponId,
    })
  }
  function leave() {
    hovering = false
    popOverStore.set()
  }
</script>

<defs>
  <linearGradient
    {id}
    x1={uvFromAToD[0] > 0 ? 0 : 1}
    x2={uvFromAToD[0] > 0 ? 1 : 0}
    y1={uvFromAToD[1] > 0 ? 0 : 1}
    y2={uvFromAToD[1] > 0 ? 1 : 0}
    gradientUnits="objectBoundingBox"
  >
    <stop
      offset="0%"
      stop-color={didHit ? 'yellow' : 'rgba(150, 150, 50, .5'}
    />
    <stop
      offset="10%"
      stop-color={didHit ? 'orange' : 'rgba(180, 100, 50, .5'}
    />
    <stop offset="40%" stop-color={didHit ? 'red' : 'rgba(100, 50, 50, .5'} />
    <stop
      offset="70%"
      stop-color={didHit ? 'rgba(255, 0, 0, .8)' : 'rgba(50, 50, 50, .5'}
    />
    <stop
      offset="100%"
      stop-color={didHit ? 'rgba(255, 0, 0, .8)' : 'transparent'}
    />
  </linearGradient>
</defs>

<g style="opacity: {opacity};">
  <Path
    points={[attacker.location, defender.location]}
    {z}
    fade={false}
    stroke={`url(#${id})`}
    strokeWidth={(didHit ? 0.005 : 0.004) * (hovering ? 3 : 1)}
    on:enter={enter}
    on:leave={leave}
  />
</g>

<style>
</style>
