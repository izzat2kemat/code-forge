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
    this.size = Math.random() * 1.5 + 0.3 // Star size
    this.speedX = (Math.random() - 0.5) * 0.05 // Drift horizontal
    this.speedY = Math.random() * 0.08 + 0.02 // Drift vertical
    this.alpha = Math.random() * 0.4 + 0.1 // Random base brightness
    this.targetAlpha = this.alpha
    this.colorType = Math.floor(Math.random() * 4) // Theme colors
    this.angle = Math.random() * Math.PI * 2
    this.angleSpeed = Math.random() * 0.005 - 0.0025
  }

  getColor() {
    // Return CSS color prefix based on type
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
    this.x += Math.sin(this.angle) * 0.04

    // Interaction with cursor
    if (mouseActive) {
      const dx = mouseX - this.x
      const dy = mouseY - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const interactionRadius = 160

      if (dist < interactionRadius) {
        // Soft pull towards the mouse
        const force = (interactionRadius - dist) / interactionRadius
        this.x += (dx / dist) * force * 0.3
        this.y += (dy / dist) * force * 0.3
        // Shine brighter
        this.targetAlpha = Math.min(0.95, this.alpha + force * 0.6)
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
    
    // Draw star
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()

    // Add glowing halo to brighter stars
    if (this.size > 1.0 && this.targetAlpha > 0.6) {
      ctx.shadowBlur = 6
      ctx.shadowColor = this.colorType === 0 ? '#10b981' : this.colorType === 1 ? '#8b5cf6' : this.colorType === 2 ? '#06b6d4' : '#ffffff'
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0 // reset shadow
    }
  }
}

let animationFrameId = null
let stars = []
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
  
  // Recalculate number of stars based on canvas surface area
  const area = canvas.width * canvas.height
  const starDensity = 1200 // pixels per star (lower = more stars)
  const targetStarCount = Math.min(1000, Math.floor(area / starDensity))
  
  // Adjust star count dynamically without resetting existing stars
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
  
  // Set initial dimensions
  handleResize()
  
  // Generate initial stars
  const area = canvas.width * canvas.height
  const starDensity = 1200
  const starCount = Math.min(1000, Math.floor(area / starDensity))
  stars = Array.from({ length: starCount }, () => new Star(canvas.width, canvas.height))
  
  // Event listeners
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseleave', handleMouseLeave)
  
  // Main Animation Loop
  const animate = () => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw mouse light reflection
    if (mouse.active) {
      const gradient = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 160
      )
      // Soft atmospheric neon lights reflecting on background
      gradient.addColorStop(0, 'rgba(13, 24, 19, 0.35)') // Center slightly emerald/dark
      gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.02)') // Green hue
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, 160, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Draw constellation lines (Mouse-to-Star connection)
    if (mouse.active) {
      for (const star of stars) {
        const dx = mouse.x - star.x
        const dy = mouse.y - star.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const lineMaxDist = 120
        
        if (dist < lineMaxDist) {
          const lineAlpha = (1 - dist / lineMaxDist) * 0.15
          // Faint, color matching line linking mouse to star
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
    
    // Update and draw all stars
    for (const star of stars) {
      star.update(canvas.width, canvas.height, mouse.x, mouse.y, mouse.active)
      star.draw(ctx)
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
