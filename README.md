# Phaser 3 Open-World 2D RPG

A complete open-world 2D map system built with Phaser 3 and Vite, featuring chunk-based streaming, NPCs, day/night cycle, and minimap.

## Features

- **Large Open World**: 200x200 tile world (6400x6400 pixels) with chunk-based streaming
- **Chunk System**: Automatic loading/unloading of map chunks based on player position
- **NPCs**: Spawnable NPCs with state machines (idle, patrol, follow, interact)
- **Day/Night Cycle**: Dynamic lighting system with configurable time scale
- **Minimap**: Overlay minimap showing loaded chunks and player position
- **Save/Load**: LocalStorage-based save system for player position, NPC states, and time
- **Pathfinding**: EasyStar.js integration for NPC pathfinding
- **Placeholder Assets**: Auto-generated placeholder textures so the game runs out-of-the-box

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` (or the port shown in terminal).

## Controls

- **WASD / Arrow Keys**: Move player
- **E**: Interact with NPCs
- **M**: Toggle minimap
- **S**: Save game
- **L**: Load game

## Configuration

Edit `src/core/worldConfig.js` to customize:

- `tileSize`: Size of each tile in pixels (default: 32)
- `chunkSize`: Tiles per chunk (default: 16)
- `worldWidth` / `worldHeight`: World size in tiles (default: 200x200)
- `loadRadius`: Chunk loading radius around player (default: 2)
- `timeScale`: Time speed multiplier (default: 1.0)
- `zones`: Named zones with boundaries

## Chunk System

The world is divided into chunks (16x16 tiles by default). Only chunks within the load radius are kept in memory. Chunks are automatically:

- **Loaded** when player enters range
- **Unloaded** when player leaves range
- **Generated** procedurally if chunk JSON files don't exist

### Chunk Files

Place chunk JSON files in `src/maps/chunks/` with format: `{chunkX}_{chunkY}.json`

Example: `0_0.json`, `1_0.json`, etc.

If files don't exist, chunks are procedurally generated with random terrain.

## Day/Night Cycle

The lighting system cycles through:
- **Dawn** (6-8): Brightening from night to day
- **Day** (8-18): Full brightness
- **Dusk** (18-20): Darkening from day to night
- **Night** (20-6): Dark with blue tint

Time advances automatically. Press **S** to save current time, **L** to load.

## Minimap

Press **M** to toggle the minimap overlay. It shows:
- Green rectangles: Currently loaded chunks
- Yellow borders: Zone boundaries
- Red dot: Player position

## NPCs

NPCs spawn automatically in the starting area. They support:
- State machine (idle, patrol, follow, interact)
- Pathfinding (when pathfinder is configured)
- Interaction system (press E near NPC)

## API

### WorldScene Methods

```javascript
// Load area around point
world.loadArea(centerX, centerY, radiusChunks)

// Spawn NPC
world.spawnNpc(templateId, x, y)

// Save/Load
world.save()
world.load()
```

### Events

- `chunk:loaded` - Emitted when chunk loads
- `chunk:unloaded` - Emitted when chunk unloads
- `player:enteredZone` - Emitted when player enters zone
- `npc:spawned` - Emitted when NPC spawns
- `time:changed` - Emitted when time of day changes

## Project Structure

```
src/
  core/
    worldConfig.js       # World configuration
    assetPlaceholders.js # Placeholder texture generator
    player.js            # Player entity
  scenes/
    WorldScene.js        # Main world scene
    MiniMapScene.js      # Minimap overlay
  systems/
    chunkManager.js      # Chunk loading/unloading
    objectPool.js        # Sprite pooling
    lightingSystem.js    # Day/night cycle
    pathfinder.js        # Pathfinding integration
  entities/
    npc.js              # NPC entity
  maps/
    chunks/             # Chunk JSON files (optional)
    example_world.json  # Example map data
```

## Performance Tips

- Adjust `loadRadius` in `worldConfig.js` to balance performance vs. view distance
- Use object pooling for frequently spawned/despawned entities
- Keep chunk size reasonable (16x16 is a good default)
- Minimize dynamic objects per chunk

## Dependencies

- Phaser 3.80.1+
- EasyStar.js 0.5.1+ (for pathfinding)
- Vite 7.2.2+ (dev server)

## License

MIT

