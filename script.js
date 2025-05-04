document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Initialize the score
    let score = 0;

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

    // Tile Types (for the map)
    const TILE_EMPTY = 0;
    const TILE_INDESTRUCTIBLE = 1;
    const TILE_DESTRUCTIBLE = 2;

    // Game State
    const gameState = {
        player: null,
        bombs: [],
        explosions: [], // To manage active explosion animations
        enemies: [],
        gameStarted: false,
        gameOver: false, // Added game over state
        gameMap: [] // Map will be generated or loaded
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
            exploded: false
        };
    }

    // Update the score
    function updateScore(points) {
        score += points;
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) scoreDisplay.textContent = `Score: ${score}`;
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
        return {
            x: gridX * TILE_SIZE,
            y: gridY * TILE_SIZE,
            gridX: gridX,
            gridY: gridY,
            speed: ENEMY_SPEED,
            size: TILE_SIZE * 0.7, // Slightly smaller than player
            color: '#ff00ff', // Magenta for enemy
            alive: true,
             // Basic AI state (e.g., for random movement)
             moveDirection: null, // 'up', 'down', 'left', 'right'
             movingTo: null,
             targetX: gridX * TILE_SIZE,
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
        const newBomb = createBomb(gridX, gridY, power, plantedBy);
        gameState.bombs.push(newBomb);
        plantedBy.bombsAvailable--;
        console.log(`Bomb planted at ${gridX}, ${gridY}. Bombs available: ${plantedBy.bombsAvailable}`);
    }

    // Explode a bomb
    function explodeBomb(bomb) {
        bomb.exploded = true;
        console.log(`Bomb exploding at ${bomb.gridX}, ${bomb.gridY} with power ${bomb.power}`);

        // Create explosion effects (center)
        gameState.explosions.push(createExplosion(bomb.gridX, bomb.gridY));

        // Create explosion effects (radius)
        const explosionTiles = getExplosionTiles(bomb.gridX, bomb.gridY, bomb.power);
        explosionTiles.forEach(tile => {
            // Avoid adding duplicate explosion effects on the same tile
             if (!gameState.explosions.some(exp => exp.gridX === tile.x && exp.gridY === tile.y)) {
                 gameState.explosions.push(createExplosion(tile.x, tile.y));
             }

            // Handle destroying destructible blocks
            if (gameState.gameMap[tile.y] && gameState.gameMap[tile.y][tile.x] === TILE_DESTRUCTIBLE) {
                gameState.gameMap[tile.y][tile.x] = TILE_EMPTY;
                console.log(`Destroyed block at ${tile.x}, ${tile.y}`);
            }
             // Handle hitting enemies
             gameState.enemies.forEach(enemy => {
                 if (enemy.alive && enemy.gridX === tile.x && enemy.gridY === tile.y) {
                     console.log(`Enemy hit by explosion at ${tile.x}, ${tile.y}!`);
                     enemy.alive = false;
                     updateScore(100); // Increase the score when an enemy is hit
                     // TODO: Add enemy removal/death animation. The enemy is removed in the update loop
                 }
             });
        });

        // Return bomb to player after the initial explosion logic
        if (bomb.plantedBy) {
            bomb.plantedBy.bombsAvailable++;
             console.log(`Bomb returned to player. Bombs available: ${bomb.plantedBy.bombsAvailable}`);
        }

        // Bomb object will be removed from gameState.bombs in the update loop after EXPLOSION_DURATION
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
        if (!gameState.gameStarted || gameState.gameOver) return; // Stop updates if game over

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
            if (!bomb.exploded && currentTime - bomb.startTime >= bomb.timer) {
                explodeBomb(bomb);
            }
        }

         // Update explosions (check duration and remove)
         for (let i = gameState.explosions.length - 1; i >= 0; i--) {
             const explosion = gameState.explosions[i];
             if (currentTime - explosion.startTime >= explosion.duration) {
                 gameState.explosions.splice(i, 1); // Remove explosion
             }
         }

        // --- Collision Checks ---

        // Player-Explosion Collision
         if (gameState.player && gameState.player.alive && gameState.explosions.some(exp =>
             exp.gridX === gameState.player.gridX && exp.gridY === gameState.player.gridY
         )) {
             console.log("Player hit by explosion! Game Over!");
             gameState.player.alive = false;
             gameState.gameOver = true;
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
                     // TODO: Trigger game over sequence/visuals
                 }
             });
         }

        // TODO: Implement enemy movement logic here
         gameState.enemies.forEach(enemy => {
             if (enemy.alive && enemy.movingTo === null) {
                 // Basic random movement for now
                 const directions = [[0, -1, 'up'], [0, 1, 'down'], [-1, 0, 'left'], [1, 0, 'right']];
                 const randomDirection = directions[Math.floor(Math.random() * directions.length)];
                 const dx = randomDirection[0];
                 const dy = randomDirection[1];
                 const direction = randomDirection[2];

                 const newGridX = enemy.gridX + dx;
                 const newGridY = enemy.gridY + dy;

                 // Check if the target tile is valid for enemy movement (empty and within bounds)
                 if (newGridX >= 0 && newGridX < GRID_SIZE && newGridY >= 0 && newGridY < GRID_SIZE &&
                     gameState.gameMap[newGridY][newGridX] === TILE_EMPTY) {

                     enemy.targetX = newGridX * TILE_SIZE;
                     enemy.targetY = newGridY * TILE_SIZE;
                     enemy.movingTo = direction;
                     enemy.gridX = newGridX; // Update enemy grid position immediately
                     enemy.gridY = newGridY;
                 }
             }
              // Update enemy pixel position based on movement towards target
             if (enemy.alive && enemy.movingTo) {
                 let movedThisFrame = enemy.speed;

                 if (enemy.movingTo === 'up') {
                     enemy.y -= movedThisFrame;
                     if (enemy.y < enemy.targetY) { enemy.y = enemy.targetY; }
                 } else if (enemy.movingTo === 'down') {
                     enemy.y += movedThisFrame;
                      if (enemy.y > enemy.targetY) { enemy.y = enemy.targetY; }
                 } else if (enemy.movingTo === 'left') {
                     enemy.x -= movedThisFrame;
                      if (enemy.x < enemy.targetX) { enemy.x = enemy.targetX; }
                 } else if (enemy.movingTo === 'right') {
                     enemy.x += movedThisFrame;
                      if (enemy.x > enemy.targetX) { enemy.x = enemy.targetX; }
                 }

                  // Check if target is reached and snap to grid
                  const tolerance = enemy.speed / 2;
                  if (Math.abs(enemy.x - enemy.targetX) < tolerance && Math.abs(enemy.y - enemy.targetY) < tolerance) {
                      enemy.x = enemy.targetX;
                      enemy.y = enemy.targetY;
                      enemy.movingTo = null;
                      // enemy.gridX and gridY were updated when setting the target
                  }
             }
         });
    }

    // Game Rendering Logic
    function render() {
        // Clear canvas
        ctx.fillStyle = '#1a1a1a'; // Match body background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw game map and grid lines
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const tileType = gameState.gameMap[y][x];
                if (tileType === TILE_INDESTRUCTIBLE) {
                    ctx.fillStyle = '#555'; // Dark grey for indestructible blocks
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } else if (tileType === TILE_DESTRUCTIBLE) {
                     ctx.fillStyle = '#8B4513'; // SaddleBrown for destructible blocks
                     ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
                 // Draw grid lines for empty and block tiles
                 ctx.strokeStyle = '#333';
                 ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }

        // Draw bombs
        gameState.bombs.forEach(bomb => {
            if (!bomb.exploded) {
                ctx.fillStyle = '#ff0000'; // Red for bomb
                const bombCenterX = bomb.x + TILE_SIZE / 2;
                const bombCenterY = bomb.y + TILE_SIZE / 2;
                const bombRadius = TILE_SIZE * 0.3;
                ctx.beginPath();
                ctx.arc(bombCenterX, bombCenterY, bombRadius, 0, Math.PI * 2);
                ctx.fill();
                 const timeElapsed = Date.now() - bomb.startTime;
                 const timerProgress = timeElapsed / BOMB_TIMER;
                 const indicatorSize = TILE_SIZE * 0.6 * (1 - timerProgress);
                 ctx.fillStyle = '#ffff00'; // Yellow indicator
                 ctx.fillRect(bomb.x + (TILE_SIZE - indicatorSize) / 2, bomb.y + (TILE_SIZE - indicatorSize) / 2, indicatorSize, indicatorSize);
            }
        });

         // Draw explosions
         gameState.explosions.forEach(explosion => {
             ctx.fillStyle = '#FFA500'; // Orange for explosion
             ctx.fillRect(explosion.gridX * TILE_SIZE, explosion.gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE); // Draw over the explosion tile
         });

         // Draw enemies
         gameState.enemies.forEach(enemy => {
             if (enemy.alive) {
                 ctx.fillStyle = enemy.color; // Magenta for enemy
                 const enemySize = enemy.size;
                 const enemyRenderX = enemy.x + (TILE_SIZE - enemySize) / 2;
                 const enemyRenderY = enemy.y + (TILE_SIZE - enemySize) / 2;
                 ctx.fillRect(enemyRenderX, enemyRenderY, enemySize, enemySize);
             }
         });

        // Draw player (draw player last so they are on top of other objects)
        if (gameState.player && gameState.player.alive) {
            ctx.fillStyle = gameState.player.color;
             const playerSize = gameState.player.size;
             const playerRenderX = gameState.player.x + (TILE_SIZE - playerSize) / 2;
             const playerRenderY = gameState.player.y + (TILE_SIZE - playerSize) / 2;
            ctx.fillRect(playerRenderX, playerRenderY, playerSize, playerSize);
        }

        // Draw game over screen/message
         if (gameState.gameOver) {
             ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black overlay
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.fillStyle = '#ff0000'; // Red text
             ctx.font = '48px sans-serif';
             ctx.textAlign = 'center';
             ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
         }

    }

    // Main Game Loop
    function gameLoop() {
        update();
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
    function initializeGame() {
         if (gameState.gameStarted) return; // Prevent double initialization

         console.log("Initializing game...");

         // Reset game state for new game
         gameState.bombs = [];
         gameState.explosions = [];
         gameState.enemies = [];
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

});