import worldConfig from '../core/worldConfig.js'

export default class MiniMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MiniMapScene' })
  }
  
  init(data) {
    this.worldScene = data.worldScene
  }
  
  create() {
    const { width, height } = this.cameras.main
    
    // Mini map size
    this.mapWidth = 200
    this.mapHeight = 200
    this.mapX = width - this.mapWidth - 10
    this.mapY = 10
    
    // Background
    this.mapBg = this.add.rectangle(
      this.mapX + this.mapWidth / 2,
      this.mapY + this.mapHeight / 2,
      this.mapWidth,
      this.mapHeight,
      0x000000,
      0.7
    )
    this.mapBg.setScrollFactor(0)
    this.mapBg.setDepth(20000)
    
    // Border
    this.mapBorder = this.add.rectangle(
      this.mapX + this.mapWidth / 2,
      this.mapY + this.mapHeight / 2,
      this.mapWidth,
      this.mapHeight,
      0xffffff,
      0
    )
    this.mapBorder.setStrokeStyle(2, 0xffffff, 1)
    this.mapBorder.setScrollFactor(0)
    this.mapBorder.setDepth(20001)
    
    // Title
    this.add.text(this.mapX + this.mapWidth / 2, this.mapY - 15, 'Minimap', {
      font: '12px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(20002)
    
    // Graphics for drawing chunks and player
    this.mapGraphics = this.add.graphics()
    this.mapGraphics.setScrollFactor(0)
    this.mapGraphics.setDepth(20001)
    
    // Player marker
    this.playerMarker = this.add.circle(0, 0, 3, 0xff0000)
    this.playerMarker.setScrollFactor(0)
    this.playerMarker.setDepth(20002)
    
    // Update minimap
    this.time.addEvent({
      delay: 100,
      callback: this.updateMiniMap,
      callbackScope: this,
      loop: true
    })
  }
  
  updateMiniMap() {
    if (!this.worldScene || !this.worldScene.player) return
    
    this.mapGraphics.clear()
    
    const scaleX = this.mapWidth / worldConfig.getWorldWidthPx()
    const scaleY = this.mapHeight / worldConfig.getWorldHeightPx()
    
    // Draw loaded chunks
    this.worldScene.chunkManager.activeChunks.forEach(key => {
      const [chunkX, chunkY] = key.split('_').map(Number)
      const { x, y } = worldConfig.chunkToWorld(chunkX, chunkY)
      
      const mapX = this.mapX + x * scaleX
      const mapY = this.mapY + y * scaleY
      const mapW = worldConfig.getChunkSizePx() * scaleX
      const mapH = worldConfig.getChunkSizePx() * scaleY
      
      this.mapGraphics.fillStyle(0x00ff00, 0.3)
      this.mapGraphics.fillRect(mapX, mapY, mapW, mapH)
      this.mapGraphics.lineStyle(1, 0x00ff00, 0.5)
      this.mapGraphics.strokeRect(mapX, mapY, mapW, mapH)
    })
    
    // Draw zones
    worldConfig.zones.forEach(zone => {
      const mapX = this.mapX + zone.x * scaleX
      const mapY = this.mapY + zone.y * scaleY
      const mapW = zone.width * scaleX
      const mapH = zone.height * scaleY
      
      this.mapGraphics.lineStyle(1, 0xffff00, 0.5)
      this.mapGraphics.strokeRect(mapX, mapY, mapW, mapH)
    })
    
    // Update player marker
    const playerMapX = this.mapX + this.worldScene.player.x * scaleX
    const playerMapY = this.mapY + this.worldScene.player.y * scaleY
    this.playerMarker.setPosition(playerMapX, playerMapY)
  }
}

