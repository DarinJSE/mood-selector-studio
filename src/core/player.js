export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player')
    
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    this.setCollideWorldBounds(false)
    this.body.setSize(16, 16)
    this.body.setOffset(8, 16)
    
    // Input
    this.cursors = scene.input.keyboard.createCursorKeys()
    this.wasd = scene.input.keyboard.addKeys('W,S,A,D')
    this.interactionKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    
    // Movement
    this.speed = 100
    this.dashSpeed = 250
    this.dashDuration = 200
    this.dashCooldown = 500
    this.isDashing = false
    this.dashCooldownTimer = 0
    this.dashDirection = { x: 0, y: 0 }
    
    // Combat
    this.attackCooldown = 300
    this.attackTimer = 0
    this.isAttacking = false
    this.attackRange = 32
    
    // Stats
    this.maxHP = 100
    this.hp = this.maxHP
    this.maxStamina = 100
    this.stamina = this.maxStamina
    this.staminaRegenRate = 20
    this.dashStaminaCost = 30
    
    // State
    this.lastDirection = 'down'
    this.isMoving = false
    
    // Attack hitbox
    this.attackHitbox = null
    // Depth sorting by Y
    this.depthFromY = true
    this.depthOffset = 0

    this.createAnimations()
  }
  
  createAnimations() {
    const frameSize = 32
    const framesPerRow = 4
    
    // Direction mapping: down=0, up=1, left=2, right=3
    const directions = ['down', 'up', 'left', 'right']
    
    // Create idle animations (frame 0)
    directions.forEach((dir, row) => {
      const key = `player-idle-${dir}`
      if (!this.scene.anims.exists(key)) {
        this.scene.anims.create({
          key: key,
          frames: this.scene.anims.generateFrameNumbers('player', {
            start: row * framesPerRow,
            end: row * framesPerRow
          }),
          frameRate: 1,
          repeat: -1
        })
      }
    })
    
    // Create walk animations (frames 1-2)
    directions.forEach((dir, row) => {
      const key = `player-walk-${dir}`
      if (!this.scene.anims.exists(key)) {
        this.scene.anims.create({
          key: key,
          frames: this.scene.anims.generateFrameNumbers('player', {
            start: row * framesPerRow + 1,
            end: row * framesPerRow + 2
          }),
          frameRate: 8,
          repeat: -1
        })
      }
    })
    
    // Create attack animations (frame 3)
    directions.forEach((dir, row) => {
      const key = `player-attack-${dir}`
      if (!this.scene.anims.exists(key)) {
        this.scene.anims.create({
          key: key,
          frames: this.scene.anims.generateFrameNumbers('player', {
            start: row * framesPerRow + 3,
            end: row * framesPerRow + 3
          }),
          frameRate: 12,
          repeat: 0
        })
      }
    })
    
    // Create dash animation (uses walk frames but faster)
    directions.forEach((dir, row) => {
      const key = `player-dash-${dir}`
      if (!this.scene.anims.exists(key)) {
        this.scene.anims.create({
          key: key,
          frames: this.scene.anims.generateFrameNumbers('player', {
            start: row * framesPerRow + 1,
            end: row * framesPerRow + 2
          }),
          frameRate: 16,
          repeat: -1
        })
      }
    })
    
    this.play('player-idle-down')
  }
  
  update(time, delta) {
    this.setDepth(this.y)
    
    const deltaSeconds = delta / 1000
    this.dashCooldownTimer = Math.max(0, this.dashCooldownTimer - delta)
    this.attackTimer = Math.max(0, this.attackTimer - delta)
    
    // Regenerate stamina
    if (this.stamina < this.maxStamina && !this.isDashing) {
      this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate * deltaSeconds)
    }
    
    // Handle dash
    if (this.isDashing) {
      this.handleDash(delta)
      return
    }
    
    // Handle attack
    if (this.isAttacking) {
      this.handleAttack(delta)
      return
    }
    
    // Check for dash input
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && 
        this.dashCooldownTimer <= 0 && 
        this.stamina >= this.dashStaminaCost &&
        !this.isDashing) {
      this.startDash()
      return
    }
    
    // Check for attack input
    if (Phaser.Input.Keyboard.JustDown(Phaser.Input.Keyboard.KeyCodes.X) &&
        this.attackTimer <= 0 &&
        !this.isAttacking) {
      this.startAttack()
      return
    }
    
    // Normal movement
    this.handleMovement()
  }
  
  handleMovement() {
    const left = this.cursors.left.isDown || this.wasd.A.isDown
    const right = this.cursors.right.isDown || this.wasd.D.isDown
    const up = this.cursors.up.isDown || this.wasd.W.isDown
    const down = this.cursors.down.isDown || this.wasd.S.isDown
    
    let velX = 0
    let velY = 0
    
    if (left) {
      velX = -this.speed
      this.lastDirection = 'left'
    } else if (right) {
      velX = this.speed
      this.lastDirection = 'right'
    }
    
    if (up) {
      velY = -this.speed
      if (velX === 0) this.lastDirection = 'up'
    } else if (down) {
      velY = this.speed
      if (velX === 0) this.lastDirection = 'down'
    }
    
    this.setVelocity(velX, velY)
    this.isMoving = velX !== 0 || velY !== 0
    
    // Update animation
    if (this.isMoving) {
      this.play(`player-walk-${this.lastDirection}`, true)
    } else {
      this.play(`player-idle-${this.lastDirection}`, true)
    }
  }
  
  startDash() {
    if (this.stamina < this.dashStaminaCost) return
    
    this.isDashing = true
    this.stamina -= this.dashStaminaCost
    this.dashCooldownTimer = this.dashCooldown
    
    const left = this.cursors.left.isDown || this.wasd.A.isDown
    const right = this.cursors.right.isDown || this.wasd.D.isDown
    const up = this.cursors.up.isDown || this.wasd.W.isDown
    const down = this.cursors.down.isDown || this.wasd.S.isDown
    
    if (left) this.dashDirection = { x: -1, y: 0 }
    else if (right) this.dashDirection = { x: 1, y: 0 }
    else if (up) this.dashDirection = { x: 0, y: -1 }
    else if (down) this.dashDirection = { x: 0, y: 1 }
    else {
      switch(this.lastDirection) {
        case 'left': this.dashDirection = { x: -1, y: 0 }; break
        case 'right': this.dashDirection = { x: 1, y: 0 }; break
        case 'up': this.dashDirection = { x: 0, y: -1 }; break
        default: this.dashDirection = { x: 0, y: 1 }; break
      }
    }
    
    this.setVelocity(
      this.dashDirection.x * this.dashSpeed,
      this.dashDirection.y * this.dashSpeed
    )
    
    // Play dash animation
    this.play(`player-dash-${this.lastDirection}`, true)
    
    this.scene.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false
      this.setVelocity(0, 0)
    })
  }
  
  handleDash(delta) {
    // Dash movement is already set, collision will prevent going through walls
  }
  
  startAttack() {
    this.isAttacking = true
    this.attackTimer = this.attackCooldown
    this.setVelocity(0, 0)
    
    // Play attack animation
    this.play(`player-attack-${this.lastDirection}`, true)
    
    // Create attack hitbox
    this.createAttackHitbox()
    
    // Check for hits
    this.scene.time.delayedCall(100, () => {
      this.checkAttackHit()
      this.destroyAttackHitbox()
      this.isAttacking = false
    })
  }
  
  handleAttack(delta) {
    // Attack is handled by delayed call
  }
  
  createAttackHitbox() {
    if (this.attackHitbox) {
      this.attackHitbox.destroy()
    }
    
    let hitboxX = this.x
    let hitboxY = this.y
    
    switch(this.lastDirection) {
      case 'left': hitboxX -= this.attackRange; break
      case 'right': hitboxX += this.attackRange; break
      case 'up': hitboxY -= this.attackRange; break
      case 'down': hitboxY += this.attackRange; break
    }
    
    // Visual indicator
    this.attackHitbox = this.scene.add.circle(hitboxX, hitboxY, 16, 0xff0000, 0.3)
    // Ensure attack hitbox renders above the player
    if (this.attackHitbox && this.attackHitbox.setDepth) {
      this.attackHitbox.setDepth(this.y + 1)
      this.attackHitbox.depthFromY = false
    }
  }
  
  destroyAttackHitbox() {
    if (this.attackHitbox) {
      this.attackHitbox.destroy()
      this.attackHitbox = null
    }
  }
  
  checkAttackHit() {
    if (this.scene.npcs) {
      this.scene.npcs.forEach(npc => {
        if (!npc.active) return
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, npc.x, npc.y)
        if (distance < this.attackRange + 16) {
          console.log(`Hit ${npc.name}!`)
          this.scene.events.emit('player:attackHit', { target: npc })
        }
      })
    }
  }
  
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount)
    if (this.hp <= 0) {
      this.die()
    }
    this.scene.events.emit('player:damaged', { hp: this.hp, maxHP: this.maxHP })
  }
  
  die() {
    this.setVelocity(0, 0)
    this.setActive(false)
    this.scene.events.emit('player:died')
  }
  
  checkInteraction(npcs) {
    if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
      npcs.forEach(npc => {
        if (npc.active && npc.canInteract && npc.canInteract(this)) {
          npc.interact(this)
        } else {
          const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            npc.x, npc.y
          )
          if (distance < 32) {
            if (npc.interact) {
              npc.interact(this)
            }
          }
        }
      })
    }
  }
  
  getState() {
    return {
      x: this.x,
      y: this.y,
      hp: this.hp,
      maxHP: this.maxHP,
      stamina: this.stamina,
      maxStamina: this.maxStamina
    }
  }
  
  setStateFromSave(state) {
    if (state.x !== undefined) this.x = state.x
    if (state.y !== undefined) this.y = state.y
    if (state.hp !== undefined) this.hp = state.hp
    if (state.stamina !== undefined) this.stamina = state.stamina
  }
}
