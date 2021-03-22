<script>
  import { onMount, tick } from 'svelte'
  let width = 0,
    height = 0

  onMount(async () => {
    const canvas = document.getElementById('starfield'),
      ctx = canvas.getContext('2d')
    // ,
    // color = getComputedStyle(document.documentElement)
    //   .getPropertyValue('--ui')

    width = window.innerWidth
    height = window.innerHeight
    const stars = Math.round(innerWidth / 3)
    await tick()

    for (let i = 0; i < stars; i++) {
      let x = Math.random() * canvas.offsetWidth
      let y = Math.random() * canvas.offsetHeight
      ctx.fillStyle = 'rgba(255,255,255,.7)' //color
      const size = Math.random() > 0.3 ? 1 : 2
      ctx.fillRect(x, y, size, size)
    }
  })
</script>

<canvas id="starfield" {width} {height} />

<style>
  canvas {
    background: black;
    /* var(--bg); */
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;
  }
</style>
