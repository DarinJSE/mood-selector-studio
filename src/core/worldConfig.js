export default {
  // Tile configuration
  tileSize: 32,
  chunkSize: 16,
  
  // World size in tiles
  worldWidth: 200,
  worldHeight: 200,
  
  // Chunk loading radius (in chunks)
  loadRadius: 2,
  
  // Camera settings - improved to prevent jitter
  cameraDeadzone: { x: 100, y: 80 }, // Larger deadzone for smoother camera
  cameraLerp: 0.08, // Slightly slower lerp for smoother movement
  
  // Zones
  zones: [
    { id: 'spawn', name: 'Spawn Zone', x: 0, y: 0, width: 320, height: 320 },
    { id: 'forest', name: 'Forest', x: 640, y: 0, width: 640, height: 640 },
    { id: 'desert', name: 'Desert', x: 0, y: 640, width: 640, height: 640 }
  ],
  
  // Time settings
  timeScale: 1.0,
  startHour: 12,
  
  // Pathfinding
  pathfindingEnabled: true,
  
  // Save/Load keys
  saveKey: 'rpg_save_data',
  
  // Helper methods
  getWorldWidthPx() {
    return this.worldWidth * this.tileSize
  },
  
  getWorldHeightPx() {
    return this.worldHeight * this.tileSize
  },
  
  getChunkSizePx() {
    return this.chunkSize * this.tileSize
  },
  
  worldToChunk(worldX, worldY) {
    const chunkX = Math.floor(worldX / this.getChunkSizePx())
    const chunkY = Math.floor(worldY / this.getChunkSizePx())
    return { chunkX, chunkY }
  },
  
  chunkToWorld(chunkX, chunkY) {
    return {
      x: chunkX * this.getChunkSizePx(),
      y: chunkY * this.getChunkSizePx()
    }
  },
  
  getZoneAt(worldX, worldY) {
    return this.zones.find(zone => 
      worldX >= zone.x && worldX < zone.x + zone.width &&
      worldY >= zone.y && worldY < zone.y + zone.height
    )
  },
  
  saveGame(data) {
    try {
      const saveData = {
        playerX: data.playerX || 160,
        playerY: data.playerY || 160,
        timeOfDay: data.timeOfDay || 12,
        npcStates: data.npcStates || {},
        playerState: data.playerState || {},
        version: '1.0'
      }
      localStorage.setItem(this.saveKey, JSON.stringify(saveData))
      return true
    } catch (e) {
      console.error('Save failed:', e)
      return false
    }
  },
  
  loadGame() {
    try {
      const data = localStorage.getItem(this.saveKey)
      if (!data) return null
      return JSON.parse(data)
    } catch (e) {
      console.error('Load failed:', e)
      return null
    }
  }
}
