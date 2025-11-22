// EasyStar.js pathfinding integration
export default class Pathfinder {
  constructor(scene, tileSize = 32) {
    this.scene = scene
    this.tileSize = tileSize
    this.easystar = null
    this.grid = null
    this.ready = false
    
    // Initialize EasyStar asynchronously
    this.initEasyStar()
  }
  
  async initEasyStar() {
    try {
      const easystarModule = await import('easystarjs')
      let EasyStar = easystarModule.default || easystarModule
      
      // Handle different export styles
      if (EasyStar && EasyStar.js) {
        this.easystar = new EasyStar.js()
      } else if (typeof EasyStar === 'function') {
        this.easystar = new EasyStar()
      } else if (EasyStar && typeof EasyStar === 'object') {
        // Try to find the constructor
        if (EasyStar.js) {
          this.easystar = new EasyStar.js()
        } else {
          this.easystar = EasyStar
        }
      }
      
      if (this.easystar) {
        this.easystar.enableDiagonals()
        this.easystar.setIterationsPerCalculation(1000)
      }
    } catch (e) {
      console.warn('EasyStar.js not available, pathfinding disabled:', e)
      this.easystar = null
    }
  }
  
  setGrid(grid, acceptableTiles = [0]) {
    if (!this.easystar) {
      this.ready = false
      return
    }
    
    try {
      this.grid = grid
      this.easystar.setGrid(grid)
      this.easystar.setAcceptableTiles(acceptableTiles)
      this.ready = true
    } catch (e) {
      console.error('Error setting pathfinder grid:', e)
      this.ready = false
    }
  }
  
  updateGrid(chunkX, chunkY, chunkGrid) {
    // Update grid for a specific chunk
    // In a full implementation, merge chunk grids
    if (!this.grid && this.easystar) {
      this.setGrid(chunkGrid)
    }
  }
  
  findPath(startX, startY, endX, endY, callback) {
    if (!this.ready || !this.easystar) {
      if (callback) callback(null)
      return
    }
    
    try {
      const startTileX = Math.floor(startX / this.tileSize)
      const startTileY = Math.floor(startY / this.tileSize)
      const endTileX = Math.floor(endX / this.tileSize)
      const endTileY = Math.floor(endY / this.tileSize)
      
      // Validate coordinates
      if (!this.grid || !this.grid[startTileY] || !this.grid[endTileY]) {
        if (callback) callback(null)
        return
      }
      
      if (startTileX < 0 || startTileX >= this.grid[0].length ||
          startTileY < 0 || startTileY >= this.grid.length ||
          endTileX < 0 || endTileX >= this.grid[0].length ||
          endTileY < 0 || endTileY >= this.grid.length) {
        if (callback) callback(null)
        return
      }
      
      this.easystar.findPath(
        startTileX,
        startTileY,
        endTileX,
        endTileY,
        (path) => {
          if (path === null) {
            if (callback) callback(null)
          } else {
            // Convert tile coordinates to world coordinates
            const worldPath = path.map(tile => ({
              x: tile.x * this.tileSize + this.tileSize / 2,
              y: tile.y * this.tileSize + this.tileSize / 2
            }))
            if (callback) callback(worldPath)
          }
        }
      )
      
      this.easystar.calculate()
    } catch (e) {
      console.error('Error finding path:', e)
      if (callback) callback(null)
    }
  }
  
  isWalkable(tileX, tileY) {
    if (!this.grid || !this.grid[tileY] || !this.grid[tileY][tileX] || !this.easystar) {
      return false
    }
    try {
      const acceptableTiles = this.easystar.getAcceptableTiles()
      return acceptableTiles.includes(this.grid[tileY][tileX])
    } catch (e) {
      return false
    }
  }
}
