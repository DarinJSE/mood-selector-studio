export default class ObjectPool {
  constructor(scene, factoryFn, initialSize = 10) {
    this.scene = scene
    this.factoryFn = factoryFn
    this.pool = []
    this.active = new Set()
    this.initialSize = initialSize
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factoryFn(scene))
    }
  }
  
  acquire(x, y, ...args) {
    let obj
    
    if (this.pool.length > 0) {
      obj = this.pool.pop()
    } else {
      obj = this.factoryFn(this.scene)
    }
    
    // Reset and activate
    obj.setActive(true)
    obj.setVisible(true)
    obj.x = x
    obj.y = y
    
    // Call reset method if exists
    if (obj.reset) {
      obj.reset(...args)
    }
    
    this.active.add(obj)
    return obj
  }
  
  release(obj) {
    if (!this.active.has(obj)) return
    
    obj.setActive(false)
    obj.setVisible(false)
    
    // Call cleanup method if exists
    if (obj.cleanup) {
      obj.cleanup()
    }
    
    this.active.delete(obj)
    this.pool.push(obj)
  }
  
  releaseAll() {
    const activeArray = Array.from(this.active)
    activeArray.forEach(obj => this.release(obj))
  }
  
  getActive() {
    return Array.from(this.active)
  }
  
  destroy() {
    this.releaseAll()
    this.pool.forEach(obj => {
      if (obj.destroy) obj.destroy()
    })
    this.pool = []
    this.active.clear()
  }
}

