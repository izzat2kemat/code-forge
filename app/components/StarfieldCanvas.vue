<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)

class Star {
  constructor(width, height, isForeground = false) {
    this.isForeground = isForeground
    this.reset(width, height, true)
  }

  reset(width, height, firstTime = false) {
    this.x = Math.random() * width
    this.y = firstTime ? Math.random() * height : 0
    
    // Twinkling variables
    this.twinklePhase = Math.random() * Math.PI * 2
    this.twinkleSpeed = Math.random() * 0.02 + 0.008

    // Distinguish between normal stars and super bright shining stars (like the image)
    this.isBrightGiant = Math.random() < 0.08 // 8% are bright shining giants
    
    if (this.isBrightGiant) {
      this.size = Math.random() * 1.5 + 1.2 // 1.2px to 2.7px
      this.alpha = Math.random() * 0.35 + 0.55 // 0.55 to 0.9 base brightness
    } else {
      this.size = Math.random() * 0.7 + 0.2 // 0.2px to 0.9px
      this.alpha = Math.random() * 0.25 + 0.1 // 0.1 to 0.35 base brightness
    }
    
    this.targetAlpha = this.alpha
    this.speedX = (Math.random() - 0.5) * 0.03 // Slow horizontal drift
    this.speedY = Math.random() * 0.05 + 0.015 // Slow vertical drift
    this.colorType = Math.floor(Math.random() * 4) // Theme colors
    this.angle = Math.random() * Math.PI * 2
    this.angleSpeed = Math.random() * 0.003 - 0.0015
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
    // Natural drift
    this.x += this.speedX
    this.y += this.speedY
    this.angle += this.angleSpeed
    this.x += Math.sin(this.angle) * 0.02
    
    // Twinkle modulation
    this.twinklePhase += this.twinkleSpeed

    // Black hole gravity interaction
    if (mouseActive) {
      const dx = mouseX - this.x
      const dy = mouseY - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      const eventHorizon = 10    // Ingestion radius
      const pullRadius = 220     // Gravitational pull radius

      if (dist < eventHorizon) {
        this.reset(width, height, false)
        return
      }

      if (dist < pullRadius) {
        const force = Math.pow((pullRadius - dist) / pullRadius, 2.5) * 2.5
        const orbitForce = Math.pow((pullRadius - dist) / pullRadius, 2.0) * 1.5
        const angleToCenter = Math.atan2(dy, dx)

        this.x += (dx / dist) * force
        this.y += (dy / dist) * force
        
        this.x += Math.sin(angleToCenter) * orbitForce
        this.y -= Math.cos(angleToCenter) * orbitForce

        this.targetAlpha = Math.min(1.0, this.alpha + ((pullRadius - dist) / pullRadius) * 0.7)
      } else {
        this.targetAlpha = this.alpha
      }
    } else {
      this.targetAlpha = this.alpha
    }

    this.targetAlpha += (this.targetAlpha - this.alpha) * 0.1

    if (this.y > height || this.x < 0 || this.x > width) {
      this.reset(width, height, false)
    }
  }

  draw(ctx) {
    const colorPrefix = this.getColor()
    const twinkle = Math.sin(this.twinklePhase) * 0.12
    const currentAlpha = Math.max(0.05, Math.min(1.0, this.targetAlpha + twinkle))
    
    ctx.fillStyle = colorPrefix + currentAlpha + ')'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()

    // Draw large soft halo for bright shining stars (like the reference image)
    if (this.isBrightGiant) {
      const haloRadius = this.size * (Math.sin(this.twinklePhase) * 2 + 10) // Pulsing halo size
      
      const grad = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, haloRadius
      )
      
      let glowColor = 'rgba(255, 255, 255, ' // Default white glow
      if (this.colorType === 0) glowColor = 'rgba(16, 185, 129, ' // Green glow
      else if (this.colorType === 1) glowColor = 'rgba(139, 92, 246, ' // Violet glow
      else if (this.colorType === 2) glowColor = 'rgba(6, 182, 212, ' // Cyan glow
      
      grad.addColorStop(0, glowColor + (currentAlpha * 0.3) + ')')
      grad.addColorStop(0.3, glowColor + (currentAlpha * 0.08) + ')')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(this.x, this.y, haloRadius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// Dark reddish-black organic nebula clouds
class DarkNebula {
  constructor(width, height) {
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.baseRadius = Math.random() * 180 + 150 // Large size
    this.radius = this.baseRadius
    this.speedX = (Math.random() - 0.5) * 0.015 // Ultra slow movement
    this.speedY = (Math.random() - 0.5) * 0.015
    this.pulsePhase = Math.random() * Math.PI * 2
    this.pulseSpeed = Math.random() * 0.001 + 0.0005
  }

  update(width, height) {
    this.x += this.speedX
    this.y += this.speedY
    this.pulsePhase += this.pulseSpeed
    this.radius = this.baseRadius + Math.sin(this.pulsePhase) * 12

    // Boundary wrapping
    if (this.x < -this.radius) this.x = width + this.radius
    if (this.x > width + this.radius) this.x = -this.radius
    if (this.y < -this.radius) this.y = height + this.radius
    if (this.y > height + this.radius) this.y = -this.radius
  }

  draw(ctx) {
    const grad = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius
    )
    // Dark brown/red/black smoky gradient (like the reference image)
    grad.addColorStop(0, 'rgba(12, 4, 6, 0.75)') // Core
    grad.addColorStop(0.4, 'rgba(8, 3, 4, 0.55)')  // Mid body
    grad.addColorStop(0.7, 'rgba(4, 1, 2, 0.25)')  // Soft edge
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)')        // Transparent

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Swirling dust orbiting the black hole accretion disk
class AccretionParticle {
  constructor() {
    this.reset()
  }

  reset() {
    this.angle = Math.random() * Math.PI * 2
    this.radius = Math.random() * 30 + 10
    this.speed = Math.random() * 0.05 + 0.03
    this.size = Math.random() * 1.5 + 0.5
    this.alpha = Math.random() * 0.7 + 0.3
    this.colorType = Math.floor(Math.random() * 3)
  }

  update() {
    this.angle += this.speed
    this.radius -= 0.12

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
let backgroundStars = []
let foregroundStars = []
let darkClouds = []
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
  
  const targetBgCount = Math.floor(targetStarCount * 0.8)
  const targetFgCount = Math.floor(targetStarCount * 0.2)

  // Background stars resize
  if (backgroundStars.length < targetBgCount) {
    const toAdd = targetBgCount - backgroundStars.length
    for (let i = 0; i < toAdd; i++) {
      backgroundStars.push(new Star(canvas.width, canvas.height, false))
    }
  } else if (backgroundStars.length > targetBgCount) {
    backgroundStars = backgroundStars.slice(0, targetBgCount)
  }

  // Foreground stars resize
  if (foregroundStars.length < targetFgCount) {
    const toAdd = targetFgCount - foregroundStars.length
    for (let i = 0; i < toAdd; i++) {
      foregroundStars.push(new Star(canvas.width, canvas.height, true))
    }
  } else if (foregroundStars.length > targetFgCount) {
    foregroundStars = foregroundStars.slice(0, targetFgCount)
  }

  // Nebula clouds count
  const targetCloudCount = Math.min(6, Math.max(3, Math.floor(area / 400000)))
  if (darkClouds.length < targetCloudCount) {
    const toAdd = targetCloudCount - darkClouds.length
    for (let i = 0; i < toAdd; i++) {
      darkClouds.push(new DarkNebula(canvas.width, canvas.height))
    }
  } else if (darkClouds.length > targetCloudCount) {
    darkClouds = darkClouds.slice(0, targetCloudCount)
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  
  handleResize()
  
  accretionParticles = Array.from({ length: 25 }, () => new AccretionParticle())
  
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseleave', handleMouseLeave)
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    accretionAngle += 0.04
    
    // 1. Draw Background Stars (deep space)
    for (const star of backgroundStars) {
      star.update(canvas.width, canvas.height, mouse.x, mouse.y, mouse.active)
      star.draw(ctx)
    }

    // 2. Draw Dark Nebula/Black Clouds (obscures background stars)
    for (const cloud of darkClouds) {
      cloud.update(canvas.width, canvas.height)
      cloud.draw(ctx)
    }

    // 3. Draw Foreground Stars (shining in front of clouds)
    for (const star of foregroundStars) {
      star.update(canvas.width, canvas.height, mouse.x, mouse.y, mouse.active)
      star.draw(ctx)
    }

    // 4. Draw Gravitational Lensing Constellation Lines
    if (mouse.active) {
      // Connect to nearest foreground stars for lensing effect
      for (const star of foregroundStars) {
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

    // 5. Draw Black Hole Cursor
    if (mouse.active) {
      const coreRadius = 7

      const glowGrad = ctx.createRadialGradient(
        mouse.x, mouse.y, coreRadius,
        mouse.x, mouse.y, 50
      )
      glowGrad.addColorStop(0, 'rgba(139, 92, 246, 0.45)')
      glowGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.25)')
      glowGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.06)')
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, 50, 0, Math.PI * 2)
      ctx.fill()

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

      ctx.fillStyle = '#020403'
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, coreRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

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
