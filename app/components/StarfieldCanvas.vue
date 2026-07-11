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
    
    // Foreground stars are larger and shine brighter
    if (this.isForeground) {
      this.size = Math.random() * 1.5 + 0.8
      this.alpha = Math.random() * 0.5 + 0.4
      this.twinkleSpeed = Math.random() * 0.03 + 0.01
      this.isSuperStar = Math.random() < 0.08 // 8% chance to be a flare star
    } else {
      this.size = Math.random() * 0.8 + 0.2
      this.alpha = Math.random() * 0.3 + 0.1
      this.twinkleSpeed = Math.random() * 0.015 + 0.005
      this.isSuperStar = false
    }
    
    this.speedX = (Math.random() - 0.5) * 0.03
    this.speedY = Math.random() * 0.06 + 0.01
    this.targetAlpha = this.alpha
    this.twinklePhase = Math.random() * Math.PI * 2
    this.colorType = Math.floor(Math.random() * 4) // Theme colors
    this.angle = Math.random() * Math.PI * 2
    this.angleSpeed = Math.random() * 0.004 - 0.002
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
    this.x += this.speedX
    this.y += this.speedY
    this.angle += this.angleSpeed
    this.x += Math.sin(this.angle) * 0.02
    
    // Twinkling effect
    this.twinklePhase += this.twinkleSpeed
    const twinkleFactor = Math.sin(this.twinklePhase) * 0.15

    if (mouseActive && this.isForeground) {
      const dx = mouseX - this.x
      const dy = mouseY - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      const eventHorizon = 10
      const pullRadius = 220

      if (dist < eventHorizon) {
        this.reset(width, height, false)
        return
      }

      if (dist < pullRadius) {
        const force = Math.pow((pullRadius - dist) / pullRadius, 2.5) * 2.8
        const orbitForce = Math.pow((pullRadius - dist) / pullRadius, 2.0) * 1.6
        const angleToCenter = Math.atan2(dy, dx)

        this.x += (dx / dist) * force
        this.y += (dy / dist) * force
        this.x += Math.sin(angleToCenter) * orbitForce
        this.y -= Math.cos(angleToCenter) * orbitForce

        this.targetAlpha = Math.min(1.0, this.alpha + ((pullRadius - dist) / pullRadius) * 0.8)
      } else {
        this.targetAlpha = this.alpha + twinkleFactor
      }
    } else {
      this.targetAlpha = this.alpha + twinkleFactor
    }

    // Wrap alpha boundaries
    this.targetAlpha = Math.max(0.05, Math.min(1.0, this.targetAlpha))

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

    // Draw lens flares for super stars
    if (this.isSuperStar && this.targetAlpha > 0.5) {
      const flareSize = this.size * 3.5
      ctx.strokeStyle = colorPrefix + (this.targetAlpha * 0.4) + ')'
      ctx.lineWidth = 0.5
      
      ctx.beginPath()
      // Horizontal flare
      ctx.moveTo(this.x - flareSize, this.y)
      ctx.lineTo(this.x + flareSize, this.y)
      // Vertical flare
      ctx.moveTo(this.x, this.y - flareSize)
      ctx.lineTo(this.x, this.y + flareSize)
      ctx.stroke()
    }

    // Glow halo
    if (this.size > 0.8 && this.targetAlpha > 0.5) {
      ctx.shadowBlur = this.isSuperStar ? 12 : 6
      ctx.shadowColor = this.colorType === 0 ? '#10b981' : this.colorType === 1 ? '#8b5cf6' : this.colorType === 2 ? '#06b6d4' : '#ffffff'
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2)
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
    this.radius = Math.random() * 32 + 10
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

// Rotating Spiral Galaxy Layer
class Galaxy {
  constructor(x, y, radius, colorType) {
    this.x = x
    this.y = y
    this.radius = radius
    this.colorType = colorType // 0: Emerald green, 1: Violet, 2: Cyan
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = Math.random() * 0.0004 + 0.0001
    this.particles = []
    
    const particleCount = 180
    const arms = 2
    
    for (let i = 0; i < particleCount; i++) {
      const arm = i % arms
      const distanceRatio = Math.pow(Math.random(), 2) // Cluster near center
      const r = distanceRatio * this.radius
      
      // Logarithmic spiral math: angle increases with distance
      const theta = distanceRatio * Math.PI * 3.5
      const angleOffset = (arm * 2 * Math.PI) / arms
      
      this.particles.push({
        r,
        theta: theta + angleOffset + (Math.random() - 0.5) * 0.25, // Add a bit of noise/scatter
        size: Math.random() * 1.2 + 0.3,
        alpha: (1 - distanceRatio) * (Math.random() * 0.35 + 0.15) // Fades out towards edges
      })
    }
  }

  update() {
    this.rotation += this.rotationSpeed
  }

  draw(ctx) {
    const colors = ['rgba(16, 185, 129, ', 'rgba(139, 92, 246, ', 'rgba(6, 182, 212, ']
    const colorPrefix = colors[this.colorType]

    for (const p of this.particles) {
      // Calculate coordinates relative to rotating galaxy center
      const currentAngle = p.theta + this.rotation
      const px = this.x + Math.cos(currentAngle) * p.r
      const py = this.y + Math.sin(currentAngle) * p.r

      ctx.fillStyle = colorPrefix + p.alpha + ')'
      ctx.beginPath()
      ctx.arc(px, py, p.size, 0, Math.PI * 2)
      ctx.fill()
      
      // Rare glowing stars in the galaxy core
      if (p.r < this.radius * 0.2 && Math.random() < 0.01) {
        ctx.shadowBlur = 4
        ctx.shadowColor = this.colorType === 0 ? '#10b981' : this.colorType === 1 ? '#8b5cf6' : '#06b6d4'
        ctx.beginPath()
        ctx.arc(px, py, p.size * 1.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }
  }
}

// Drifting Dark Space Dust Clouds (Nebulae) to block background stars
class BlackCloud {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.reset(true)
  }

  reset(firstTime = false) {
    this.radiusX = Math.random() * 180 + 120
    this.radiusY = Math.random() * 120 + 80
    this.x = firstTime ? Math.random() * this.width : (Math.random() < 0.5 ? -this.radiusX : this.width + this.radiusX)
    this.y = Math.random() * this.height
    this.speedX = (Math.random() * 0.15 + 0.05) * (Math.random() < 0.5 ? 1 : -1)
    this.speedY = (Math.random() * 0.08 - 0.04)
    this.opacity = Math.random() * 0.65 + 0.25 // Depth of darkness
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY

    // Wrap around screen boundaries
    if (this.x < -this.radiusX * 1.5 || this.x > this.width + this.radiusX * 1.5) {
      this.reset(false)
    }
  }

  draw(ctx) {
    // Render as a soft dark radial blob blocking background light
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radiusX
    )
    
    // Core of cloud is deep and dark, fading to transparent
    gradient.addColorStop(0, 'rgba(2, 4, 3, ' + this.opacity + ')')
    gradient.addColorStop(0.5, 'rgba(4, 8, 6, ' + (this.opacity * 0.5) + ')')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radiusX, 0, Math.PI * 2)
    ctx.fill()
  }
}

let animationFrameId = null
let backgroundStars = []
let foregroundStars = []
let galaxies = []
let blackClouds = []
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
  
  // High-performance layered densities
  const bgDensity = 800  // Small distant stars
  const fgDensity = 2800 // Large shining interactive stars
  
  const targetBgCount = Math.min(600, Math.floor(area / bgDensity))
  const targetFgCount = Math.min(200, Math.floor(area / fgDensity))
  
  // Adjust background stars
  if (backgroundStars.length < targetBgCount) {
    const toAdd = targetBgCount - backgroundStars.length
    for (let i = 0; i < toAdd; i++) {
      backgroundStars.push(new Star(canvas.width, canvas.height, false))
    }
  } else {
    backgroundStars = backgroundStars.slice(0, targetBgCount)
  }

  // Adjust foreground stars
  if (foregroundStars.length < targetFgCount) {
    const toAdd = targetFgCount - foregroundStars.length
    for (let i = 0; i < toAdd; i++) {
      foregroundStars.push(new Star(canvas.width, canvas.height, true))
    }
  } else {
    foregroundStars = foregroundStars.slice(0, targetFgCount)
  }

  // Re-distribute/create galaxies
  galaxies = [
    new Galaxy(canvas.width * 0.2, canvas.height * 0.3, 140, 1), // Violet galaxy in top left
    new Galaxy(canvas.width * 0.8, canvas.height * 0.7, 160, 2)  // Cyan galaxy in bottom right
  ]

  // Re-create dark space clouds
  if (blackClouds.length === 0) {
    blackClouds = Array.from({ length: 4 }, () => new BlackCloud(canvas.width, canvas.height))
  } else {
    for (const cloud of blackClouds) {
      cloud.width = canvas.width
      cloud.height = canvas.height
    }
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
    
    // LAYER 1: Galaxies (Deep Background)
    for (const galaxy of galaxies) {
      galaxy.update()
      galaxy.draw(ctx)
    }

    // LAYER 2: Background Stars (Small, distant stars)
    for (const star of backgroundStars) {
      star.update(canvas.width, canvas.height, mouse.x, mouse.y, false) // No interactive pull on distant stars
      star.draw(ctx)
    }

    // LAYER 3: Dark Space Dust Clouds (nebula blocking background layers)
    for (const cloud of blackClouds) {
      cloud.update()
      cloud.draw(ctx)
    }

    // LAYER 4: Foreground Stars (Large, shining, interactive)
    for (const star of foregroundStars) {
      star.update(canvas.width, canvas.height, mouse.x, mouse.y, mouse.active)
      star.draw(ctx)
    }

    // LAYER 5: Gravitational bending lines (interactive)
    if (mouse.active) {
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

    // LAYER 6: Black Hole Cursor (Top Layer)
    if (mouse.active) {
      const coreRadius = 7

      // Accretion Disk Deep Glow
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

      // Swirling Accretion Ring Outlines
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

      // Singularity Core (Black Hole Center)
      ctx.fillStyle = '#020403'
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, coreRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Accretion particles
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
