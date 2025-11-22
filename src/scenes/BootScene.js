import AssetPlaceholders from '../core/assetPlaceholders.js'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }
  
  preload() {
    console.log('BootScene: Generating placeholder assets...')
    // Generate all placeholder assets
    AssetPlaceholders.generateAll(this)
    console.log('BootScene: Assets generated')
  }
  
  create() {
    console.log('BootScene: Starting PreloadScene...')
    this.scene.start('PreloadScene')
  }
}
