import Player from '../core/player.js'
import ChunkManager from '../systems/chunkManager.js'
import ObjectPool from '../systems/objectPool.js'
import LightingSystem from '../systems/lightingSystem.js'
import Pathfinder from '../systems/pathfinder.js'
import NPC from '../entities/npc.js'
import ParticleSystem from '../systems/particleSystem.js'
import NPCSystem from '../systems/npcSystem.js'
import MapEffects from '../core/mapEffects.js'
import { updateDepth } from '../core/utils.js'
import worldConfig from '../core/worldConfig.js'

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' })
  }
  
  create() {
    this.cameras.main.setBackgroundColor('#2a4a2a')
    
    try {
      // Initialize systems
      this.chunkManager = new ChunkManager(this)
      
      // Initialize lighting system
      try {
        this.lighting = new LightingSystem(this)
      } catch (error) {
        console.error('Failed to initialize lighting system:', error)
        this.lighting = null
      }
      
      this.pathfinder = new Pathfinder(this, worldConfig.tileSize)
      
      // Initialize new systems
      this.particleSystem = new ParticleSystem(this)
      this.npcSystem = new NPCSystem(this, this.pathfinder)
      this.mapEffects = new MapEffects(this)
      
      // Store reference for compatibility
      this.worldConfig = worldConfig
      
      // NPC pool and tracking (keep for compatibility)
      this.npcPool = new ObjectPool(
        this,
        (scene) => {
          const npc = new NPC(scene, 0, 0)
          npc.pathfinder = this.pathfinder
          return npc
        },
        10
      )
      
      this.npcs = []
      this.npcChunkMap = new Map()
      this.currentZone = null
      this.lastChunkUpdate = 0
      this.chunkUpdateThrottle = 100
      this.lastParticleSpawn = 0
      this.particleSpawnInterval = 2000 // ms
      
      // Load saved game or use defaults
      const saveData = worldConfig.loadGame()
      const startX = saveData?.playerX || 160
      const startY = saveData?.playerY || 160
      
      if (this.lighting) {
        if (saveData?.timeOfDay !== undefined) {
          this.lighting.setTime(saveData.timeOfDay)
        } else {
          this.lighting.setTime(worldConfig.startHour)
        }
      }
      
      // Create player
      this.player = new Player(this, startX, startY)
      // Flag player to be depth-sorted by Y and initialize depth
      this.player.depthFromY = true
      this.player.depthOffset = 0
      this.player.setDepth(this.player.y)
      
      // Set up camera
      this.setupCamera()
      
      // UI
      this.createUI()
      
      // Event listeners
      this.setupEvents()
      
      // Input
      this.setupInput()
      
      // Initial chunk load
      this.loadInitialChunks().then(() => {
        this.setupCollisions()
        this.spawnInitialContent()
        
        if (saveData?.npcStates) {
          this.restoreNPCStates(saveData.npcStates)
        }
      }).catch(err => {
        console.error('Error loading initial chunks:', err)
        this.setupCollisions()
      })
    } catch (error) {
      console.error('Error in WorldScene.create():', error)
    }
  }
  
  setupCamera() {
    const worldWidth = worldConfig.getWorldWidthPx()
    const worldHeight = worldConfig.getWorldHeightPx()
    
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)
    
    this.cameras.main.startFollow(
      this.player,
      false,
      worldConfig.cameraLerp,
      worldConfig.cameraLerp
    )
    
    this.cameras.main.setDeadzone(
      worldConfig.cameraDeadzone.x,
      worldConfig.cameraDeadzone.y
    )
    
    this.cameras.main.setZoom(2)
  }
  
  async loadInitialChunks() {
    await this.chunkManager.updateLoadedChunks(
      this.player.x,
      this.player.y,
      worldConfig.loadRadius
    )
  }
  
  setupCollisions() {
    this.updateCollisions()
    
    this.events.on('chunk:loaded', (data) => {
      this.updateCollisions()
      this.spawnChunkContent(data.chunkX, data.chunkY)
    })
    
    this.events.on('chunk:unloaded', () => {
      this.updateCollisions()
    })
  }
  
  spawnChunkContent(chunkX, chunkY) {
    const { x: worldX, y: worldY } = worldConfig.chunkToWorld(chunkX, chunkY)
    const chunkSizePx = worldConfig.getChunkSizePx()
    
    // Spawn NPCs in chunk
    const npcCount = Phaser.Math.Between(1, 3)
    this.npcSystem.spawnInChunk(chunkX, chunkY, npcCount)
    
    // Spawn particles
    const particleCount = Phaser.Math.Between(2, 4)
    for (let i = 0; i < particleCount; i++) {
      const px = worldX + Math.random() * chunkSizePx
      const py = worldY + Math.random() * chunkSizePx
      const type = Phaser.Utils.Array.GetRandom(['dust', 'leaf'])
      this.particleSystem.spawnRandomParticles(px, py, 50, type, 1)
    }
    
    // Spawn interactive objects
    const objectCount = Phaser.Math.Between(1, 2)
    for (let i = 0; i < objectCount; i++) {
      const ox = worldX + Math.random() * chunkSizePx
      const oy = worldY + Math.random() * chunkSizePx
      const type = Phaser.Utils.Array.GetRandom(['chest', 'sign', 'rock'])
      this.mapEffects.createInteractiveObject(ox, oy, type, {
        message: `Sign in chunk ${chunkX},${chunkY}`
      })
    }
    
    // Spawn animated props (trees)
    const treeCount = Phaser.Math.Between(2, 5)
    for (let i = 0; i < treeCount; i++) {
      const tx = worldX + Math.random() * chunkSizePx
      const ty = worldY + Math.random() * chunkSizePx
      this.mapEffects.createAnimatedProp(tx, ty, 'tree')
    }
  }
  
  spawnInitialContent() {
    // Spawn initial NPCs using NPCSystem
    this.spawnInitialNPCs()
    
    // Spawn initial interactive objects
    const initialObjects = [
      { x: 200, y: 200, type: 'chest' },
      { x: 300, y: 250, type: 'sign', message: 'Welcome to the RPG!' },
      { x: 400, y: 300, type: 'door' }
    ]
    
    initialObjects.forEach(obj => {
      this.mapEffects.createInteractiveObject(obj.x, obj.y, obj.type, {
        message: obj.message
      })
    })
    
    // Spawn some trees
    for (let i = 0; i < 5; i++) {
      const x = 150 + Math.random() * 300
      const y = 150 + Math.random() * 300
      this.mapEffects.createAnimatedProp(x, y, 'tree')
    }
    
    // Spawn initial particles
    this.particleSystem.spawnRandomParticles(200, 200, 200, 'dust', 3)
    this.particleSystem.spawnRandomParticles(300, 300, 150, 'leaf', 2)
  }
  
  updateCollisions() {
    if (this.playerColliders) {
      this.playerColliders.forEach(collider => {
        if (collider && collider.active) {
          this.physics.world.removeCollider(collider)
        }
      })
    }
    
    this.playerColliders = []
    const collisionLayers = this.chunkManager.getAllCollisionLayers()
    
    if (collisionLayers.length > 0) {
      collisionLayers.forEach(layer => {
        const collider = this.physics.add.collider(this.player, layer)
        this.playerColliders.push(collider)
      })
    }
    
    this.updateNPCCollisions()
  }
  
  updateNPCCollisions() {
    if (this.npcColliders) {
      this.npcColliders.forEach(collider => {
        if (collider && collider.active) {
          this.physics.world.removeCollider(collider)
        }
      })
    }
    
    this.npcColliders = []
    const collisionLayers = this.chunkManager.getAllCollisionLayers()
    
    // Update collisions for NPCSystem NPCs
    if (collisionLayers.length > 0 && this.npcSystem) {
      this.npcSystem.npcs.forEach(npc => {
        if (npc.active) {
          collisionLayers.forEach(layer => {
            const collider = this.physics.add.collider(npc, layer)
            this.npcColliders.push(collider)
          })
        }
      })
    }
    
    // Also update old NPC system
    if (collisionLayers.length > 0 && this.npcs) {
      this.npcs.forEach(npc => {
        if (npc.active) {
          collisionLayers.forEach(layer => {
            const collider = this.physics.add.collider(npc, layer)
            this.npcColliders.push(collider)
          })
        }
      })
    }
  }
  
  spawnInitialNPCs() {
    const spawns = [
      { x: 240, y: 160, name: 'Guard' },
      { x: 320, y: 240, name: 'Merchant' },
      { x: 160, y: 320, name: 'Villager' }
    ]
    
    spawns.forEach(spawn => {
      const npc = this.npcSystem.spawnNPC(spawn.x, spawn.y, { name: spawn.name })
      this.npcs.push(npc)
      this.npcChunkMap.set(npc.id, this.getNPCChunkKey(spawn.x, spawn.y))
    })
    
    this.updateNPCCollisions()
  }
  
  getNPCChunkKey(x, y) {
    const { chunkX, chunkY } = worldConfig.worldToChunk(x, y)
    return `${chunkX}_${chunkY}`
  }
  
  createUI() {
    this.add.text(10, 10, 'WASD/Arrows: Move\nSPACE: Dash\nX: Attack\nE: Interact\nM: Minimap\nS: Save\nL: Load', {
      font: '12px monospace',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(10000)
    
    this.timeText = this.add.text(10, 140, '', {
      font: '12px monospace',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(10000)
    
    this.zoneText = this.add.text(10, 170, '', {
      font: '12px monospace',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(10000)
    
    this.statsText = this.add.text(10, 200, '', {
      font: '12px monospace',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(10000)
  }
  
  setupEvents() {
    this.events.on('time:changed', (data) => {
      const hour = Math.floor(data.hour)
      const minute = Math.floor((data.hour - hour) * 60)
      if (this.timeText) {
        this.timeText.setText(`Time: ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
      }
      
      // Update map effects for day/night
      if (this.mapEffects) {
        this.mapEffects.applyDayNightTint(data.hour)
      }
    })
    
    this.events.on('player:damaged', (data) => {
      this.updateStatsDisplay()
    })
    
    this.events.on('player:enteredZone', (data) => {
      this.handleZoneEnter(data.zoneId)
    })
    
    this.events.on('object:interacted', (data) => {
      // Handle object interactions
      if (data.type === 'chest') {
        // Spawn particles when chest opens
        this.particleSystem.createWaterSplash(data.object.x, data.object.y, { quantity: 10 })
      }
    })
  }
  
  setupInput() {
    this.input.keyboard.on('keydown-S', () => {
      this.saveGame()
    })
    
    this.input.keyboard.on('keydown-L', () => {
      this.loadGame()
    })
    
    this.input.keyboard.on('keydown-M', () => {
      if (this.scene.isActive('MiniMapScene')) {
        this.scene.stop('MiniMapScene')
      } else {
        this.scene.launch('MiniMapScene', { worldScene: this })
      }
    })
  }
  
  update(time, delta) {
    // Update player
    if (this.player && this.player.active) {
      this.player.update(time, delta)
      this.player.checkInteraction(this.npcs)
    }
    
    // Update NPC systems
    if (this.npcSystem) {
      this.npcSystem.update()
      this.npcSystem.checkInteractions(this.player)
    }
    
    // Update old NPCs
    if (this.npcs) {
      this.npcs.forEach(npc => {
        if (npc.active) {
          npc.update()
          npc.setDepth(npc.y)
        }
      })
    }
    
    // Update lighting
    if (this.lighting) {
      this.lighting.update(delta)
    }
    
    // Update parallax
    if (this.mapEffects && this.cameras.main) {
      this.mapEffects.updateParallax(
        this.cameras.main.scrollX,
        this.cameras.main.scrollY
      )
    }
    
    // Depth updates should happen after camera movement and entity updates
    try {
      // Update player depth
      if (this.player && this.player.active) {
        updateDepth(this.player)
      }

      // Update NPCSystem NPCs
      if (this.npcSystem && this.npcSystem.npcs) {
        this.npcSystem.npcs.forEach(npc => {
          if (npc && npc.active) updateDepth(npc)
        })
      }

      // Update legacy NPCs
      if (this.npcs) {
        this.npcs.forEach(npc => {
          if (npc && npc.active) updateDepth(npc)
        })
      }

      // Update interactive objects and animated props
      if (this.mapEffects) {
        if (Array.isArray(this.mapEffects.interactiveObjects)) {
          this.mapEffects.interactiveObjects.forEach(obj => {
            if (obj && obj.active) updateDepth(obj)
          })
        }

        if (Array.isArray(this.mapEffects.animatedProps)) {
          this.mapEffects.animatedProps.forEach(prop => {
            if (prop && prop.active) updateDepth(prop)
          })
        }
      }

      // Auto-update any child that requests depth-from-Y
      this.children.list.forEach(child => {
        if (child && child.depthFromY) {
          updateDepth(child)
        }
      })
    } catch (err) {
      console.error('Depth update error:', err)
    }
    // Throttled chunk updates
    const now = time
    if (now - this.lastChunkUpdate > this.chunkUpdateThrottle) {
      this.lastChunkUpdate = now
      
      if (this.player && this.chunkManager) {
        this.chunkManager.updateLoadedChunks(
          this.player.x,
          this.player.y,
          worldConfig.loadRadius
        ).catch(err => {
          console.error('Error updating chunks:', err)
        })
      }
    }
    
    // Spawn random particles occasionally
    if (now - this.lastParticleSpawn > this.particleSpawnInterval && this.player) {
      this.lastParticleSpawn = now
      const type = Phaser.Utils.Array.GetRandom(['dust', 'leaf'])
      this.particleSystem.spawnRandomParticles(
        this.player.x + Phaser.Math.Between(-100, 100),
        this.player.y + Phaser.Math.Between(-100, 100),
        50,
        type,
        1
      )
    }
    
    // Zone detection
    this.checkZone()
    
    // Update UI
    this.updateStatsDisplay()
  }
  
  updateStatsDisplay() {
    if (this.statsText && this.player) {
      const hpPercent = Math.floor((this.player.hp / this.player.maxHP) * 100)
      const staminaPercent = Math.floor((this.player.stamina / this.player.maxStamina) * 100)
      this.statsText.setText(`HP: ${this.player.hp}/${this.player.maxHP} (${hpPercent}%)\nStamina: ${Math.floor(this.player.stamina)}/${this.player.maxStamina} (${staminaPercent}%)`)
    }
  }
  
  checkZone() {
    if (!this.player) return
    
    const zone = worldConfig.getZoneAt(this.player.x, this.player.y)
    
    if (zone && zone.id !== this.currentZone?.id) {
      this.currentZone = zone
      if (this.zoneText) {
        this.zoneText.setText(`Zone: ${zone.name}`)
      }
      this.events.emit('player:enteredZone', { zoneId: zone.id })
    } else if (!zone && this.currentZone) {
      this.currentZone = null
      if (this.zoneText) {
        this.zoneText.setText('Zone: Wilderness')
      }
    }
  }
  
  handleZoneEnter(zoneId) {
    const questTriggers = {
      'spawn': () => {
        console.log('Quest: Welcome to the spawn zone!')
      },
      'forest': () => {
        console.log('Quest: Entered the forest. Find the ancient tree!')
      },
      'desert': () => {
        console.log('Quest: The desert is dangerous. Watch out for bandits!')
      }
    }
    
    if (questTriggers[zoneId]) {
      questTriggers[zoneId]()
    }
  }
  
  saveGame() {
    const npcStates = {}
    if (this.npcs) {
      this.npcs.forEach(npc => {
        if (npc.active) {
          npcStates[npc.id] = npc.getState()
        }
      })
    }
    
    const success = worldConfig.saveGame({
      playerX: this.player.x,
      playerY: this.player.y,
      timeOfDay: this.lighting ? this.lighting.getCurrentHour() : worldConfig.startHour,
      npcStates,
      playerState: this.player.getState()
    })
    
    if (success) {
      console.log('Game saved!')
    }
  }
  
  loadGame() {
    const saveData = worldConfig.loadGame()
    if (!saveData) {
      console.log('No save data found')
      return
    }
    
    this.player.x = saveData.playerX
    this.player.y = saveData.playerY
    
    if (saveData.playerState) {
      this.player.setStateFromSave(saveData.playerState)
    }
    
    if (this.lighting) {
      this.lighting.setTime(saveData.timeOfDay)
    }
    
    if (saveData.npcStates) {
      this.restoreNPCStates(saveData.npcStates)
    }
    
    console.log('Game loaded!')
  }
  
  restoreNPCStates(states) {
    Object.entries(states).forEach(([id, state]) => {
      const npc = this.npcs.find(n => n.id === id)
      if (npc && npc.active) {
        npc.setStateFromSave(state)
      }
    })
  }
  
  loadArea(centerX, centerY, radiusChunks) {
    return this.chunkManager.updateLoadedChunks(centerX, centerY, radiusChunks)
  }
  
  spawnNpc(templateId, x, y) {
    const npc = this.npcSystem.spawnNPC(x, y, { name: `NPC ${templateId}` })
    this.npcs.push(npc)
    this.npcChunkMap.set(npc.id, this.getNPCChunkKey(x, y))
    this.updateNPCCollisions()
    this.events.emit('npc:spawned', { id: npc.id })
    return npc
  }
  
  save() {
    this.saveGame()
  }
  
  load() {
    this.loadGame()
  }
  
  shutdown() {
    if (this.chunkManager) {
      this.chunkManager.destroy()
    }
    if (this.lighting) {
      this.lighting.destroy()
    }
    if (this.npcPool) {
      this.npcPool.destroy()
    }
    if (this.particleSystem) {
      this.particleSystem.destroy()
    }
    if (this.npcSystem) {
      this.npcSystem.destroy()
    }
    if (this.mapEffects) {
      this.mapEffects.destroy()
    }
  }
}
