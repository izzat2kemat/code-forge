<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)

class Star {
  constructor(width, height) {
    this.reset(width, height, true)
  }

  reset(width, height, firstTime = false) {
    this.x = Math.random() * width
    this.y = firstTime ? Math.random() * height : 0
    this.size = Math.random() * 1.4 + 0.3 // Star size
    this.speedX = (Math.random() - 0.5) * 0.04 // Drift horizontal
    this.speedY = Math.random() * 0.08 + 0.02 // Drift vertical
    this.alpha = Math.random() * 0.4 + 0.1 // Random base brightness
    this.targetAlpha = this.alpha
    this.colorType = Math.floor(Math.random() * 4) // Theme colors
    this.angle = Math.random() * Math.PI * 2
    this.angleSpeed = Math.random() * 0.005 - 0.0025
  }

  getColor() {
    const colors = [
      'rgba(16, 185, 129, ',  // Emerald Green
      'rgba(139, 92, 246, ',  // Violet
      'rgba(6, 182, 212, ',   // Neon Cyan
      'rgba(255, 255, 255, '  // Starlight White
    ]
    return colors[this.colorType]
  }

  update(width, height, mouseX, mouseY, mouseActive) {
    // Apply speed and wobble
    this.x += this.speedX
    this.y += this.speedY
    this.angle += this.angleSpeed
    this.x += Math.sin(this.angle) * 0.02

    // Black hole gravity interaction
    if (mouseActive) {
      const dx = mouseX - this.x
      const dy = mouseY - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      const eventHorizon = 10    // Swallowed radius
      const pullRadius = 220     // Gravitational pull radius

      if (dist < eventHorizon) {
        // Star is sucked in and swallowed! Re-spawns at the top
        this.reset(width, height, false)
        return
      }

      if (dist < pullRadius) {
        // Gravitational pull gets stronger closer to the black hole (exponential pull)
        const force = Math.pow((pullRadius - dist) / pullRadius, 2.5) * 2.5
        
        // Orbital/spiral spin around the black hole
        const orbitForce = Math.pow((pullRadius - dist) / pullRadius, 2.0) * 1.5
        const angleToCenter = Math.atan2(dy, dx)

        // Pull inward
        this.x += (dx / dist) * force
        this.y += (dy / dist) * force
        
        // Spin orbit (tangential force)
        this.x += Math.sin(angleToCenter) * orbitForce
        this.y -= Math.cos(angleToCenter) * orbitForce

        // Shine bright as it heats up near the event horizon
        this.targetAlpha = Math.min(1.0, this.alpha + ((pullRadius - dist) / pullRadius) * 0.7)
      } else {
        this.targetAlpha = this.alpha
      }
    } else {
      this.targetAlpha = this.alpha
    }

    // Smoothly interpolate brightness
    this.targetAlpha += (this.targetAlpha - this.alpha) * 0.1

    // Recycle stars that move off screen
    if (this.y > height || this.x < 0 || this.x > width) {
      this.reset(width, height, false)
    }
  }

  draw(ctx) {
    const colorPrefix = this.getColor()
    ctx.fillStyle = colorPrefix + this.targetAlpha + ')'
    
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()

    if (this.size > 0.9 && this.targetAlpha > 0.6) {
      ctx.shadowBlur = 5
      ctx.shadowColor = this.colorType === 0 ? '#10b981' : this.colorType === 1 ? '#8b5cf6' : this.colorType === 2 ? '#06b6d4' : '#ffffff'
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }
  }
}

// Swirling dust orbiting the black hole accretion disk
class AccretionParticle {
  constructor() {
    this.reset()
  }

  reset() {
    this.angle = Math.random() * Math.PI * 2
    this.radius = Math.random() * 30 + 10 // distance from core
    this.speed = Math.random() * 0.05 + 0.03 // orbit speed
    this.size = Math.random() * 1.5 + 0.5
    this.alpha = Math.random() * 0.7 + 0.3
    this.colorType = Math.floor(Math.random() * 3) // Emerald, Violet, Cyan
  }

  update() {
    this.angle += this.speed
    this.radius -= 0.12 // spiral slowly inwards

    if (this.radius < 4) {
      this.reset()
    }
  }

  draw(ctx, mx, my) {
    const x = mx + Math.cos(this.angle) * this.radius
    const y = my + Math.sin(this.angle) * this.radius
    const colors = ['rgba(16, 185, 129, ', 'rgba(139, 92, 246, ', 'rgba(6, 182, 212, ']
    
    ctx.fillStyle = colors[this.colorType] + this.alpha + ')'
    ctx.beginPath()
    ctx.arc(x, y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

let animationFrameId = null
let stars = []
let accretionParticles = []
let accretionAngle = 0
const mouse = { x: 0, y: 0, active: false }

const handleMouseMove = (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
  mouse.active = true
}

const handleMouseLeave = () => {
  mouse.active = false
}

const handleResize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  const area = canvas.width * canvas.height
  const starDensity = 1200
  const targetStarCount = Math.min(1000, Math.floor(area / starDensity))
  
  if (stars.length < targetStarCount) {
    const toAdd = targetStarCount - stars.length
    for (let i = 0; i < toAdd; i++) {
      stars.push(new Star(canvas.width, canvas.height))
    }
  } else if (stars.length > targetStarCount) {
    stars = stars.slice(0, targetStarCount)
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  
  handleResize()
  
  // Generate accretion disk particles (about 25 dust particles)
  accretionParticles = Array.from({ length: 25 }, () => new AccretionParticle())
  
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseleave', handleMouseLeave)
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Increment swirling angle
    accretionAngle += 0.04
    
    // Draw Gravitational Lensing / Bent Constellations
    if (mouse.active) {
      for (const star of stars) {
        const dx = mouse.x - star.x
        const dy = mouse.y - star.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const lineMaxDist = 140
        
        if (dist < lineMaxDist) {
          const lineAlpha = (1 - dist / lineMaxDist) * 0.18
          const colorPrefix = star.getColor()
          ctx.strokeStyle = colorPrefix + lineAlpha + ')'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(mouse.x, mouse.y)
          ctx.lineTo(star.x, star.y)
          ctx.stroke()
        }
      }
    }
    
    // Update and draw all background stars
    for (const star of stars) {
      star.update(canvas.width, canvas.height, mouse.x, mouse.y, mouse.active)
      star.draw(ctx)
    }

    // Draw Black Hole Cursor
    if (mouse.active) {
      const coreRadius = 7

      // 1. Accretion Disk Deep Glow
      const glowGrad = ctx.createRadialGradient(
        mouse.x, mouse.y, coreRadius,
        mouse.x, mouse.y, 50
      )
      glowGrad.addColorStop(0, 'rgba(139, 92, 246, 0.45)') // Violet Event Horizon
      glowGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.25)') // Cyan Swirl
      glowGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.06)') // Emerald Outer Ring
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, 50, 0, Math.PI * 2)
      ctx.fill()

      // 2. Swirling Accretion Ring Outlines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, coreRadius + 4, accretionAngle, accretionAngle + Math.PI * 1.4)
      ctx.stroke()

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)'
      ctx.lineWidth = 1.0
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, coreRadius + 8, -accretionAngle * 0.8, -accretionAngle * 0.8 + Math.PI * 1.2)
      ctx.stroke()

      // 3. Singularity Core (Black Hole Center)
      ctx.fillStyle = '#020403' // Darker than body background
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)' // Violet outline
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, coreRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // 4. Update and draw swirling dust particles
      for (const p of accretionParticles) {
        p.update()
        p.draw(ctx, mouse.x, mouse.y)
      }
    }
    
    animationFrameId = requestAnimationFrame(animate)
  }
  
  animate()
})

onUnmounted(() => {
  // Clean up
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseleave', handleMouseLeave)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="starfield-canvas" />
</template>

<style scoped>
.starfield-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
}
</style>
