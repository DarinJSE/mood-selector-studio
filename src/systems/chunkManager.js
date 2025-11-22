import worldConfig from '../core/worldConfig.js'

export default class ChunkManager {
  constructor(scene) {
    this.scene = scene
    this.loadedChunks = new Map()
    this.chunkData = new Map()
    this.activeChunks = new Set()
    
    this.getChunkKey = (chunkX, chunkY) => `${chunkX}_${chunkY}`
  }
  
  async loadChunk(chunkX, chunkY) {
    const key = this.getChunkKey(chunkX, chunkY)
    
    if (this.loadedChunks.has(key)) {
      return this.loadedChunks.get(key)
    }
    
    // Try to load from file
    let chunkData = null
    try {
      const response = await fetch(`/src/maps/chunks/${key}.json`)
      if (response.ok) {
        chunkData = await response.json()
      }
    } catch (e) {
      // File doesn't exist, will generate
    }
    
    // Generate placeholder if no file
    if (!chunkData) {
      chunkData = this.generatePlaceholderChunk(chunkX, chunkY)
    }
    
    // Create tilemap from data
    const chunk = this.createChunkFromData(chunkX, chunkY, chunkData)
    
    this.loadedChunks.set(key, chunk)
    this.chunkData.set(key, chunkData)
    this.activeChunks.add(key)
    
    this.scene.events.emit('chunk:loaded', { chunkX, chunkY })
    
    return chunk
  }
  
  generatePlaceholderChunk(chunkX, chunkY) {
    const chunkSize = worldConfig.chunkSize
    const tileSize = worldConfig.tileSize
    
    // Use seeded random for consistent generation
    const seed = chunkX * 1000 + chunkY
    const rng = this.seededRandom(seed)
    
    const groundLayer = []
    const worldLayer = []
    
    for (let y = 0; y < chunkSize; y++) {
      const groundRow = []
      const worldRow = []
      
      for (let x = 0; x < chunkSize; x++) {
        const rand = rng()
        
        // Ground: mostly grass (1), some dirt (2), sand (5)
        if (rand < 0.7) {
          groundRow.push(1) // Grass
        } else if (rand < 0.9) {
          groundRow.push(2) // Dirt
        } else {
          groundRow.push(5) // Sand
        }
        
        // World layer: occasional obstacles
        const worldRand = rng()
        if (worldRand < 0.05) {
          worldRow.push(3) // Stone
        } else if (worldRand < 0.08 && rng() < 0.3) {
          worldRow.push(4) // Water
        } else {
          worldRow.push(0) // Empty
        }
      }
      
      groundLayer.push(groundRow)
      worldLayer.push(worldRow)
    }
    
    return {
      width: chunkSize,
      height: chunkSize,
      tilewidth: tileSize,
      tileheight: tileSize,
      layers: [
        {
          name: 'ground',
          type: 'tilelayer',
          data: groundLayer.flat(),
          visible: true
        },
        {
          name: 'world',
          type: 'tilelayer',
          data: worldLayer.flat(),
          visible: true,
          properties: [
            { name: 'collides', value: true, type: 'bool' }
          ]
        }
      ],
      tilesets: [
        {
          firstgid: 1,
          name: 'tileset',
          tilewidth: tileSize,
          tileheight: tileSize
        }
      ]
    }
  }
  
  // Simple seeded random for consistent chunk generation
  seededRandom(seed) {
    let value = seed
    return function() {
      value = (value * 9301 + 49297) % 233280
      return value / 233280
    }
  }
  
  createChunkFromData(chunkX, chunkY, chunkData) {
    const { x: worldX, y: worldY } = worldConfig.chunkToWorld(chunkX, chunkY)
    const tileSize = worldConfig.tileSize
    
    const map = this.scene.make.tilemap({
      tileWidth: chunkData.tilewidth,
      tileHeight: chunkData.tileheight,
      width: chunkData.width,
      height: chunkData.height
    })
    
    const tileset = map.addTilesetImage('tileset', 'tileset', tileSize, tileSize, 0, 0, 1)
    
    const layers = {}
    
    chunkData.layers.forEach(layerData => {
      const layer = map.createBlankLayer(
        layerData.name,
        tileset,
        worldX,
        worldY,
        chunkData.width,
        chunkData.height,
        tileSize,
        tileSize
      )
      
      if (layer) {
        const tileData = []
        for (let i = 0; i < layerData.data.length; i++) {
          tileData.push(layerData.data[i])
        }
        layer.putTilesAt(tileData, 0, 0)
        
        if (layerData.name === 'ground') {
          layer.setDepth(0)
        } else if (layerData.name === 'world') {
          layer.setDepth(1)
          layer.setCollisionByProperty({ collides: true })
          layer.setCollisionByExclusion([0])
        } else if (layerData.name === 'props') {
          layer.setDepth(2)
        }
        
        layers[layerData.name] = layer
      }
    })
    
    return {
      chunkX,
      chunkY,
      map,
      layers,
      worldX,
      worldY
    }
  }
  
  unloadChunk(chunkX, chunkY) {
    const key = this.getChunkKey(chunkX, chunkY)
    const chunk = this.loadedChunks.get(key)
    
    if (!chunk) return
    
    // Destroy tilemap and layers
    if (chunk.map) {
      chunk.map.destroy()
    }
    
    Object.values(chunk.layers).forEach(layer => {
      if (layer && layer.destroy) {
        layer.destroy()
      }
    })
    
    this.loadedChunks.delete(key)
    this.activeChunks.delete(key)
    
    this.scene.events.emit('chunk:unloaded', { chunkX, chunkY })
  }
  
  getChunksInRadius(centerChunkX, centerChunkY, radius) {
    const chunks = []
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= radius) {
          chunks.push({
            chunkX: centerChunkX + dx,
            chunkY: centerChunkY + dy
          })
        }
      }
    }
    
    return chunks
  }
  
  async updateLoadedChunks(centerX, centerY, radius = worldConfig.loadRadius) {
    const { chunkX, chunkY } = worldConfig.worldToChunk(centerX, centerY)
    
    const targetChunks = this.getChunksInRadius(chunkX, chunkY, radius)
    const targetKeys = new Set(targetChunks.map(c => this.getChunkKey(c.chunkX, c.chunkY)))
    
    // Unload chunks outside radius (but preserve NPCs - they're managed separately)
    const toUnload = []
    this.activeChunks.forEach(key => {
      if (!targetKeys.has(key)) {
        const [cx, cy] = key.split('_').map(Number)
        toUnload.push({ chunkX: cx, chunkY: cy })
      }
    })
    
    toUnload.forEach(({ chunkX, chunkY }) => {
      this.unloadChunk(chunkX, chunkY)
    })
    
    // Load new chunks
    const toLoad = targetChunks.filter(c => {
      const key = this.getChunkKey(c.chunkX, c.chunkY)
      return !this.loadedChunks.has(key)
    })
    
    for (const chunk of toLoad) {
      await this.loadChunk(chunk.chunkX, chunk.chunkY)
    }
  }
  
  getChunkAt(worldX, worldY) {
    const { chunkX, chunkY } = worldConfig.worldToChunk(worldX, worldY)
    const key = this.getChunkKey(chunkX, chunkY)
    return this.loadedChunks.get(key)
  }
  
  getAllCollisionLayers() {
    const layers = []
    this.loadedChunks.forEach(chunk => {
      if (chunk.layers.world) {
        layers.push(chunk.layers.world)
      }
    })
    return layers
  }
  
  destroy() {
    this.loadedChunks.forEach((chunk, key) => {
      const [cx, cy] = key.split('_').map(Number)
      this.unloadChunk(cx, cy)
    })
    this.loadedChunks.clear()
    this.chunkData.clear()
    this.activeChunks.clear()
  }
}
