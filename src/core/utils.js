export function updateDepth(obj, offset = 0) {
  if (!obj || typeof obj.setDepth !== 'function') return
  // Some objects (like Tilemap Layers) may not have a meaningful y; guard
  const y = (obj.y !== undefined && obj.y !== null) ? obj.y : (obj.body && obj.body.y) ? obj.body.y : 0
  const off = (obj.depthOffset !== undefined) ? obj.depthOffset : offset
  obj.setDepth(y + off)
}

export function autoUpdateDepthForChildren(scene) {
  if (!scene || !scene.children || !Array.isArray(scene.children.list)) return
  scene.children.list.forEach(child => {
    if (child && child.depthFromY) {
      updateDepth(child)
    }
  })
}
