export default class ParticleSystem {
  constructor(scene) {
    this.scene = scene
    this.emitters = new Map()
    this.activeParticles = []
  }
  
  // Create dust particles
  createDustEmitter(x, y, config = {}) {
    const frequency = config.frequency || 2000 // ms between spawns
    const speed = config.speed || { min: 10, max: 30 }
    const lifespan = config.lifespan || 1000
    const quantity = config.quantity || 1
    
    const emitter = this.scene.add.particles(x, y, 'particle-dust', {
      speed: speed,
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: lifespan,
      frequency: frequency,
      quantity: quantity,
      tint: 0xcccccc
    })
    
    emitter.setScrollFactor(1)
    emitter.setDepth(50)
    
    const key = `dust-${x}-${y}`
    this.emitters.set(key, emitter)
    return emitter
  }
  
  // Create leaf particles
  createLeafEmitter(x, y, config = {}) {
    const frequency = config.frequency || 3000
    const speed = config.speed || { min: 20, max: 50 }
    const lifespan = config.lifespan || 2000
    const quantity = config.quantity || 1
    
    const emitter = this.scene.add.particles(x, y, 'particle-leaf', {
      speed: speed,
      angle: { min: 180, max: 360 },
      scale: { start: 0.4, end: 0.2 },
      alpha: { start: 0.8, end: 0 },
      lifespan: lifespan,
      frequency: frequency,
      quantity: quantity,
      gravityY: 50,
      tint: [0x4a7c3f, 0x5a8c4f, 0x6a9c5f]
    })
    
    emitter.setScrollFactor(1)
    emitter.setDepth(50)
    
    const key = `leaf-${x}-${y}`
    this.emitters.set(key, emitter)
    return emitter
  }
  
  // Create water splash particles
  createWaterSplash(x, y, config = {}) {
    const speed = config.speed || { min: 30, max: 60 }
    const lifespan = config.lifespan || 800
    const quantity = config.quantity || 5
    
    const emitter = this.scene.add.particles(x, y, 'particle-water', {
      speed: speed,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: lifespan,
      quantity: quantity,
      tint: 0x4a6a9f,
      emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 10), quantity: quantity }
    })
    
    emitter.setScrollFactor(1)
    emitter.setDepth(50)
    
    // One-time burst
    emitter.explode(quantity, x, y)
    
    this.scene.time.delayedCall(lifespan, () => {
      emitter.destroy()
    })
    
    return emitter
  }
  
  // Create fire particles
  createFireEmitter(x, y, config = {}) {
    const speed = config.speed || { min: 20, max: 40 }
    const lifespan = config.lifespan || 500
    const frequency = config.frequency || 50
    
    const emitter = this.scene.add.particles(x, y, 'particle-fire', {
      speed: { min: speed.min, max: speed.max },
      angle: { min: 270 - 30, max: 270 + 30 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: lifespan,
      frequency: frequency,
      quantity: 1,
      gravityY: -30,
      tint: [0xff6b00, 0xffaa00, 0xffff00]
    })
    
    emitter.setScrollFactor(1)
    emitter.setDepth(50)
    
    const key = `fire-${x}-${y}`
    this.emitters.set(key, emitter)
    return emitter
  }
  
  // Spawn random particles in area
  spawnRandomParticles(centerX, centerY, radius, type = 'dust', count = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * radius
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance
      
      switch(type) {
        case 'dust':
          this.createDustEmitter(x, y, { frequency: 5000, quantity: 1 })
          break
        case 'leaf':
          this.createLeafEmitter(x, y, { frequency: 4000, quantity: 1 })
          break
      }
    }
  }
  
  // Stop and remove emitter
  stopEmitter(key) {
    const emitter = this.emitters.get(key)
    if (emitter) {
      emitter.stop()
      emitter.destroy()
      this.emitters.delete(key)
    }
  }
  
  // Stop all emitters
  stopAll() {
    this.emitters.forEach((emitter, key) => {
      emitter.stop()
      emitter.destroy()
    })
    this.emitters.clear()
  }
  
  destroy() {
    this.stopAll()
  }
}

