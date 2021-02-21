<script>
  import { onMount } from 'svelte';

  onMount(() => {
    const canvas = document.getElementById("starfield"),
      ctx = canvas.getContext("2d"),
      stars = 100
      // ,
      // color = getComputedStyle(document.documentElement)
      //   .getPropertyValue('--ui')
    for (let i = 0; i < stars; i++) {
      let x = Math.random() * canvas.offsetWidth
      let y = Math.random() * canvas.offsetHeight
      ctx.fillStyle = 'white' //color
      const size = Math.random() > .3 ? 1:2
      ctx.fillRect(x,y,size,size)
    }
    // ctx.fillStyle ='white'
    // ctx.font = '20px monospace';
    // ctx.fillText(name, 10, 50);
  })
</script>


<canvas id="starfield" width="600" height="600"></canvas>


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