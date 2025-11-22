import Player from '../core/player.js'
import MapLoader from '../core/mapLoader.js'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }
  
  create() {
    // Load map (using placeholder)
    const mapData = MapLoader.createPlaceholderMap(this)
    this.worldLayer = mapData.worldLayer
    this.groundLayer = mapData.groundLayer
    
    // Create player
    this.player = new Player(this, 160, 160)
    
    // Set up camera
    this.cameras.main.setBounds(0, 0, 320, 320)
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setZoom(2)
    
    // Create NPC
    this.npcs = []
    const npc = this.physics.add.sprite(240, 160, 'npc')
    npc.setCollideWorldBounds(true)
    npc.name = 'Test NPC'
    this.npcs.push(npc)
    
    // Set up collisions
    this.physics.add.collider(this.player, this.worldLayer)
    
    // Instructions text
    this.add.text(10, 10, 'WASD/Arrows: Move\nE: Interact', {
      font: '12px monospace',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(1000)
  }
  
  update() {
    this.player.update()
    this.player.checkInteraction(this.npcs)
  }
}

