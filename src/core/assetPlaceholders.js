export default class AssetPlaceholders {
  static generateTileset(scene) {
    const tileSize = 32
    const canvas = document.createElement('canvas')
    canvas.width = tileSize * 8
    canvas.height = tileSize * 8
    const ctx = canvas.getContext('2d')
    
    // Tile 0: Transparent/empty
    // Tile 1: Grass (green)
    ctx.fillStyle = '#4a7c3f'
    ctx.fillRect(0, tileSize, tileSize, tileSize)
    ctx.fillStyle = '#5a8c4f'
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(
        Math.random() * tileSize,
        tileSize + Math.random() * tileSize,
        2, 2
      )
    }
    
    // Tile 2: Dirt (brown)
    ctx.fillStyle = '#8b6f47'
    ctx.fillRect(tileSize, tileSize, tileSize, tileSize)
    ctx.fillStyle = '#9b7f57'
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(
        tileSize + Math.random() * tileSize,
        tileSize + Math.random() * tileSize,
        2, 2
      )
    }
    
    // Tile 3: Stone (gray)
    ctx.fillStyle = '#6b6b6b'
    ctx.fillRect(tileSize * 2, tileSize, tileSize, tileSize)
    ctx.fillStyle = '#7b7b7b'
    ctx.fillRect(tileSize * 2 + 4, tileSize + 4, tileSize - 8, tileSize - 8)
    
    // Tile 4: Water (blue)
    ctx.fillStyle = '#3a5a8f'
    ctx.fillRect(tileSize * 3, tileSize, tileSize, tileSize)
    ctx.fillStyle = '#4a6a9f'
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.arc(
        tileSize * 3 + Math.random() * tileSize,
        tileSize + Math.random() * tileSize,
        3, 0, Math.PI * 2
      )
      ctx.fill()
    }
    
    // Tile 5: Sand (yellow)
    ctx.fillStyle = '#d4c5a0'
    ctx.fillRect(0, tileSize * 2, tileSize, tileSize)
    
    // Tile 6: Wall (dark gray)
    ctx.fillStyle = '#3a3a3a'
    ctx.fillRect(tileSize, tileSize * 2, tileSize, tileSize)
    ctx.fillStyle = '#2a2a2a'
    ctx.fillRect(tileSize + 2, tileSize * 2 + 2, tileSize - 4, tileSize - 4)
    
    scene.textures.addCanvas('tileset', canvas)
    return 'tileset'
  }
  
  // Generate animated player spritesheet
  // Format: 4 rows (down, up, left, right) x 4 frames (idle, walk1, walk2, attack)
  static generatePlayerSprite(scene) {
    const frameSize = 32
    const framesPerRow = 4
    const rows = 4 // down, up, left, right
    const canvas = document.createElement('canvas')
    canvas.width = frameSize * framesPerRow
    canvas.height = frameSize * rows
    const ctx = canvas.getContext('2d')
    
    // Draw each frame
    for (let row = 0; row < rows; row++) {
      for (let frame = 0; frame < framesPerRow; frame++) {
        const x = frame * frameSize
        const y = row * frameSize
        
        // Base body color
        const bodyColor = '#4a7cff'
        const headColor = '#ffb4a4'
        
        // Frame 0: Idle (standing still)
        if (frame === 0) {
          ctx.fillStyle = bodyColor
          ctx.fillRect(x + 8, y + 12, 16, 20)
          ctx.fillStyle = headColor
          ctx.fillRect(x + 10, y + 4, 12, 12)
          // Eyes
          ctx.fillStyle = '#000'
          ctx.fillRect(x + 12, y + 8, 2, 2)
          ctx.fillRect(x + 18, y + 8, 2, 2)
        }
        // Frame 1-2: Walk animation (legs alternate)
        else if (frame === 1 || frame === 2) {
          ctx.fillStyle = bodyColor
          ctx.fillRect(x + 8, y + 12, 16, 20)
          ctx.fillStyle = headColor
          ctx.fillRect(x + 10, y + 4, 12, 12)
          // Eyes
          ctx.fillStyle = '#000'
          ctx.fillRect(x + 12, y + 8, 2, 2)
          ctx.fillRect(x + 18, y + 8, 2, 2)
          
          // Animated legs (alternate position)
          const legOffset = frame === 1 ? -1 : 1
          ctx.fillStyle = '#2a5cbf'
          ctx.fillRect(x + 10, y + 28, 4, 4)
          ctx.fillRect(x + 18, y + 28 + legOffset * 2, 4, 4)
        }
        // Frame 3: Attack (weapon/arm extended)
        else if (frame === 3) {
          ctx.fillStyle = bodyColor
          ctx.fillRect(x + 8, y + 12, 16, 20)
          ctx.fillStyle = headColor
          ctx.fillRect(x + 10, y + 4, 12, 12)
          // Eyes (determined)
          ctx.fillStyle = '#000'
          ctx.fillRect(x + 12, y + 8, 2, 2)
          ctx.fillRect(x + 18, y + 8, 2, 2)
          
          // Attack arm/weapon based on direction
          ctx.fillStyle = '#ffaa00'
          if (row === 0) { // Down
            ctx.fillRect(x + 12, y + 30, 8, 8)
          } else if (row === 1) { // Up
            ctx.fillRect(x + 12, y - 2, 8, 8)
          } else if (row === 2) { // Left
            ctx.fillRect(x - 2, y + 14, 8, 8)
          } else { // Right
            ctx.fillRect(x + 26, y + 14, 8, 8)
          }
        }
      }
    }
    
    // Add as spritesheet and configure frames
    scene.textures.addCanvas('player', canvas)
    
    // Manually add frames to the texture for Phaser to recognize them
    const texture = scene.textures.get('player')
    let frameIndex = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < framesPerRow; col++) {
        texture.add(frameIndex, 0, col * frameSize, row * frameSize, frameSize, frameSize)
        frameIndex++
      }
    }
    
    return 'player'
  }
  
  // Generate animated NPC spritesheet
  // Format: 1 row x 3 frames (idle, walk1, walk2)
  static generateNPCSprite(scene) {
    const frameSize = 32
    const framesPerRow = 3
    const canvas = document.createElement('canvas')
    canvas.width = frameSize * framesPerRow
    canvas.height = frameSize
    const ctx = canvas.getContext('2d')
    
    for (let frame = 0; frame < framesPerRow; frame++) {
      const x = frame * frameSize
      
      // Body (green)
      ctx.fillStyle = '#4a9c4f'
      ctx.fillRect(x + 8, 12, 16, 20)
      
      // Head (pink)
      ctx.fillStyle = '#ffb4a4'
      ctx.fillRect(x + 10, 4, 12, 12)
      
      // Eyes
      ctx.fillStyle = '#000'
      ctx.fillRect(x + 12, 8, 2, 2)
      ctx.fillRect(x + 18, 8, 2, 2)
      
      // Animated legs for walk frames
      if (frame === 1 || frame === 2) {
        const legOffset = frame === 1 ? -1 : 1
        ctx.fillStyle = '#2a7c2f'
        ctx.fillRect(x + 10, 28, 4, 4)
        ctx.fillRect(x + 18, 28 + legOffset * 2, 4, 4)
      }
    }
    
    // Add as spritesheet and configure frames
    scene.textures.addCanvas('npc', canvas)
    
    // Manually add frames to the texture
    const texture = scene.textures.get('npc')
    for (let i = 0; i < framesPerRow; i++) {
      texture.add(i, 0, i * frameSize, 0, frameSize, frameSize)
    }
    
    return 'npc'
  }
  
  static generateTreeSprite(scene) {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    
    // Trunk (brown)
    ctx.fillStyle = '#6b4a2a'
    ctx.fillRect(28, 40, 8, 24)
    
    // Leaves (green circles)
    ctx.fillStyle = '#2a7c3f'
    ctx.beginPath()
    ctx.arc(32, 32, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#3a8c4f'
    ctx.beginPath()
    ctx.arc(28, 28, 12, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(36, 28, 12, 0, Math.PI * 2)
    ctx.fill()
    
    scene.textures.addCanvas('tree', canvas)
    return 'tree'
  }
  
  static generateRockSprite(scene) {
    const size = 32
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    
    // Rock (gray)
    ctx.fillStyle = '#6b6b6b'
    ctx.beginPath()
    ctx.ellipse(16, 20, 12, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#7b7b7b'
    ctx.beginPath()
    ctx.ellipse(16, 18, 8, 6, 0, 0, Math.PI * 2)
    ctx.fill()
    
    scene.textures.addCanvas('rock', canvas)
    return 'rock'
  }
  
  // Generate particle textures
  static generateParticleTextures(scene) {
    // Dust particle
    const dustCanvas = document.createElement('canvas')
    dustCanvas.width = 4
    dustCanvas.height = 4
    const dustCtx = dustCanvas.getContext('2d')
    dustCtx.fillStyle = '#cccccc'
    dustCtx.fillRect(0, 0, 4, 4)
    scene.textures.addCanvas('particle-dust', dustCanvas)
    
    // Leaf particle
    const leafCanvas = document.createElement('canvas')
    leafCanvas.width = 8
    leafCanvas.height = 8
    const leafCtx = leafCanvas.getContext('2d')
    leafCtx.fillStyle = '#4a7c3f'
    leafCtx.beginPath()
    leafCtx.ellipse(4, 4, 3, 4, 0, 0, Math.PI * 2)
    leafCtx.fill()
    scene.textures.addCanvas('particle-leaf', leafCanvas)
    
    // Water particle
    const waterCanvas = document.createElement('canvas')
    waterCanvas.width = 6
    waterCanvas.height = 6
    const waterCtx = waterCanvas.getContext('2d')
    waterCtx.fillStyle = '#4a6a9f'
    waterCtx.beginPath()
    waterCtx.arc(3, 3, 3, 0, Math.PI * 2)
    waterCtx.fill()
    scene.textures.addCanvas('particle-water', waterCanvas)
    
    // Fire particle
    const fireCanvas = document.createElement('canvas')
    fireCanvas.width = 6
    fireCanvas.height = 6
    const fireCtx = fireCanvas.getContext('2d')
    fireCtx.fillStyle = '#ff6b00'
    fireCtx.beginPath()
    fireCtx.arc(3, 3, 3, 0, Math.PI * 2)
    fireCtx.fill()
    scene.textures.addCanvas('particle-fire', fireCanvas)
  }
  
  // Generate parallax background textures
  static generateParallaxTextures(scene) {
    const worldWidth = 6400 // worldConfig.getWorldWidthPx()
    const worldHeight = 6400 // worldConfig.getWorldHeightPx()
    
    // Far background (sky/hills)
    const farCanvas = document.createElement('canvas')
    farCanvas.width = 640
    farCanvas.height = 360
    const farCtx = farCanvas.getContext('2d')
    // Sky gradient
    const farGradient = farCtx.createLinearGradient(0, 0, 0, farCanvas.height)
    farGradient.addColorStop(0, '#87ceeb')
    farGradient.addColorStop(1, '#e0f6ff')
    farCtx.fillStyle = farGradient
    farCtx.fillRect(0, 0, farCanvas.width, farCanvas.height)
    // Hills
    farCtx.fillStyle = '#5a8c5a'
    farCtx.beginPath()
    farCtx.moveTo(0, farCanvas.height)
    for (let x = 0; x < farCanvas.width; x += 50) {
      farCtx.lineTo(x, farCanvas.height - 50 - Math.sin(x / 100) * 20)
    }
    farCtx.lineTo(farCanvas.width, farCanvas.height)
    farCtx.closePath()
    farCtx.fill()
    scene.textures.addCanvas('parallax-far', farCanvas)
    
    // Mid background (clouds)
    const midCanvas = document.createElement('canvas')
    midCanvas.width = 640
    midCanvas.height = 360
    const midCtx = midCanvas.getContext('2d')
    midCtx.fillStyle = '#f0f0f0'
    // Draw simple clouds
    for (let i = 0; i < 5; i++) {
      const x = (i * 150) % midCanvas.width
      const y = 50 + Math.sin(i) * 30
      midCtx.beginPath()
      midCtx.arc(x, y, 30, 0, Math.PI * 2)
      midCtx.arc(x + 25, y, 35, 0, Math.PI * 2)
      midCtx.arc(x + 50, y, 30, 0, Math.PI * 2)
      midCtx.fill()
    }
    scene.textures.addCanvas('parallax-mid', midCanvas)
    
    // Near background (trees/buildings silhouette)
    const nearCanvas = document.createElement('canvas')
    nearCanvas.width = 640
    nearCanvas.height = 360
    const nearCtx = nearCanvas.getContext('2d')
    nearCtx.fillStyle = '#2a4a2a'
    // Draw tree silhouettes
    for (let i = 0; i < 8; i++) {
      const x = (i * 80) % nearCanvas.width
      const y = nearCanvas.height - 60
      // Tree trunk
      nearCtx.fillRect(x + 35, y, 10, 60)
      // Tree top
      nearCtx.beginPath()
      nearCtx.arc(x + 40, y, 25, 0, Math.PI * 2)
      nearCtx.fill()
    }
    scene.textures.addCanvas('parallax-near', nearCanvas)
  }
  
  static generateAll(scene) {
    this.generateTileset(scene)
    this.generatePlayerSprite(scene)
    this.generateNPCSprite(scene)
    this.generateTreeSprite(scene)
    this.generateRockSprite(scene)
    this.generateParticleTextures(scene)
    this.generateParallaxTextures(scene)
  }
}
