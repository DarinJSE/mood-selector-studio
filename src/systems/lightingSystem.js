export default class LightingSystem {
  constructor(scene) {
    this.scene = scene
    this.currentHour = 12
    this.timeScale = 1.0
    this.paused = false
    this.overlay = null
    
    // Throttle updates to prevent flicker
    this.lastUpdateTime = 0
    this.updateThrottle = 50 // ms between lighting updates
    
    this.createOverlay()
    this.updateLighting()
  }
  
  createOverlay() {
    const { width, height } = this.scene.cameras.main
    this.overlay = this.scene.add.rectangle(
      width / 2, height / 2,
      width, height,
      0x000000, 0
    )
    this.overlay.setScrollFactor(0)
    this.overlay.setDepth(10000)
    this.overlayWidth = width
    this.overlayHeight = height
  }
  
  setTime(hour) {
    this.currentHour = Phaser.Math.Clamp(hour, 0, 24)
    this.updateLighting()
  }
  
  setTimeScale(scale) {
    this.timeScale = scale
  }
  
  setPaused(paused) {
    this.paused = paused
  }
  
  update(delta) {
    if (this.paused) return
    
    // Advance time
    const hoursPerSecond = 1 / 60 / 60 * this.timeScale
    const deltaSeconds = delta / 1000
    this.currentHour += hoursPerSecond * deltaSeconds
    
    if (this.currentHour >= 24) {
      this.currentHour -= 24
    }
    
    // Throttle lighting updates to prevent flicker
    const now = Date.now()
    if (now - this.lastUpdateTime > this.updateThrottle) {
      this.lastUpdateTime = now
      this.updateLighting()
    }
  }
  
  updateLighting() {
    if (!this.overlay) return
    
    let intensity = 0
    let color = 0x000000
    
    if (this.currentHour >= 8 && this.currentHour < 18) {
      // Day
      intensity = 0
      color = 0xffffff
    } else if (this.currentHour >= 6 && this.currentHour < 8) {
      // Dawn
      const t = (this.currentHour - 6) / 2
      intensity = Phaser.Math.Linear(0.6, 0, t)
      const orange = Phaser.Display.Color.ValueToColor(0xff6b47)
      const white = Phaser.Display.Color.ValueToColor(0xffffff)
      const r = Phaser.Math.Linear(orange.r, white.r, t)
      const g = Phaser.Math.Linear(orange.g, white.g, t)
      const b = Phaser.Math.Linear(orange.b, white.b, t)
      color = Phaser.Display.Color.GetColor(r, g, b)
    } else if (this.currentHour >= 18 && this.currentHour < 20) {
      // Dusk
      const t = (this.currentHour - 18) / 2
      intensity = Phaser.Math.Linear(0, 0.7, t)
      const white = Phaser.Display.Color.ValueToColor(0xffffff)
      const orange = Phaser.Display.Color.ValueToColor(0xff6b47)
      const r = Phaser.Math.Linear(white.r, orange.r, t)
      const g = Phaser.Math.Linear(white.g, orange.g, t)
      const b = Phaser.Math.Linear(white.b, orange.b, t)
      color = Phaser.Display.Color.GetColor(r, g, b)
    } else {
      // Night
      intensity = 0.7
      color = 0x1a1a3a
    }
    
    // Apply overlay with smooth transition
    const alpha = intensity
    this.overlay.setFillStyle(color, alpha)
    
    // Emit event (throttled)
    this.scene.events.emit('time:changed', { hour: this.currentHour })
  }
  
  getCurrentHour() {
    return this.currentHour
  }
  
  destroy() {
    if (this.overlay) {
      this.overlay.destroy()
      this.overlay = null
    }
  }
}
