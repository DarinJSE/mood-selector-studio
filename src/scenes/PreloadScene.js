export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }
  
  preload() {
    // Assets are already created in BootScene as placeholders
    // In a real project, you would load actual assets here
    
    this.createLoadingBar()
    
    // Simulate loading time
    this.load.on('complete', () => {
      console.log('PreloadScene: Loading complete, starting WorldScene...')
      this.scene.start('WorldScene')
    })
    
    // Register listener before starting load to prevent race condition
    this.load.once('loadcomplete', () => {
      this.load.emit('complete')
    })
    
    // Complete loading immediately since we're using placeholders
    this.load.start()
  }
  
  createLoadingBar() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    
    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50)
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    })
    loadingText.setOrigin(0.5, 0.5)
    
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    })
    percentText.setOrigin(0.5, 0.5)
    
    this.load.on('progress', (value) => {
      progressBar.clear()
      progressBar.fillStyle(0xffffff, 1)
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30)
      percentText.setText(Math.round(value * 100) + '%')
    })
    
    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      percentText.destroy()
    })
  }
}

