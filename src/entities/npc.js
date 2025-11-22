import Phaser from 'phaser'

export default class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'npc')
    
    this.name = config.name || 'NPC'
    this.id = config.id || Phaser.Utils.String.UUID()
    this.state = 'idle'
    this.patrolPoints = config.patrolPoints || []
    this.currentPatrolIndex = 0
    this.speed = config.speed || 50
    this.interactionRange = config.interactionRange || 32
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    this.setCollideWorldBounds(false)
    this.body.setSize(16, 16)
    this.body.setOffset(8, 16)
    
    this.setDepth(this.y)
    // Depth sorting by Y
    this.depthFromY = true
    this.depthOffset = 0
    
    // State machine
    this.stateMachine = {
      idle: this.idleState.bind(this),
      patrol: this.patrolState.bind(this),
      follow: this.followState.bind(this),
      interact: this.interactState.bind(this)
    }
    
    this.target = null
    this.path = []
    this.pathIndex = 0
    this.pathUpdateTimer = 0
    this.pathUpdateInterval = 500
    
    // Pathfinding
    this.usePathfinding = config.usePathfinding !== false
    this.pathfinder = null
    
    // Animation state
    this.lastDirection = 'right'
    this.isMoving = false
    
    this.createAnimations()
    this.anims.play('npc-idle', true)
  }
  
  createAnimations() {
    // Idle animation (frame 0)
    if (!this.scene.anims.exists('npc-idle')) {
      this.scene.anims.create({
        key: 'npc-idle',
        frames: this.scene.anims.generateFrameNumbers('npc', {
          start: 0,
          end: 0
        }),
        frameRate: 1,
        repeat: -1
      })
    }
    
    // Walk animation (frames 1-2)
    if (!this.scene.anims.exists('npc-walk')) {
      this.scene.anims.create({
        key: 'npc-walk',
        frames: this.scene.anims.generateFrameNumbers('npc', {
          start: 1,
          end: 2
        }),
        frameRate: 6,
        repeat: -1
      })
    }
  }
  
  idleState() {
    this.setVelocity(0, 0)
    this.isMoving = false
    if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'npc-idle') {
      this.play('npc-idle', true)
    }
  }
  
  patrolState() {
    if (this.patrolPoints.length === 0) {
      this.state = 'idle'
      return
    }
    
    const target = this.patrolPoints[this.currentPatrolIndex]
    const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y)
    
    if (distance < 10) {
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length
      this.path = []
      this.pathIndex = 0
    } else {
      if (this.usePathfinding && this.pathfinder && this.pathfinder.ready) {
        this.updatePathToTarget(target.x, target.y)
      } else {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
        this.setVelocity(
          Math.cos(angle) * this.speed,
          Math.sin(angle) * this.speed
        )
        this.isMoving = true
      }
    }
  }
  
  followState() {
    if (!this.target) {
      this.state = 'idle'
      return
    }
    
    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y)
    
    if (distance > this.interactionRange * 2) {
      if (this.usePathfinding && this.pathfinder && this.pathfinder.ready) {
        this.updatePathToTarget(this.target.x, this.target.y)
      } else {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y)
        this.setVelocity(
          Math.cos(angle) * this.speed,
          Math.sin(angle) * this.speed
        )
        this.isMoving = true
      }
    } else {
      this.setVelocity(0, 0)
      this.path = []
      this.pathIndex = 0
      this.isMoving = false
    }
  }
  
  interactState() {
    this.setVelocity(0, 0)
    this.isMoving = false
  }
  
  updatePathToTarget(targetX, targetY) {
    const now = Date.now()
    if (now - this.pathUpdateTimer < this.pathUpdateInterval) {
      this.followPath()
      return
    }
    
    this.pathUpdateTimer = now
    
    if (!this.pathfinder || !this.pathfinder.ready) {
      return
    }
    
    this.pathfinder.findPath(this.x, this.y, targetX, targetY, (path) => {
      if (path && path.length > 0) {
        this.path = path
        this.pathIndex = 0
      } else {
        this.path = []
      }
    })
  }
  
  followPath() {
    if (!this.path || this.path.length === 0) {
      return
    }
    
    if (this.pathIndex >= this.path.length) {
      this.path = []
      this.pathIndex = 0
      return
    }
    
    const target = this.path[this.pathIndex]
    const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y)
    
    if (distance < 10) {
      this.pathIndex++
    } else {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      )
      this.isMoving = true
    }
  }
  
  setState(newState) {
    this.state = newState
  }
  
  setTarget(target) {
    this.target = target
    if (target) {
      this.state = 'follow'
      this.path = []
      this.pathIndex = 0
    }
  }
  
  setPath(path) {
    this.path = path
    this.pathIndex = 0
    if (path && path.length > 0) {
      this.state = 'patrol'
    }
  }
  
  update(time, delta) {
    this.setDepth(this.y)
    
    // Run state machine
    if (this.stateMachine[this.state]) {
      this.stateMachine[this.state]()
    }
    
    // Follow path if we have one
    if (this.path && this.path.length > 0) {
      this.followPath()
    }
    
    // Update animation based on movement
    if (this.isMoving) {
      if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'npc-walk') {
        this.play('npc-walk', true)
      }
      
      // Update direction for sprite flipping
      if (this.body.velocity.x !== 0) {
        this.setFlipX(this.body.velocity.x < 0)
        this.lastDirection = this.body.velocity.x < 0 ? 'left' : 'right'
      }
    } else {
      if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'npc-idle') {
        this.play('npc-idle', true)
      }
    }
  }
  
  canInteract(player) {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y)
    return distance < this.interactionRange
  }
  
  interact(player) {
    console.log(`${this.name}: Hello! How can I help you?`)
    this.scene.events.emit('npc:interacted', { npc: this, player })
  }
  
  reset() {
    this.state = 'idle'
    this.target = null
    this.path = []
    this.pathIndex = 0
    this.setVelocity(0, 0)
    this.isMoving = false
  }
  
  cleanup() {
    this.reset()
  }
  
  getState() {
    return {
      id: this.id,
      state: this.state,
      x: this.x,
      y: this.y
    }
  }
  
  setStateFromSave(saveData) {
    if (saveData.state) this.state = saveData.state
    if (saveData.x !== undefined) this.x = saveData.x
    if (saveData.y !== undefined) this.y = saveData.y
  }
}
