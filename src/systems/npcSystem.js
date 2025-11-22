import NPC from '../entities/npc.js'
import ObjectPool from './objectPool.js'
import worldConfig from '../core/worldConfig.js'
import { updateDepth } from '../core/utils.js'

export default class NPCSystem {
  constructor(scene, pathfinder) {
    this.scene = scene
    this.pathfinder = pathfinder
    this.npcs = []
    this.npcPool = new ObjectPool(scene, (s) => {
      const npc = new NPC(s, 0, 0)
      npc.pathfinder = pathfinder
      return npc
    }, 15)
    
    this.behaviorTimers = new Map()
    this.interactionRange = 48
  }
  
  spawnNPC(x, y, config = {}) {
    const npc = this.npcPool.acquire(x, y, {
      name: config.name || `NPC ${this.npcs.length + 1}`,
      speed: config.speed || Phaser.Math.Between(40, 60),
      usePathfinding: config.usePathfinding !== false,
      ...config
    })
    
    npc.pathfinder = this.pathfinder
    this.npcs.push(npc)
    // Flag for Y-based depth sorting
    npc.depthFromY = true
    npc.depthOffset = 0
    
    // Set random behavior
    this.setRandomBehavior(npc)
    
    return npc
  }
  
  setRandomBehavior(npc) {
    // Random behavior: idle, patrol, or wander
    const behaviors = ['idle', 'patrol', 'wander']
    const behavior = Phaser.Utils.Array.GetRandom(behaviors)
    
    switch(behavior) {
      case 'idle':
        npc.state = 'idle'
        // Set timer to change behavior later
        this.setBehaviorTimer(npc, Phaser.Math.Between(3000, 8000))
        break
        
      case 'patrol':
        // Create patrol points around spawn
        const patrolPoints = this.generatePatrolPoints(npc.x, npc.y, 3)
        npc.patrolPoints = patrolPoints
        npc.state = 'patrol'
        break
        
      case 'wander':
        // Set random target to wander to
        this.setWanderTarget(npc)
        break
    }
  }
  
  generatePatrolPoints(centerX, centerY, count) {
    const points = []
    const radius = 80
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      })
    }
    
    return points
  }
  
  setWanderTarget(npc) {
    const angle = Math.random() * Math.PI * 2
    const distance = Phaser.Math.Between(50, 150)
    const target = {
      x: npc.x + Math.cos(angle) * distance,
      y: npc.y + Math.sin(angle) * distance
    }
    
    npc.patrolPoints = [target]
    npc.state = 'patrol'
    
    // Set timer to change target
    this.setBehaviorTimer(npc, Phaser.Math.Between(5000, 12000))
  }
  
  setBehaviorTimer(npc, delay) {
    // Clear existing timer
    if (this.behaviorTimers.has(npc.id)) {
      this.scene.time.removeEvent(this.behaviorTimers.get(npc.id))
    }
    
    const timer = this.scene.time.delayedCall(delay, () => {
      this.setRandomBehavior(npc)
    })
    
    this.behaviorTimers.set(npc.id, timer)
  }
  
  update() {
    this.npcs.forEach(npc => {
      if (!npc.active) return
      
      // Update NPC
      npc.update()
      // Ensure depth is kept in sync (after update)
      try {
        updateDepth(npc)
      } catch (err) {
        // ignore depth update errors
      }
      
      // Random idle animations
      if (npc.state === 'idle' && Math.random() < 0.001) {
        // Occasionally look around
        const angle = Math.random() * Math.PI * 2
        const distance = 20
        npc.patrolPoints = [{
          x: npc.x + Math.cos(angle) * distance,
          y: npc.y + Math.sin(angle) * distance
        }]
        npc.state = 'patrol'
        this.setBehaviorTimer(npc, 2000)
      }
    })
  }
  
  checkInteractions(player) {
    this.npcs.forEach(npc => {
      if (!npc.active) return
      
      const distance = Phaser.Math.Distance.Between(
        player.x, player.y,
        npc.x, npc.y
      )
      
      if (distance < this.interactionRange) {
        // NPC notices player
        if (npc.state === 'idle') {
          npc.setTarget(player)
          npc.state = 'follow'
        }
      } else {
        // Player too far, return to normal behavior
        if (npc.target === player) {
          npc.setTarget(null)
          this.setRandomBehavior(npc)
        }
      }
    })
  }
  
  spawnInChunk(chunkX, chunkY, count = 2) {
    const { x: worldX, y: worldY } = worldConfig.chunkToWorld(chunkX, chunkY)
    const chunkSizePx = worldConfig.getChunkSizePx()
    
    for (let i = 0; i < count; i++) {
      const spawnX = worldX + Math.random() * chunkSizePx
      const spawnY = worldY + Math.random() * chunkSizePx
      
      this.spawnNPC(spawnX, spawnY, {
        name: `Villager ${chunkX}_${chunkY}_${i}`
      })
    }
  }
  
  despawnNPC(npc) {
    const index = this.npcs.indexOf(npc)
    if (index > -1) {
      this.npcs.splice(index, 1)
      
      // Clear timer
      if (this.behaviorTimers.has(npc.id)) {
        this.scene.time.removeEvent(this.behaviorTimers.get(npc.id))
        this.behaviorTimers.delete(npc.id)
      }
      
      this.npcPool.release(npc)
    }
  }
  
  destroy() {
    this.npcs.forEach(npc => this.despawnNPC(npc))
    this.behaviorTimers.clear()
    if (this.npcPool) {
      this.npcPool.destroy()
    }
  }
}

