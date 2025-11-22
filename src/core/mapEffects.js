import worldConfig from './worldConfig.js'

export default class MapEffects {
  constructor(scene) {
    this.scene = scene
    this.parallaxLayers = []
    this.animatedTiles = new Map()
    this.interactiveObjects = []
    this.tileAnimationTimers = new Map()
    this.animatedProps = []
    
    this.createParallaxLayers()
    this.setupTileAnimations()
  }
  
  // Create parallax background layers
  createParallaxLayers() {
    const worldWidth = worldConfig.getWorldWidthPx()
    const worldHeight = worldConfig.getWorldHeightPx()
    
    // Layer 1: Far background (hills/sky) - scrolls very slowly
    const farBg = this.scene.add.tileSprite(0, 0, worldWidth, worldHeight, 'parallax-far')
    farBg.setOrigin(0, 0)
    farBg.setScrollFactor(0.1)
    farBg.setDepth(-100)
    farBg.setTint(0x87ceeb) // Sky blue
    this.parallaxLayers.push({ sprite: farBg, speed: 0.1 })
    
    // Layer 2: Mid background (clouds/hills) - scrolls slowly
    const midBg = this.scene.add.tileSprite(0, 0, worldWidth, worldHeight, 'parallax-mid')
    midBg.setOrigin(0, 0)
    midBg.setScrollFactor(0.3)
    midBg.setDepth(-50)
    midBg.setTint(0xa0a0a0) // Light gray for clouds
    this.parallaxLayers.push({ sprite: midBg, speed: 0.3 })
    
    // Layer 3: Near background (trees/buildings) - scrolls moderately
    const nearBg = this.scene.add.tileSprite(0, 0, worldWidth, worldHeight, 'parallax-near')
    nearBg.setOrigin(0, 0)
    nearBg.setScrollFactor(0.6)
    nearBg.setDepth(-10)
    nearBg.setTint(0x4a7c3f) // Green for trees
    this.parallaxLayers.push({ sprite: nearBg, speed: 0.6 })
    
    // Set display size to cover world
    this.parallaxLayers.forEach(layer => {
      if (layer.sprite) {
        layer.sprite.setDisplaySize(worldWidth, worldHeight)
      }
    })
  }
  
  // Setup tile animations
  setupTileAnimations() {
    // Animate water tiles (tile ID 4)
    this.animateWaterTiles()
    
    // Animate fire tiles if any
    this.animateFireTiles()
  }
  
  animateWaterTiles() {
    // Find all water tiles and animate them
    const waterTileIds = [4] // Water tile ID
    
    // Create animation timer for water tiles
    this.scene.time.addEvent({
      delay: 500,
      callback: () => {
        this.updateWaterTiles()
      },
      loop: true
    })
  }
  
  updateWaterTiles() {
    // This will be called by chunk manager when chunks load
    // For now, we'll animate via tint changes
    if (this.scene.chunkManager) {
      this.scene.chunkManager.loadedChunks.forEach(chunk => {
        if (chunk.layers.world) {
          // Animate water tiles by changing tint slightly
          const tiles = chunk.layers.world.getTilesWithin(0, 0, chunk.layers.world.width, chunk.layers.world.height)
          tiles.forEach(tile => {
            if (tile.index === 4) { // Water tile
              const time = Date.now() / 1000
              const tint = Phaser.Display.Color.GetColor(
                58 + Math.sin(time * 2) * 10,
                90 + Math.sin(time * 2.5) * 10,
                143 + Math.sin(time * 3) * 10
              )
              // Note: Phaser tiles don't support tint directly, so we'll use a different approach
            }
          })
        }
      })
    }
  }
  
  animateFireTiles() {
    // Fire animation would go here if fire tiles exist
  }
  
  // Create animated props (trees, etc.)
  createAnimatedProp(x, y, type = 'tree') {
    let prop
    
    switch(type) {
      case 'tree':
        prop = this.scene.add.sprite(x, y, 'tree')
        prop.setDepth(y)
        
        // Swaying animation
        this.scene.tweens.add({
          targets: prop,
          angle: { from: -2, to: 2 },
          duration: 2000 + Math.random() * 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
        break
        
      case 'rock':
        prop = this.scene.add.sprite(x, y, 'rock')
        prop.setDepth(y)
        break
        
      default:
        prop = this.scene.add.rectangle(x, y, 32, 32, 0x888888)
        prop.setDepth(y)
    }
    
    // Keep track for depth updates
    if (!this.animatedProps) this.animatedProps = []
    this.animatedProps.push(prop)
    // Mark prop for Y-based depth sorting
    prop.depthFromY = true
    prop.depthOffset = 0

    return prop
  }
  
  // Create interactive object
  createInteractiveObject(x, y, type = 'chest', config = {}) {
    let obj
    
    switch(type) {
      case 'chest':
        obj = this.scene.add.rectangle(x, y, 24, 24, 0x8b6f47)
        obj.setStrokeStyle(2, 0xffd700)
        obj.setDepth(y)
        obj.type = 'chest'
        obj.interacted = false
        break
        
      case 'door':
        obj = this.scene.add.rectangle(x, y, 32, 48, 0x4a2a1a)
        obj.setStrokeStyle(2, 0x8b6f47)
        obj.setDepth(y)
        obj.type = 'door'
        obj.interacted = false
        break
        
      case 'sign':
        obj = this.scene.add.rectangle(x, y, 20, 20, 0xffffff)
        obj.setStrokeStyle(2, 0x000000)
        obj.setDepth(y)
        obj.type = 'sign'
        obj.message = config.message || 'Read sign'
        break
        
      default:
        obj = this.scene.add.rectangle(x, y, 32, 32, 0x666666)
        obj.setDepth(y)
        obj.type = type
    }
    
    // Make interactive
    obj.setInteractive()
    obj.on('pointerdown', () => {
      this.handleInteraction(obj)
    })
    
    // Add hover effect
    obj.on('pointerover', () => {
      obj.setScale(1.1)
    })
    
    obj.on('pointerout', () => {
      obj.setScale(1.0)
    })
    
    // Ensure interactive objects are tracked for depth updates
    this.interactiveObjects.push(obj)
    obj.depthFromY = true
    obj.depthOffset = 0
    return obj
  }
  
  handleInteraction(obj) {
    switch(obj.type) {
      case 'chest':
        if (!obj.interacted) {
          obj.interacted = true
          obj.setFillStyle(0xffd700)
          console.log('Chest opened! Found gold!')
          this.scene.events.emit('object:interacted', { type: 'chest', object: obj })
        } else {
          console.log('Chest is already open.')
        }
        break
        
      case 'door':
        console.log('Door clicked. Would open/close.')
        this.scene.events.emit('object:interacted', { type: 'door', object: obj })
        break
        
      case 'sign':
        console.log(`Sign: ${obj.message}`)
        this.scene.events.emit('object:interacted', { type: 'sign', object: obj, message: obj.message })
        break
        
      default:
        console.log(`Interacted with ${obj.type}`)
        this.scene.events.emit('object:interacted', { type: obj.type, object: obj })
    }
  }
  
  // Apply day/night tint to map layers
  applyDayNightTint(hour) {
    let tint = 0xffffff
    let intensity = 1.0
    
    if (hour >= 8 && hour < 18) {
      // Day - bright
      tint = 0xffffff
      intensity = 1.0
    } else if (hour >= 6 && hour < 8) {
      // Dawn
      const t = (hour - 6) / 2
      tint = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0xff6b47),
        Phaser.Display.Color.ValueToColor(0xffffff),
        2,
        Math.floor(t * 2)
      )
      intensity = Phaser.Math.Linear(0.7, 1.0, t)
    } else if (hour >= 18 && hour < 20) {
      // Dusk
      const t = (hour - 18) / 2
      tint = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0xffffff),
        Phaser.Display.Color.ValueToColor(0xff6b47),
        2,
        Math.floor(t * 2)
      )
      intensity = Phaser.Math.Linear(1.0, 0.7, t)
    } else {
      // Night - dark blue
      tint = 0x1a1a3a
      intensity = 0.6
    }
    
    // Apply tint to parallax layers
    this.parallaxLayers.forEach(layer => {
      if (layer.sprite) {
        // Convert tint value to color object if needed
        if (typeof tint === 'number') {
          layer.sprite.setTint(tint)
        } else {
          layer.sprite.setTint(tint)
        }
        layer.sprite.setAlpha(intensity)
      }
    })
    
    // Apply to tilemap layers if possible (Phaser tilemaps don't support tint directly)
    // Instead, we rely on the lighting overlay system
  }
  
  // Update parallax scrolling
  updateParallax(cameraX, cameraY) {
    this.parallaxLayers.forEach(layer => {
      if (layer.sprite) {
        layer.sprite.tilePositionX = cameraX * layer.speed
        layer.sprite.tilePositionY = cameraY * layer.speed
      }
    })
  }
  
  destroy() {
    this.parallaxLayers.forEach(layer => {
      if (layer.sprite) {
        layer.sprite.destroy()
      }
    })
    this.parallaxLayers = []
    
    this.interactiveObjects.forEach(obj => {
      if (obj.destroy) obj.destroy()
    })
    this.interactiveObjects = []
    
    this.tileAnimationTimers.forEach(timer => {
      if (timer.destroy) timer.destroy()
    })
    this.tileAnimationTimers.clear()
  }
}

