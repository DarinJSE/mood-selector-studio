export default class MapLoader {
  static loadMap(scene, mapKey, tilesetKey, tilesetImage) {
    const map = scene.make.tilemap({ key: mapKey })
    
    // Add tileset
    const tileset = map.addTilesetImage(tilesetKey, tilesetImage)
    
    // Create layers
    const groundLayer = map.createLayer('ground', tileset, 0, 0)
    const worldLayer = map.createLayer('world', tileset, 0, 0)
    
    if (groundLayer) {
      groundLayer.setDepth(0)
    }
    
    if (worldLayer) {
      worldLayer.setDepth(1)
      worldLayer.setCollisionByProperty({ collides: true })
    }
    
    return {
      map,
      groundLayer,
      worldLayer
    }
  }
  
  static createPlaceholderMap(scene) {
    // Create a simple placeholder map using Phaser's tilemap API
    const map = scene.make.tilemap({ 
      tileWidth: 16, 
      tileHeight: 16, 
      width: 20, 
      height: 20 
    })
    
    // Create placeholder tileset (firstgid=1: frame 0=GID 1, frame 1=GID 2)
    const tileset = map.addTilesetImage('tileset', 'tileset', 16, 16, 0, 0, 1)
    
    // Create ground layer (all tiles = 1, which maps to frame 0 - ground tile)
    const groundData = []
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        groundData.push(1)
      }
    }
    const groundLayer = map.createBlankLayer('ground', tileset, 0, 0, 20, 20, 16, 16)
    groundLayer.putTilesAt(groundData, 0, 0)
    groundLayer.setDepth(0)
    
    // Create world layer (borders = 2, which maps to frame 1 - wall tile, rest = 0)
    const worldData = []
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        if (x === 0 || x === 19 || y === 0 || y === 19) {
          worldData.push(2)
        } else {
          worldData.push(0)
        }
      }
    }
    const worldLayer = map.createBlankLayer('world', tileset, 0, 0, 20, 20, 16, 16)
    worldLayer.putTilesAt(worldData, 0, 0)
    worldLayer.setDepth(1)
    worldLayer.setCollisionByExclusion([0])
    
    return {
      map,
      groundLayer,
      worldLayer
    }
  }
}

