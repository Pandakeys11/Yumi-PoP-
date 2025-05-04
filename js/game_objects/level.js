class Level {
    constructor() {
        this.grid = [];
        this.player = null;
        this.enemies = [];
        this.bombs = [];
        this.powerups = [];
        this.initializeGrid();
    }

    initializeGrid() {
        console.log(`Initializing procedural grid: ${GRID_WIDTH}x${GRID_HEIGHT}`);
        // Create empty grid based on canvas size constants
        for (let y = 0; y < GRID_HEIGHT; y++) {
            this.grid[y] = [];
            for (let x = 0; x < GRID_WIDTH; x++) {
                this.grid[y][x] = 0; // Initialize all as floor
            }
        }

        // Add outer walls
        for (let x = 0; x < GRID_WIDTH; x++) {
            this.grid[0][x] = 1;
            this.grid[GRID_HEIGHT - 1][x] = 1;
        }
        for (let y = 1; y < GRID_HEIGHT - 1; y++) {
            this.grid[y][0] = 1;
            this.grid[y][GRID_WIDTH - 1] = 1;
        }

        // Add inner walls (checkerboard pattern)
        for (let y = 2; y < GRID_HEIGHT - 2; y += 2) {
            for (let x = 2; x < GRID_WIDTH - 2; x += 2) {
                this.grid[y][x] = 1;
            }
        }

        // Player start position (top-left corner)
        const startX = 1;
        const startY = 1;
        this.player = new Player(startX * GRID_SIZE, startY * GRID_SIZE);

        // Clear starting area for player (and potentially corners for enemies)
        this.grid[startY][startX] = 0; // Ensure player start is floor
        if (startX + 1 < GRID_WIDTH) this.grid[startY][startX+1] = 0; // Clear right
        if (startY + 1 < GRID_HEIGHT) this.grid[startY+1][startX] = 0; // Clear down
         // Clear other corners too? (Optional)
        // this.grid[1][GRID_WIDTH - 2] = 0; this.grid[1][GRID_WIDTH - 3] = 0; this.grid[2][GRID_WIDTH - 2] = 0; // Top-right
        // this.grid[GRID_HEIGHT - 2][1] = 0; this.grid[GRID_HEIGHT - 3][1] = 0; this.grid[GRID_HEIGHT - 2][2] = 0; // Bottom-left
        // this.grid[GRID_HEIGHT - 2][GRID_WIDTH - 2] = 0; // etc. Bot-right
        
        // Add destructible blocks randomly
        const destructibleChance = 0.4; // Adjust density
        for (let y = 1; y < GRID_HEIGHT - 1; y++) {
            for (let x = 1; x < GRID_WIDTH - 1; x++) {
                // Avoid placing over inner walls or cleared starting areas
                if (this.grid[y][x] === 0) { 
                    if (Math.random() < destructibleChance) {
                        this.grid[y][x] = 2;
                    }
                }
            }
        }
        
        // Re-clear starting area AFTER random blocks, just in case
        this.grid[startY][startX] = 0;
        if (startX + 1 < GRID_WIDTH) this.grid[startY][startX+1] = 0; 
        if (startY + 1 < GRID_HEIGHT) this.grid[startY+1][startX] = 0;

        // Add enemies randomly
        this.addEnemies(5); // Add a fixed number for now, adjust as needed
        
        console.log("Procedural grid initialized.");
    }

    addEnemies(count) {
        const enemyTypes = ['skeleton', 'ghost', 'demon'];
        let placedEnemies = 0;
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loops

        while (placedEnemies < count && attempts < maxAttempts) {
            attempts++;
            // Choose random grid position (avoiding edges)
            const x = Math.floor(Math.random() * (GRID_WIDTH - 2)) + 1;
            const y = Math.floor(Math.random() * (GRID_HEIGHT - 2)) + 1;

            // Check if tile is floor and not too close to player start
            if (this.grid[y][x] === 0 && (x > 3 || y > 3)) { 
                const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                this.enemies.push(new Enemy(x * GRID_SIZE, y * GRID_SIZE, type));
                placedEnemies++;
            } 
        }
        if (attempts >= maxAttempts) {
             console.warn(`Could only place ${placedEnemies} enemies after ${maxAttempts} attempts.`);
        }
        console.log(`Added ${placedEnemies} enemies.`);
    }

    update(deltaTime) {
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
            // Check for collision between player and enemies (basic)
            this.checkPlayerEnemyCollisions(); 
        }
        
        // Update enemies
        for (const enemy of this.enemies) {
            enemy.update(deltaTime);
        }

        // Update bombs & handle removal
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            bomb.update(deltaTime);
            // Remove bomb only after its explosion animation is finished
            if (bomb.finished) { 
                console.log("Removing finished bomb");
                this.bombs.splice(i, 1);
            }
        }

        // Check powerup collisions
        if (this.player) {
            this.checkPowerupCollisions();
        }
    }

    render(ctx) {
        // Draw grid tiles
        const gridHeight = this.grid.length;
        const gridWidth = this.grid[0] ? this.grid[0].length : 0;

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                if (!this.grid[y]) continue; 
                
                const tile = this.grid[y][x];
                const drawX = x * GRID_SIZE;
                const drawY = y * GRID_SIZE;

                if (tile === 1) { // Wall - Dark with cyan circuits
                    ctx.fillStyle = '#1a1a1a'; // Very dark gray
                    ctx.fillRect(drawX, drawY, GRID_SIZE, GRID_SIZE);
                    ctx.strokeStyle = '#00ffff'; // Cyan
                    ctx.lineWidth = 1.5;
                    // Simple circuit-like lines (example)
                    ctx.beginPath();
                    ctx.moveTo(drawX + GRID_SIZE * 0.2, drawY + GRID_SIZE * 0.2);
                    ctx.lineTo(drawX + GRID_SIZE * 0.2, drawY + GRID_SIZE * 0.8);
                    ctx.lineTo(drawX + GRID_SIZE * 0.8, drawY + GRID_SIZE * 0.8);
                    ctx.moveTo(drawX + GRID_SIZE * 0.5, drawY);
                    ctx.lineTo(drawX + GRID_SIZE * 0.5, drawY + GRID_SIZE * 0.5);
                    ctx.lineTo(drawX + GRID_SIZE, drawY + GRID_SIZE * 0.5);
                    ctx.stroke();
                    ctx.strokeRect(drawX, drawY, GRID_SIZE, GRID_SIZE); // Outline

                } else if (tile === 2) { // Destructible - Rusty metal / Data block
                    ctx.fillStyle = '#7a4a1a'; // Rusty orange/brown
                    ctx.fillRect(drawX, drawY, GRID_SIZE, GRID_SIZE);
                    ctx.strokeStyle = '#4d2f10'; // Darker brown
                    ctx.lineWidth = 2;
                    // Diagonal crack/panel lines
                    ctx.beginPath();
                    ctx.moveTo(drawX, drawY);
                    ctx.lineTo(drawX + GRID_SIZE, drawY + GRID_SIZE);
                    ctx.moveTo(drawX + GRID_SIZE, drawY);
                    ctx.lineTo(drawX, drawY + GRID_SIZE);
                    ctx.moveTo(drawX + GRID_SIZE*0.5, drawY);
                    ctx.lineTo(drawX, drawY + GRID_SIZE*0.5);
                    ctx.moveTo(drawX + GRID_SIZE, drawY + GRID_SIZE*0.5);
                    ctx.lineTo(drawX + GRID_SIZE*0.5, drawY + GRID_SIZE);
                    ctx.stroke();
                    
                } else { // Floor - Dark metallic grid
                    ctx.fillStyle = '#222228'; // Very dark blueish-gray
                    ctx.fillRect(drawX, drawY, GRID_SIZE, GRID_SIZE);
                    // Subtle grid lines
                    ctx.strokeStyle = '#404050'; // Slightly lighter
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(drawX, drawY, GRID_SIZE, GRID_SIZE);
                }
            }
        }

        // Draw powerups
        for (const powerup of this.powerups) {
            powerup.render(ctx);
        }

        // Draw bombs
        for (const bomb of this.bombs) {
            bomb.render(ctx);
        }

        // Draw enemies
        for (const enemy of this.enemies) {
            enemy.render(ctx);
        }

        // Draw player
        this.player.render(ctx);
    }

    isWall(x, y) {
        const gridX = Math.floor(x / GRID_SIZE);
        const gridY = Math.floor(y / GRID_SIZE);
        return this.grid[gridY][gridX] === 1;
    }

    isDestructible(x, y) {
        const gridX = Math.floor(x / GRID_SIZE);
        const gridY = Math.floor(y / GRID_SIZE);
        return this.grid[gridY][gridX] === 2;
    }

    destroyBlock(x, y) {
        this.grid[y][x] = 0;
        // 30% chance to spawn a powerup
        if (Math.random() < 0.3) {
            const types = ['speed', 'bomb', 'range'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.powerups.push(new Powerup(x * GRID_SIZE, y * GRID_SIZE, type));
        }
    }

    addBomb(bomb) {
        this.bombs.push(bomb);
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            this.enemies.splice(index, 1);
        }
    }

    checkPowerupCollisions() {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            const playerGridX = Math.floor(this.player.x / GRID_SIZE);
            const playerGridY = Math.floor(this.player.y / GRID_SIZE);
            const powerupGridX = Math.floor(powerup.x / GRID_SIZE);
            const powerupGridY = Math.floor(powerup.y / GRID_SIZE);

            if (playerGridX === powerupGridX && playerGridY === powerupGridY) {
                this.player.addPowerup(powerup.type);
                this.powerups.splice(i, 1);
            }
        }
    }

    checkWinCondition() {
        return this.enemies.length === 0;
    }

    // Add a simple collision check between player and enemies
    checkPlayerEnemyCollisions() {
        const playerGridX = Math.round(this.player.x / GRID_SIZE);
        const playerGridY = Math.round(this.player.y / GRID_SIZE);

        for (const enemy of this.enemies) {
            const enemyGridX = Math.round(enemy.x / GRID_SIZE);
            const enemyGridY = Math.round(enemy.y / GRID_SIZE);

            if (playerGridX === enemyGridX && playerGridY === enemyGridY) {
                console.log("Player collided with enemy!");
                this.player.takeDamage(); // Player takes damage on collision
                // Optional: Add a small cooldown to prevent instant multi-hits
                break; // Only handle one collision per frame
            }
        }
    }
}

// Export the Level class
window.Level = Level; 