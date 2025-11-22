import Phaser from 'phaser'
import BootScene from '../scenes/BootScene.js'
import PreloadScene from '../scenes/PreloadScene.js'
import WorldScene from '../scenes/WorldScene.js'
import MiniMapScene from '../scenes/MiniMapScene.js'

export default {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 640,
  height: 360,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, PreloadScene, WorldScene, MiniMapScene]
}

