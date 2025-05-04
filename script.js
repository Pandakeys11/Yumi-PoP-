document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    // Object to store explosion asset images
    const explosionAssets = {};
    // Player asset
    let playerAsset = new Image();
    // Enemy asset
    let enemyAsset = new Image();
    // Bomb asset
    let bombAsset = new Image();
    // Indestructible tile asset
    let indestructibleTileAsset = new Image();
    // Destructible tile asset
    let destructibleTileAsset = new Image();
    // Object to store power-up assets
    const powerupAssets = {}; // e.g., { 'bombRadius': Image, 'bombCount': Image, 'speed': Image }
    
        // Counter for loaded assets
    let loadedAssets = 0;
    const totalAssets = 10; // Adjust based on total number of assets
    
   
    // UI Elements
    const scoreDisplay = document.getElementById('score-display');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const restartButton = document.getElementById('restart-button');
    let requestID = null;

    // Game Constants
    const GRID_SIZE = 15; // e.g., 15x15 grid
    const TILE_SIZE = canvas.width / GRID_SIZE;
    canvas.height = TILE_SIZE * GRID_SIZE;

    const PLAYER_SPEED = 3;
    const BOMB_TIMER = 3000; // 3 seconds in milliseconds
    const EXPLOSION_DURATION = 500; // How long the explosion graphic shows (ms)
    const INITIAL_BOMBS = 1; // Player starts with 1 bomb
    const BOMB_POWER = 1; // Initial explosion radius
    const ENEMY_SPEED = 2; // Pixels per frame for enemies
    const ENEMY_DETECTION_RADIUS = 4;


    // Tile Types (for the map)
    const TILE_EMPTY = 0;
    const TILE_INDESTRUCTIBLE = 1;
    const TILE_DESTRUCTIBLE = 2;

    // Power-up Types
    const POWERUP_BOMB_RADIUS = 'bombRadius';
    const POWERUP_BOMB_COUNT = 'bombCount';
    const POWERUP_SPEED = 'speed';

    const SPEED_INCREASE = 0.5; // Amount to increase player speed

    // Game State
    const initialState = {
        player: null,
        bombs: [],
        explosions: [], // To manage active explosion animations
        enemies: [],
        powerups: [],
        difficultyLevel: 1, // Initialize difficulty level to 1
        score: 0, // Initialize score to 0
        gameMap: [], // Initialize game map to an empty array
        currentState: 'menu', // 'menu', 'playing', 'paused', 'gameOver', 'gameWon'
        gameStarted: false,
        gameOver: false,
        gameWon: false,
        overlayAlpha: 0
        assetsLoaded: false
    };

    const gameState = {
        ...initialState,
        difficultyLevel: 1, // Initialize difficulty level to 1
        gameStarted: false,
        gameOver: false,
        gameWon: false, // Added game won state
    };

    console.log('Game script loaded. Canvas and context obtained.');

    // Player Class (Simple object)
    function createPlayer(gridX, gridY) {
        return {
            x: gridX * TILE_SIZE,
            y: gridY * TILE_SIZE,
            gridX: gridX,
            gridY: gridY,
            speed: PLAYER_SPEED,
            size: TILE_SIZE * 0.8,
            color: '#00ff00',
            isMoving: false,
            targetX: gridX * TILE_SIZE,
            targetY: gridY * TILE_SIZE,
            movingTo: null,
            bombsAvailable: INITIAL_BOMBS,
            bombPower: BOMB_POWER,
            alive: true // Player state
        };
    }

    // Bomb Object
    function createBomb(gridX, gridY, power, plantedBy) {
        return {
            gridX: gridX,
            gridY: gridY,
            x: gridX * TILE_SIZE,
            y: gridY * TILE_SIZE,
            startTime: Date.now(),
            timer: BOMB_TIMER,
            power: power,
            plantedBy: plantedBy, // Reference to the player who planted it
            state: 'active' // 'active', 'exploding', 'finished'

        };
    }


     // Explosion Object
    function createExplosion(gridX, gridY) {
        return {
            gridX: gridX,
            gridY: gridY,
            startTime: Date.now(),
            duration: EXPLOSION_DURATION
        };
    }

    // Enemy Object (Simple object)
    function createEnemy(gridX, gridY) {
         // Calculate speed and detectionRadius based on difficulty level
         const speed = ENEMY_SPEED * gameState.difficultyLevel * 0.1 + ENEMY_SPEED;
         const detectionRadius = ENEMY_DETECTION_RADIUS * gameState.difficultyLevel * 0.1 + ENEMY_DETECTION_RADIUS;

         // Randomly choose a starting direction
         const directions = ['up', 'down', 'left', 'right'];
         const initialDirection = directions[Math.floor(Math.random() * directions.length)];
            // Initialize the state as 'patrolling'
        return {
             // ... existing properties ...
            x: gridX * TILE_SIZE,
            y: gridY * TILE_SIZE,





            gridX: gridX,
            gridY: gridY,
            speed: ENEMY_SPEED,

             // direction
             direction: initialDirection, // 'up', 'down', 'left', 'right'


             // Basic AI state
             moveDirection: null, // 'up', 'down', 'left', 'right'
             movingTo: null,
                 size: TILE_SIZE * 0.7, // Slightly smaller than player
                 color: '#ff00ff', // Magenta for enemy
                 alive: true,
                  state: 'patrolling', // 'patrolling', 'chasing'
                 detectionRadius: ENEMY_DETECTION_RADIUS, // How many tiles around to detect the player
             targetY: gridY * TILE_SIZE
        };
    }

    // Input Handling
    const keys = {};
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
         if (e.key === ' ' || e.key === 'b') {
             if (gameState.player) keys[e.key] = false;
         }
    });

    function handleInput() {
        if (gameState.gameOver || !gameState.player || !gameState.player.alive) return; // No input if game over or player dead

        // Movement input
        if (gameState.player.movingTo === null) {
            if (keys['ArrowUp'] || keys['w']) {
                tryMovePlayer(0, -1, 'up');
            } else if (keys['ArrowDown'] || keys['s']) {
                tryMovePlayer(0, 1, 'down');
            } else if (keys['ArrowLeft'] || keys['a']) {
                tryMovePlayer(-1, 0, 'left');
            } else if (keys['ArrowRight'] || keys['d']) {
                tryMovePlayer(1, 0, 'right');
            }
        }

        // Bomb drop input
         if ((keys[' '] || keys['b']) && gameState.player.bombsAvailable > 0) {
             const bombExists = gameState.bombs.some(bomb =>
                 bomb.gridX === gameState.player.gridX && bomb.gridY === gameState.player.gridY
             );

             if (!bombExists) {
                 placeBomb(gameState.player.gridX, gameState.player.gridY, gameState.player.bombPower, gameState.player);
             }
         }
    }

    // Attempt to move player to a new grid position
    function tryMovePlayer(dx, dy, direction) {
        const currentGridX = gameState.player.gridX;
        const currentGridY = gameState.player.gridY;
        const newGridX = currentGridX + dx;
        const newGridY = currentGridY + dy;

        // Check bounds and if the target tile is empty, not indestructible, and not currently exploding
        if (newGridX >= 0 && newGridX < GRID_SIZE && newGridY >= 0 && newGridY < GRID_SIZE) {
            const targetTileType = gameState.gameMap[newGridY][newGridX];
            const isExploding = gameState.explosions.some(exp => exp.gridX === newGridX && exp.gridY === newGridY);

            if (targetTileType === TILE_EMPTY && !isExploding) {
                gameState.player.targetX = newGridX * TILE_SIZE;
                gameState.player.targetY = newGridY * TILE_SIZE;
                gameState.player.movingTo = direction;
            } else {
                 // console.log(\`Blocked by tile or explosion at \${newGridX},\${newGridY}\`);
            }
        }
    }

    // Place a bomb
     function placeBomb(gridX, gridY, power, plantedBy) {
         // Check if a bomb already exists at the current grid position
         if (gameState.bombs.some(bomb => bomb.gridX === gridX && bomb.gridY === gridY)) {
             return; // Don't create a new bomb if one exists
         }
        const newBomb = createBomb(gridX, gridY, power, plantedBy);
        gameState.bombs.push(newBomb);
        plantedBy.bombsAvailable--;
        console.log(`Bomb planted at ${gridX}, ${gridY}. Bombs available: ${plantedBy.bombsAvailable}`);
    }
     // Explode a bomb
    function explodeBomb(bomb) {

        bomb.state = 'exploding';
        console.log(`Bomb exploding at ${bomb.gridX}, ${bomb.gridY} with power ${bomb.power}`);
        // Create explosion effects (radius)
        const explosionTiles = getExplosionTiles(bomb.gridX, bomb.gridY, bomb.power);
        
        // Create center explosion object
        gameState.explosions.push({ gridX: bomb.gridX, gridY: bomb.gridY, type: 'center', timer: EXPLOSION_DURATION });

        // Directions: up, down, left, right
        const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

        // Iterate through directions and create explosions
        directions.forEach(dir => {
            for (let i = 1; i <= bomb.power; i++) {
                const tileX = bomb.gridX + dir[0] * i;
                const tileY = bomb.gridY + dir[1] * i;

                // Check bounds
                if (tileX >= 0 && tileX < GRID_SIZE && tileY >= 0 && tileY < GRID_SIZE) {
                    const tileType = gameState.gameMap[tileY][tileX];
                    let explosionType = '';
                    
                    // Determine explosion type
                    if (dir[0] === 0 && dir[1] === -1) explosionType = (i === bomb.power || tileType !== TILE_EMPTY && tileType !== TILE_DESTRUCTIBLE) ? 'end-up' : 'vertical';
                    if (dir[0] === 0 && dir[1] === 1) explosionType = (i === bomb.power || tileType !== TILE_EMPTY && tileType !== TILE_DESTRUCTIBLE) ? 'end-down' : 'vertical';
                    if (dir[0] === -1 && dir[1] === 0) explosionType = (i === bomb.power || tileType !== TILE_EMPTY && tileType !== TILE_DESTRUCTIBLE) ? 'end-left' : 'horizontal';
                    if (dir[0] === 1 && dir[1] === 0) explosionType = (i === bomb.power || tileType !== TILE_EMPTY && tileType !== TILE_DESTRUCTIBLE) ? 'end-right' : 'horizontal';

                    // Explosion stops at indestructible blocks
                    if (tileType === TILE_INDESTRUCTIBLE) break;

                    gameState.explosions.push({ gridX: tileX, gridY: tileY, type: explosionType, timer: EXPLOSION_DURATION });

                    // Explosion stops after hitting a destructible block (it destroys the block, but doesn't go through)
                    if (tileType === TILE_DESTRUCTIBLE) {
                         gameState.gameMap[tileY][tileX] = TILE_EMPTY;
                         break;
                    }
            // Handle destroying destructible blocks
            if (gameState.gameMap[tile.y][tile.x] === TILE_DESTRUCTIBLE) {
                    gameState.gameMap[tile.y][tile.x] = TILE_EMPTY;
                console.log(`Destroyed block at ${tile.x}, ${tile.y}`);
            }        
        if (bomb.plantedBy) {
               // Add a small chance to create a power-up at the destroyed block's position
               if (gameState.gameMap[tile.y][tile.x] === TILE_EMPTY && Math.random() < 0.2) { // 20% chance
                const powerupTypes = [POWERUP_BOMB_RADIUS, POWERUP_BOMB_COUNT, POWERUP_SPEED];
                const powerupType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
                createPowerup(tile.x, tile.y, powerupType);
            }
            // Function to create a power-up
    function createPowerup(gridX, gridY, type) {
         if (gameState.powerups.length >= 3) {
                  console.log(`Powerup ignored`);
                  return;}
        const powerup = { gridX, gridY, type };
        gameState.powerups.push(powerup); }



            bomb.plantedBy.bombsAvailable++;
                
             console.log(`Bomb returned to player. Bombs available: ${bomb.plantedBy.bombsAvailable}`);
        }

        // Bomb object will be removed from gameState.bombs in the update loop after EXPLOSION_DURATION
        bomb.state = 'finished';
            
             // Check for collisions with player and enemies
            if (gameState.player && !gameState.gameOver) {
                 // Iterate through explosion objects
                  gameState.explosions.forEach(explosion => {
                 if (explosion.gridX === gameState.player.gridX && explosion.gridY === gameState.player.gridY) {
                        // Player is in the same grid tile as an explosion
                        console.log('Player hit by explosion!');
                        gameState.gameOver = true;
                        // Stop game loop or show game over screen
                 }
            });
            }


                
               
             // Check for enemy collisions
            gameState.enemies.forEach(enemy => {
                     // Iterate through explosion objects
                      gameState.explosions.forEach(explosion => {
                        // Check if the enemy is in the same grid tile as the current explosion object
                        if (enemy.gridX === explosion.gridX && enemy.gridY === explosion.gridY) {
                           console.log('Enemy hit by explosion!');
                          enemy.alive = false; // Or similar logic to handle enemy death
                       }
                   });
               
                 
               
            });
             // Check for chain reactions
             for (let i = gameState.bombs.length - 1; i >= 0; i--) {
                 const adjacentBomb = gameState.bombs[i];
                 if (adjacentBomb !== bomb && adjacentBomb.state === 'active' && explosionTiles.some(tile => tile.x === adjacentBomb.gridX && tile.y === adjacentBomb.gridY)) {
                     adjacentBomb.state = 'exploding'; // Set the state to exploding
                     explodeBomb(adjacentBomb);
                 }
             }

           }

         }

         // Function to load all assets
    function loadAssets() {
         // Explosion assets
         const explosionImagePaths = {
             'center': 'assets/explosion_center.png', // Replace with your image paths
             'horizontal': 'assets/explosion_horizontal.png', // Replace with your image paths
             'vertical': 'assets/explosion_vertical.png', // Replace with your image paths
             'end-up': 'assets/explosion_end_up.png', // Replace with your image paths
             'end-down': 'assets/explosion_end_down.png', // Replace with your image paths
             'end-left': 'assets/explosion_end_left.png', // Replace with your image paths
             'end-right': 'assets/explosion_end_right.png' // Replace with your image paths
         };
        for (const type in explosionImagePaths) {
             const img = new Image();
             img.src = explosionImagePaths[type];
             img.onload = () => {
                  explosionAssets[type] = img;
                 loadedAssets++;
                 if (loadedAssets === totalAssets) {
                     gameState.assetsLoaded = true;
                      gameState.currentState = 'menu';
                 }
             };
         }

         // Player asset
         playerAsset.src = 'assets/player.png'; // Replace with your image path
         playerAsset.onload = () => {
             loadedAssets++;
              if (loadedAssets === totalAssets) {
                  gameState.assetsLoaded = true;
                   gameState.currentState = 'menu';
             }
         };
         // Enemy asset
         enemyAsset.src = 'assets/enemy.png'; // Replace with your image path
         enemyAsset.onload = () => {
             loadedAssets++;
              if (loadedAssets === totalAssets) {
                 gameState.assetsLoaded = true;
                  gameState.currentState = 'menu';
             }
         };
         // Bomb asset
         bombAsset.src = 'assets/bomb.png'; // Replace with your image path
         bombAsset.onload = () => {
             loadedAssets++;
              if (loadedAssets === totalAssets) {
                  gameState.assetsLoaded = true;
                   gameState.currentState = 'menu';
             }
         };
         // Indestructible tile asset
         indestructibleTileAsset.src = 'assets/indestructible_tile.png'; // Replace with your image path
         indestructibleTileAsset.onload = () => {
              loadedAssets++;
              if (loadedAssets === totalAssets) {
                  gameState.assetsLoaded = true;
                   gameState.currentState = 'menu';
             }
         };
         // Destructible tile asset
         destructibleTileAsset.src = 'assets/destructible_tile.png'; // Replace with your image path
         destructibleTileAsset.onload = () => {
             loadedAssets++;
              if (loadedAssets === totalAssets) {
                  gameState.assetsLoaded = true;
                   gameState.currentState = 'menu';
             }
         };
         // Power-up assets (add more power-up types as needed)
         powerupAssets[POWERUP_BOMB_RADIUS] = new Image(); powerupAssets[POWERUP_BOMB_RADIUS].src = 'assets/powerup_bomb_radius.png';
         powerupAssets[POWERUP_BOMB_COUNT] = new Image(); powerupAssets[POWERUP_BOMB_COUNT].src = 'assets/powerup_bomb_count.png';
         powerupAssets[POWERUP_SPEED] = new Image(); powerupAssets[POWERUP_SPEED].src = 'assets/powerup_speed.png';
    }

    }

    // Calculate tiles affected by an explosion
    function getExplosionTiles(centerX, centerY, power) {
        const affectedTiles = [];

        // Directions: up, down, left, right
        const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

        directions.forEach(dir => {
            for (let i = 1; i <= power; i++) {
                const tileX = centerX + dir[0] * i;
                const tileY = centerY + dir[1] * i;

                // Check bounds
                if (tileX >= 0 && tileX < GRID_SIZE && tileY >= 0 && tileY < GRID_SIZE) {
                    const tileType = gameState.gameMap[tileY][tileX];

                    // Explosion stops at indestructible blocks
                    if (tileType === TILE_INDESTRUCTIBLE) {
                        break;
                    }

                    affectedTiles.push({ x: tileX, y: tileY });

                    // Explosion stops after hitting a destructible block (it destroys the block, but doesn't go through)
                    if (tileType === TILE_DESTRUCTIBLE) {
                         break;
                    }
                } else {
                    // Stop if out of bounds
                    break;
                }
            }
        });

        return affectedTiles;
    }

    // Game Update Logic
    function update() {
        if (gameState.currentState !== 'playing') return;

        handleInput();

        // Update player pixel position based on movement towards target
        const player = gameState.player;
        if (player && player.alive && player.movingTo) {
            let movedThisFrame = player.speed;

            if (player.movingTo === 'up') {
                player.y -= movedThisFrame;
                if (player.y < player.targetY) { player.y = player.targetY; }
            } else if (player.movingTo === 'down') {
                player.y += movedThisFrame;
                 if (player.y > player.targetY) { player.y = player.targetY; }
            } else if (player.movingTo === 'left') {
                player.x -= movedThisFrame;
                 if (player.x < player.targetX) { player.x = player.targetX; }
            } else if (player.movingTo === 'right') {
                player.x += movedThisFrame;
                 if (player.x > player.targetX) { player.x = player.targetX; }
            }

             // Check if target is reached (within a small tolerance) and snap to grid
             const tolerance = player.speed / 2;
             if (Math.abs(player.x - player.targetX) < tolerance && Math.abs(player.y - player.targetY) < tolerance) {
                 player.x = player.targetX;
                 player.y = player.targetY;
                 player.movingTo = null;
                 player.isMoving = false;
                 player.gridX = Math.round(player.x / TILE_SIZE);
                 player.gridY = Math.round(player.y / TILE_SIZE);
                 // console.log(`Player reached tile ${player.gridX}, ${player.gridY}`);
             } else {
                 player.isMoving = true;
             }
        }

        // Update bombs (check timers and explode)
        const currentTime = Date.now();
        for (let i = gameState.bombs.length - 1; i >= 0; i--) {
             const bomb = gameState.bombs[i];
             if (bomb.state === 'active' && currentTime - bomb.startTime >= bomb.timer) {
                explodeBomb(bomb);
             }
         }

          // Filter out finished bombs
         gameState.bombs = gameState.bombs.filter(bomb => bomb.state !== 'finished');
            
           // Power-up Collection Logic
           for (let i = gameState.powerups.length - 1; i >= 0; i--) {
            const powerup = gameState.powerups[i];
            if (powerup.gridX === gameState.player.gridX && powerup.gridY === gameState.player.gridY) {
                // Apply power-up effect
                switch (powerup.type) {
                 case POWERUP_BOMB_RADIUS:
                        gameState.player.bombPower++;
                        break;
                    case POWERUP_BOMB_COUNT:
                        gameState.player.bombsAvailable++; // Increase max bombs
                        break;
                    case POWERUP_SPEED:
                        gameState.player.speed += SPEED_INCREASE;
                        break;
                }
                gameState.powerups.splice(i, 1); // Remove collected power-up
                console.log(`Player collected a power-up: ${powerup.type}`);
            }
        }

        }

         // Update explosions (check duration and remove)
        for (let i = gameState.explosions.length - 1; i >= 0; i--) {
             const explosion = gameState.explosions[i];
             explosion.timer -= 1000/60;// Decrease timer (assuming ~60 FPS)
              if (explosion.timer <= 0) gameState.explosions.splice(i, 1); // Remove if timer is up
        
         }

        // --- Collision Checks ---

        // Player-Explosion Collision
         if (gameState.player && gameState.player.alive && gameState.explosions.some(exp =>
             exp.gridX === gameState.player.gridX && exp.gridY === gameState.player.gridY
            )) {
                console.log("Player hit by explosion! Game Over!");
                gameState.player.alive = false;
                gameState.gameOver = true;
                   // Stop game loop or show game over screen
                // TODO: Trigger game over sequence/visuals
           }
        
         // Enemy-Explosion Collision (already handled in explodeBomb, but could be checked here too)
         // We already iterate through enemies in explodeBomb for immediate effect. Keeping it there is fine.

         // Player-Enemy Collision (Simple check when both are on the same tile)
         if (gameState.player && gameState.player.alive) {
             gameState.enemies.forEach(enemy => {
                 if (enemy.alive && enemy.gridX === gameState.player.gridX && enemy.gridY === gameState.player.gridY) {
                     console.log("Player touched enemy! Game Over!");
                     gameState.player.alive = false;
                    gameState.gameOver = true;
                    // Stop game loop or show game over screen
                }
                
                   if (gameState.gameOver || gameState.gameWon) {
                    if (gameState.overlayAlpha < 1) {
                     gameState.overlayAlpha += 0.01; // Increment gradually
                      if (gameState.overlayAlpha > 1) gameState.overlayAlpha = 1; // Cap at 1
                      }

                 }
                
                
                 // Check for win condition (all enemies defeated)
                  if (gameState.enemies.length === 0) {
                     gameState.gameWon = true;
                     // Stop game loop or show win screen
                 }
             });
         }
     // Function to increase the difficulty level
     function increaseDifficulty() {
         gameState.difficultyLevel++;
         updateScoreDisplay(); // Update score display
         // TODO: Update enemy stats (or new enemies created will have higher stats)
         console.log(`Difficulty increased to level ${gameState.difficultyLevel}`);
     }


         // Enemy Movement Logic
         gameState.enemies.forEach(enemy => {
             if (!enemy.alive) return;
              // Calculate distance to player
              const distanceToPlayer = Math.sqrt(
                  Math.pow(gameState.player.gridX - enemy.gridX, 2) +
                  Math.pow(gameState.player.gridY - enemy.gridY, 2)
              );

              // AI State Management
              // If player is within detection radius and enemy is patrolling, start chasing
              if (distanceToPlayer <= enemy.detectionRadius && enemy.state === 'patrolling') {
                  enemy.state = 'chasing';
                  console.log(`Enemy is now Chasing`);
              }
              // If player is outside the detection radius and enemy is chasing, start patrolling
              else if (distanceToPlayer > enemy.detectionRadius && enemy.state === 'chasing') {
                  enemy.state = 'patrolling';
                  console.log(`Enemy is now Patrolling`);
              }

             // Calculate movement based on state
              // Enemy Movement Based on State
              let dx = 0, dy = 0;
              if (enemy.state === 'patrolling') {
                  // Patrolling: Move in current direction
                  switch (enemy.direction) {
                      case 'up': dy = -1; break;
                      case 'down': dy = 1; break;
                      case 'left': dx = -1; break;
                      case 'right': dx = 1; break;
                  }

                  // Check for random direction change (to make patrolling less predictable)
                  if (Math.random() < 0.01) { // 1% chance to change direction
                      enemy.direction = getRandomDirection(enemy);
                  }
              } else if (enemy.state === 'chasing') {
                  // Chasing: Move towards player
                  const diffX = gameState.player.gridX - enemy.gridX;
                  const diffY = gameState.player.gridY - enemy.gridY;

                  // Try to move in the dominant direction towards the player
                  if (Math.abs(diffX) > Math.abs(diffY)) {
                      dx = diffX > 0 ? 1 : -1; // Move horizontally towards the player
                  } else {
                      dy = diffY > 0 ? 1 : -1; // Move vertically towards the player
                  }
              }

              const newGridX = enemy.gridX + dx;
             const newGridY = enemy.gridY + dy;

             // Check if the tile ahead is blocked
             const isBlockedAhead = newGridX < 0 || newGridX >= GRID_SIZE || newGridY < 0 || newGridY >= GRID_SIZE ||
                 gameState.gameMap[newGridY][newGridX] === TILE_INDESTRUCTIBLE ||
                 gameState.gameMap[newGridY][newGridX] === TILE_DESTRUCTIBLE;

             if (isBlockedAhead) {
                 // Attempt side-step if blocked
                 let sideStepSuccessful = false;
                 const sideDirections = enemy.state === 'chasing' ? getPrioritySideDirections(enemy) : getSideDirections(enemy.direction);
                 for (const sideDirection of sideDirections) {
                     let sideDx = 0, sideDy = 0;
                     switch (sideDirection) {
                         case 'up': sideDy = -1; break;
                         case 'down': sideDy = 1; break;
                         case 'left': sideDx = -1; break;
                         case 'right': sideDx = 1; break;
                     }

                     // Check if the side tile is clear
                     if (isValidMove(enemy, sideDx, sideDy)) {
                         // Change direction to side-step
                         dx = sideDx;
                         dy = sideDy;
                         enemy.direction = sideDirection;
                         sideStepSuccessful = true;
                         break;
                     }
                 }

                 // If side-step failed, fall back to basic direction change
                 if (!sideStepSuccessful) {
                     if (enemy.state === 'chasing') {
                         // If chasing and blocked, try moving in the perpendicular direction if it also reduces the distance to the player
                         const diffX = gameState.player.gridX - enemy.gridX;
                         const diffY = gameState.player.gridY - enemy.gridY;

                         if (Math.abs(diffX) > Math.abs(diffY)) { // If previously trying to move horizontally
                             if (diffY > 0 && isValidMove(enemy, 0, 1)) { dy = 1; dx = 0; } // Try moving down
                             else if (diffY < 0 && isValidMove(enemy, 0, -1)) { dy = -1; dx = 0; } // Try moving up
                         } else { // If previously trying to move vertically
                             if (diffX > 0 && isValidMove(enemy, 1, 0)) { dx = 1; dy = 0; } // Try moving right
                             else if (diffX < 0 && isValidMove(enemy, -1, 0)) { dx = -1; dy = 0; } // Try moving left
                         }
                     }
                     // If still blocked or in patrolling mode, change direction
                     if (enemy.state === 'patrolling' || (enemy.state === 'chasing' && !isValidMove(enemy, dx, dy))) {
                         enemy.direction = getRandomDirection(enemy);
                     }

                     if (enemy.state === 'chasing' && !isValidMove(enemy, dx, dy)) {
                         enemy.direction = getRandomDirection(enemy);
                         enemy.state = 'patrolling';
                         console.log("Enemy is now Patrolling");
                  }
                  
                  if (enemy.state === 'chasing' && !isValidMove(enemy, dx, dy)) {
                          enemy.direction = getRandomDirection(enemy);
                          enemy.state = 'patrolling';
                      console.log("Enemy is now Patrolling");
                  }
                 }

             }

             const isBlocked = newGridX < 0 || newGridX >= GRID_SIZE || newGridY < 0 || newGridY >= GRID_SIZE ||
                 gameState.gameMap[newGridY][newGridX] === TILE_INDESTRUCTIBLE ||
                 gameState.gameMap[newGridY][newGridX] === TILE_DESTRUCTIBLE;
             // Update position if not blocked
                  enemy.targetX = newGridX * TILE_SIZE;
                  enemy.targetY = newGridY * TILE_SIZE;
                  enemy.gridX = newGridX; // Update grid position
                  enemy.gridY = newGridY;
              }

             // Update enemy pixel position based on movement towards target
             if (enemy.alive) {
                 let movedThisFrame = enemy.speed;
                 if (dy === -1) { // Moving up
                     enemy.y -= movedThisFrame; // Move up
                     if (enemy.y < enemy.targetY) { enemy.y = enemy.targetY; }
                 } else if (dy === 1) { // Moving down
                     enemy.y += movedThisFrame; // Move down
                     if (enemy.y > enemy.targetY) { enemy.y = enemy.targetY; }
                 } else if (dx === -1) { // Moving left
                     enemy.x -= movedThisFrame; // Move left
                      if (enemy.x < enemy.targetX) { enemy.x = enemy.targetX; }
                 } else if (dx === 1) { // Moving right
                     enemy.x += movedThisFrame; // Move right
                     if (enemy.x > enemy.targetX) { enemy.x = enemy.targetX; }
                 }

                   // Draw power-ups
                  gameState.powerups.forEach(powerup => {
                    let powerupColor;
                    switch (powerup.type) {
                        case POWERUP_BOMB_RADIUS:
                            powerupColor = 'green';
                            break;
                        case POWERUP_BOMB_COUNT:
                            powerupColor = 'blue';
                            break;
                        case POWERUP_SPEED:
                            powerupColor = 'yellow';
                            break;
                        default:
                            powerupColor = 'white'; // Default color
                    }
                    ctx.fillStyle = powerupColor;
                    ctx.fillRect(powerup.gridX * TILE_SIZE, powerup.gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                });

                  // Check if target is reached and update grid position
                  const tolerance = enemy.speed / 2;
                  if (Math.abs(enemy.x - enemy.targetX) < tolerance && Math.abs(enemy.y - enemy.targetY) < tolerance) {
                      enemy.x = enemy.targetX;
                      enemy.y = enemy.targetY;
                      enemy.gridX = Math.round(enemy.x / TILE_SIZE);
                      enemy.gridY = Math.round(enemy.y / TILE_SIZE);
                      enemy.movingTo = null;
                      // enemy.gridX and gridY were updated when setting the target
                 }

                 function getPrioritySideDirections(enemy) {
                     // Prioritize sides closer to player's alignment (horizontal or vertical)
                     const diffX = gameState.player.gridX - enemy.gridX;
                     const diffY = gameState.player.gridY - enemy.gridY;
                     const preferredSide1 = Math.abs(diffX) > Math.abs(diffY) ? (diffY > 0 ? 'down' : 'up') : (diffX > 0 ? 'right' : 'left');
                     const preferredSide2 = Math.abs(diffX) > Math.abs(diffY) ? (diffY > 0 ? 'up' : 'down') : (diffX > 0 ? 'left' : 'right');

                     return [preferredSide1, preferredSide2, ...getSideDirections(enemy.direction)];
                 }

                 function getSideDirections(currentDirection) {
                     // Get side directions relative to the current direction
                     switch (currentDirection) {
                         case 'up': return ['left', 'right', 'up', 'down'];
                         case 'down': return ['left', 'right', 'down', 'up'];
                         case 'left': return ['up', 'down', 'left', 'right'];
                         case 'right': return ['up', 'down', 'right', 'left'];
                         default: return ['up', 'down', 'left', 'right'];
                     }
                 }
                  }
             }

             function isValidMove(enemy, dx, dy) {
                 const newGridX = enemy.gridX + dx;
                 const newGridY = enemy.gridY + dy;
                 return !(newGridX < 0 || newGridX >= GRID_SIZE || newGridY < 0 || newGridY >= GRID_SIZE ||
                     gameState.gameMap[newGridY][newGridX] === TILE_INDESTRUCTIBLE ||
                     gameState.gameMap[newGridY][newGridX] === TILE_DESTRUCTIBLE);
             }
             function getRandomDirection(enemy) {
                const directions = ['up', 'down', 'left', 'right'];
                const randomDirection = directions[Math.floor(Math.random() * directions.length)];
                return randomDirection;
             }
         });
    }

    // Game Rendering Logic
    function render() {
         if (!canvas || !ctx) return;

        // Clear canvas
        ctx.fillStyle = '#1a1a1a'; // Match body background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

         // Draw based on game state
         if (gameState.currentState === 'menu') {
             // Show start menu
             ctx.fillStyle = '#000';
             ctx.font = '48px sans-serif';
             ctx.textAlign = 'center';
             ctx.fillText('Bomberman', canvas.width / 2, canvas.height / 2 - 50);

             // Ensure only the start button is visible in the menu state
             startButton.style.display = 'block';
             pauseButton.style.display = 'none';
             restartButton.style.display = 'none';
             scoreDisplay.style.display = 'none';
         } else if (gameState.currentState === 'playing') {
             // Show the game elements
             drawGameElements(ctx);
             startButton.style.display = 'none';
             pauseButton.style.display = 'block';
             restartButton.style.display = 'block';
             scoreDisplay.style.display = 'block';
         } else if (gameState.currentState === 'paused') {
             // Draw the game elements with a semi-transparent overlay and "Paused" text
             drawGameElements(ctx);
             ctx.globalAlpha = 0.5; // Set transparency for overlay
             ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black overlay
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.globalAlpha = 1.0; // Reset transparency
             ctx.fillStyle = '#fff';
             ctx.font = '48px sans-serif';
             ctx.textAlign = 'center';
             ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
             ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black overlay
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.fillStyle = '#fff'; // White text
             ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
             startButton.style.display = 'none';
             pauseButton.style.display = 'block';
             restartButton.style.display = 'block';
             scoreDisplay.style.display = 'block';
         } else if (gameState.gameOver || gameState.gameWon) {
             // Draw the game elements with the final state and show "Game Over" or "You Win!" text
             drawGameElements(ctx);
             startButton.style.display = 'none';
               if (gameState.gameOver) {
                 ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black overlay
                 ctx.fillRect(0, 0, canvas.width, canvas.height);
                 ctx.fillStyle = '#fff'; // Red text
                 ctx.font = '48px sans-serif';
                 ctx.textAlign = 'center';
                 ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
                } else if (gameState.gameWon) {
                   ctx.fillStyle = '#00ff00'; // Green text
                   ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
             pauseButton.style.display = 'none';
             restartButton.style.display = 'block';
             scoreDisplay.style.display = 'block';
         }

     }

     function drawGameElements(ctx) {
            // Draw game map and grid lines

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const tileType = gameState.gameMap[y][x];
               if (tileType === TILE_INDESTRUCTIBLE) {
                    ctx.drawImage(indestructibleTileAsset, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } else if (tileType === TILE_DESTRUCTIBLE) {
                    ctx.drawImage(destructibleTileAsset, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
                 // Draw grid lines for empty and block tiles
                 ctx.strokeStyle = '#333';
                 ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              
            }
        }

        // Draw bombs
        gameState.bombs.forEach(bomb => {
            if (bomb.state === 'active') {
               ctx.drawImage(bombAsset, bomb.x, bomb.y, TILE_SIZE, TILE_SIZE);
               const timeElapsed = Date.now() - bomb.startTime;
                  const bombCenterX = bomb.x + TILE_SIZE / 2;
                  const bombCenterY = bomb.y + TILE_SIZE / 2;
                  const bombRadius = TILE_SIZE * 0.3;
                 //ctx.beginPath();
                 //ctx.arc(bombCenterX, bombCenterY, bombRadius, 0, Math.PI * 2);
                 //ctx.fill();
                 const timerProgress = timeElapsed / BOMB_TIMER;
                 const indicatorSize = TILE_SIZE * 0.6 * (1 - timerProgress);
                 ctx.fillStyle = '#ffff00'; // Yellow indicator
                 ctx.fillRect(bomb.x + (TILE_SIZE - indicatorSize) / 2, bomb.y + (TILE_SIZE - indicatorSize) / 2, indicatorSize, indicatorSize);
            }
        });
        
        // Draw explosions
        gameState.explosions.forEach(explosion => {
               ctx.drawImage(explosionAssets[explosion.type], explosion.gridX * TILE_SIZE, explosion.gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        });


        // Draw enemies
        gameState.enemies.forEach(enemy => {
            if (enemy.alive) {
                 ctx.drawImage(enemyAsset, enemy.x, enemy.y, TILE_SIZE, TILE_SIZE);
            }
        });

        // Draw player (draw player last so they are on top of other objects)
        if (gameState.player && gameState.player.alive) {
             ctx.drawImage(playerAsset, gameState.player.x, gameState.player.y, TILE_SIZE, TILE_SIZE);
        }


         // Draw power-ups
           gameState.powerups.forEach(powerup => {
               ctx.drawImage(powerupAssets[powerup.type], powerup.gridX * TILE_SIZE, powerup.gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
           });
         }
         // Draw game won screen/message
        if (gameState.gameWon) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black overlay
            ctx.fillRect(0, 0, canvas.width, canvas.height);
               ctx.fillStyle = '#00ff00'; // Green text
               ctx.globalAlpha = gameState.overlayAlpha;
            ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
                  ctx.globalAlpha = 1.0;
              gameState.currentState = 'gameWon';
        }

    }

    // Main Game Loop
    function gameLoop() {
           requestID = null
           requestID = requestAnimationFrame(gameLoop);
        if (gameState.currentState !== 'playing') {
            render(); // Only render the UI if not playing
            requestAnimationFrame(gameLoop);
            return;
        }
        update();
        render();
    
          if (requestID === null) {
             requestID = requestAnimationFrame(gameLoop);
          }

    }

    // --- Game State Management Functions ---

    function startGame() {
        // Initialize the game state
        gameState.currentState = 'playing';
        // Initialize the game state with the initial game state
        Object.assign(gameState, {
            ...initialState, // Copies all initial properties
            currentState: 'playing' // Overrides the state to 'playing'
        });
        initializeGame();
        updateScoreDisplay(); // Update the score display to the initial value
    }

    function pauseGame() {
        if (gameState.currentState === 'playing') {
            gameState.currentState = 'paused';
              if (requestID !== null) {
               cancelAnimationFrame(requestID);
               requestID = null;
        } else if (gameState.currentState === 'paused') {
            gameState.currentState = 'playing';
        }
         render();
    }

    function restartGame() {
        gameState.currentState = 'menu';
        startGame();
      
         // Reset the score
         gameState.score = 0;
        updateScoreDisplay(); // Update the score display
        update()
        render();
        requestAnimationFrame(gameLoop);
    }

    // --- WalletConnect Logic (Keep existing) ---
    const providerOptions = {};
    const web3Modal = new Web3Modal.default({
        cacheProvider: true,
        providerOptions
    });

    const connectWalletButton = document.getElementById('connectWalletButton');
    const walletAddressDisplay = document.getElementById('walletAddressDisplay');
    let provider;
    let connectedAddress = null;

    async function connectWallet() {
        try {
            console.log("Opening WalletConnect modal...");
            provider = await web3Modal.connect();
            provider.on("accountsChanged", handleAccountsChanged);
            provider.on("chainChanged", (chainId) => { console.log("chainChanged", chainId); });
            provider.on("disconnect", (code, reason) => { console.log("disconnect", code, reason); resetWalletConnection(); });
            const accounts = await provider.request({ method: 'eth_accounts' });
            handleAccountsChanged(accounts);
        } catch (e) {
            console.error("Could not connect wallet", e);
            walletAddressDisplay.textContent = 'Connection failed';
        }
    }

    function handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            console.log('Please connect your wallet.');
            resetWalletConnection();
        } else if (accounts[0] !== connectedAddress) {
            connectedAddress = accounts[0];
            console.log('Connected address:', connectedAddress);
            walletAddressDisplay.textContent = `Connected: ${connectedAddress.substring(0, 6)}...${connectedAddress.slice(-4)}`;
            document.querySelector('#playerStats p:first-child').textContent = `Username: Player_${connectedAddress.substring(2, 6)}`;
            document.querySelector('#playerStats p:last-child').textContent = 'Stats: Ready';

            if (!gameState.gameStarted) {
                initializeGame();
            }
        }
    }

    function resetWalletConnection() {
        connectedAddress = null;
        walletAddressDisplay.textContent = '';
        document.querySelector('#playerStats p:first-child').textContent = 'Username: Guest';
        document.querySelector('#playerStats p:last-child').textContent = 'Stats: Loading...';
        console.log('Wallet connection reset.');
        gameState.gameStarted = false;
        gameState.gameOver = false; // Reset game over state
        gameState.player = null;
        gameState.bombs = [];
        gameState.explosions = [];
        gameState.enemies = [];
        gameState.gameMap = []; // Clear map on reset
        render(); // Render cleared state
    }

    connectWalletButton.addEventListener('click', connectWallet);

    if (web3Modal.cachedProvider) {
        console.log("Found cached provider, attempting to connect...");
        connectWallet();
    } else {
         console.log("No cached provider. Game will start after wallet connection.");
    }

    // --- Game Initialization ---
    // Initialize the score display
    updateScoreDisplay();
    render(); // Render the menu
    function initializeGame() {
         //if (gameState.gameStarted) return; // Prevent double initialization

         console.log("Initializing game...");

         // Reset game state for new game
         gameState.bombs = [];
         gameState.explosions = [];
         gameState.enemies = [];
          gameState.overlayAlpha = 0;
         gameState.gameOver = false; // Ensure game over is false at start

         // Generate a simple random-ish map with destructible blocks
         gameState.gameMap = generateMap();

         gameState.player = createPlayer(1, 1); // Start player at a safe empty tile (1,1)

         // Ensure player start area is empty
         ensureEmptyTile(gameState.player.gridX, gameState.player.gridY);
         ensureEmptyTile(gameState.player.gridX + 1, gameState.player.gridY);
         ensureEmptyTile(gameState.player.gridX - 1, gameState.player.gridY);
         ensureEmptyTile(gameState.player.gridX, gameState.player.gridY + 1);
         ensureEmptyTile(gameState.player.gridY - 1, gameState.player.gridX);

         // Add some enemies (example: 3 enemies at random empty spots)
         const numEnemies = 3;
         for (let i = 0; i < numEnemies; i++) {
             let enemyPlaced = false;
             while(!enemyPlaced) {
                 const randomX = Math.floor(Math.random() * GRID_SIZE);
                 const randomY = Math.floor(Math.random() * GRID_SIZE);

                 // Place enemy only on empty tiles and not too close to the player start
                 if (gameState.gameMap[randomY][randomX] === TILE_EMPTY &&
                     (Math.abs(randomX - gameState.player.gridX) > 2 || Math.abs(randomY - gameState.player.gridY) > 2)) { // Ensure distance > 2 tiles

                     // Ensure no other enemy is already there
                     const enemyExists = gameState.enemies.some(enemy => enemy.gridX === randomX && enemy.gridY === randomY);

                     if (!enemyExists) {
                          gameState.enemies.push(createEnemy(randomX, randomY));
                          enemyPlaced = true;
                          console.log(`Placed enemy at ${randomX}, ${randomY}`);
                     }
                 }
             }
         }
         



        loadAssets();
         gameState.gameStarted = true;
         console.log("Game initialized. Starting loop.");
         gameLoop();
    }

     // Helper to ensure a tile is empty if it's within bounds and not indestructible
     function ensureEmptyTile(gridX, gridY) {
         if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
             if (gameState.gameMap[gridY][gridX] !== TILE_INDESTRUCTIBLE) {
                 gameState.gameMap[gridY][gridX] = TILE_EMPTY;
             }
         }
     }

    // Simple Map Generation Function
    function generateMap() {
        const map = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            map[y] = [];
            for (let x = 0; x < GRID_SIZE; x++) {
                // Create outer walls
                if (x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1) {
                    map[y][x] = TILE_INDESTRUCTIBLE;
                // Create internal indestructible blocks (every other tile for classic feel)
                } else if (x % 2 === 0 && y % 2 === 0) {
                    map[y][x] = TILE_INDESTRUCTIBLE;
                } else {
                    // Fill remaining with a chance of destructible blocks
                    if (Math.random() < 0.6) { // 60% chance of destructible block
                        map[y][x] = TILE_DESTRUCTIBLE;
                    } else {
                        map[y][x] = TILE_EMPTY;
                    }
                }
            }
        }
        return map;
    }

     // Function to update the score display
     function updateScoreDisplay() {
         if (scoreDisplay) scoreDisplay.textContent = `Score: ${gameState.score}`;
     }

    // --- UI Interactions ---
     // Hook up button events
    if (startButton) {
         startButton.addEventListener('click', startGame);
     }
     if (pauseButton) {
         pauseButton.addEventListener('click', pauseGame);
     }
     if (restartButton) {
         restartButton.addEventListener('click', restartGame);
     }


     // Initialize the game with the 'menu' state
     gameState.currentState = 'menu';




});