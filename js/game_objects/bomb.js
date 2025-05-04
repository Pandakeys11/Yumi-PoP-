class Bomb {
    constructor(x, y, power, owner) {
        this.x = x;
        this.y = y;
        this.power = power;
        this.owner = owner;
        this.timer = 3000; // 3 seconds
        this.exploded = false;
        this.explosionTiles = [];
        this.explosionDuration = 500; // How long the explosion visuals last (ms)
        this.explosionTimer = 0;
    }

    update(deltaTime) {
        if (!this.exploded) {
            this.timer -= deltaTime;
            if (this.timer <= 0) {
                this.explode();
            }
        } else {
            // If exploded, count down the explosion visibility timer
            this.explosionTimer += deltaTime;
            if (this.explosionTimer >= this.explosionDuration) {
                // Mark for removal after duration (Level class will handle removal)
                this.finished = true; 
            }
        }
    }

    render(ctx) {
        if (!this.exploded) {
            // Draw bomb as dark orb with pulsing magenta core
            const centerX = this.x + GRID_SIZE / 2;
            const centerY = this.y + GRID_SIZE / 2;
            const outerRadius = GRID_SIZE / 2 * 0.8;
            const fuseRatio = Math.max(0, this.timer / 3000);
            const coreRadius = GRID_SIZE / 2 * 0.2 * (1 + Math.sin(performance.now() / 100) * 0.5); // Pulsing effect

            // Outer shell
            ctx.fillStyle = '#2c001e'; // Dark purple/black
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Pulsing Core (Fuse indicator)
            ctx.fillStyle = `rgba(255, 0, 255, ${0.5 + fuseRatio * 0.5})`; // Magenta, fades slightly with fuse
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
            ctx.fill();

        } else if (!this.finished) {
            // Draw electric/plasma explosion
            const baseAlpha = 0.8 - (this.explosionTimer / this.explosionDuration) * 0.8; // Fade out alpha
            
            ctx.lineWidth = 3;
            
            for (const tile of this.explosionTiles) {
                const tileCenterX = tile.x + GRID_SIZE / 2;
                const tileCenterY = tile.y + GRID_SIZE / 2;
                
                // Draw multiple expanding/fading circles for plasma effect
                const numCircles = 3;
                for (let i = 1; i <= numCircles; i++) {
                    const radius = (GRID_SIZE / 2 * 0.8) * (this.explosionTimer / this.explosionDuration) * i;
                    const alpha = baseAlpha * (1 - (i / (numCircles + 1)));
                    ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`; // Cyan plasma
                    ctx.beginPath();
                    ctx.arc(tileCenterX, tileCenterY, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
                // Add some random crackling lines?
                 ctx.strokeStyle = `rgba(255, 255, 255, ${baseAlpha * 0.5})`; // White sparks
                 ctx.lineWidth = 1;
                 for (let i = 0; i < 3; i++) { // 3 small sparks per tile
                     ctx.beginPath();
                     const angle = Math.random() * Math.PI * 2;
                     const startRadius = Math.random() * GRID_SIZE * 0.2;
                     const endRadius = startRadius + Math.random() * GRID_SIZE * 0.3;
                     ctx.moveTo(tileCenterX + Math.cos(angle) * startRadius, tileCenterY + Math.sin(angle) * startRadius);
                     ctx.lineTo(tileCenterX + Math.cos(angle) * endRadius, tileCenterY + Math.sin(angle) * endRadius);
                     ctx.stroke();
                 }
            }
            
            ctx.globalAlpha = 1.0; // Reset alpha if needed elsewhere (though fillRect doesn't use it)
        }
    }

    explode() {
        if (this.exploded) return;
        console.log("Bomb exploding!");
        this.exploded = true;
        this.explosionTimer = 0;
        this.createExplosionTiles();
        this.checkDamage();
        this.checkChainReactions();

        // Return the bomb count to the owner player
        if (this.owner && typeof this.owner.returnBomb === 'function') {
            this.owner.returnBomb();
        }
    }

    createExplosionTiles() {
        this.explosionTiles = []; // Reset tiles
        // Center explosion tile
        const startGridX = Math.round(this.x / GRID_SIZE);
        const startGridY = Math.round(this.y / GRID_SIZE);
        this.explosionTiles.push({ x: startGridX * GRID_SIZE, y: startGridY * GRID_SIZE });

        // Explosion in all four directions
        const directions = [
            { dx: 0, dy: -1 }, // up
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }, // left
            { dx: 1, dy: 0 }   // right
        ];

        for (const dir of directions) {
            for (let i = 1; i <= this.power; i++) {
                const checkGridX = startGridX + dir.dx * i;
                const checkGridY = startGridY + dir.dy * i;

                // Check bounds
                if (checkGridX < 0 || checkGridX >= GRID_WIDTH || checkGridY < 0 || checkGridY >= GRID_HEIGHT) {
                    break;
                }
                
                // Get the tile type at the explosion check location
                const tileType = gameLevel.grid[checkGridY][checkGridX];

                // Add the current cell to explosion tiles
                this.explosionTiles.push({ x: checkGridX * GRID_SIZE, y: checkGridY * GRID_SIZE });

                if (tileType === 1) { // Hit indestructible wall
                    break; // Stop explosion in this direction
                }

                if (tileType === 2) { // Hit destructible block
                    gameLevel.destroyBlock(checkGridX, checkGridY);
                    break; // Stop explosion after destroying block
                }
                
                // If it's floor (0), continue explosion
            }
        }
        console.log(`Explosion created ${this.explosionTiles.length} tiles.`);
    }

    checkChainReactions() {
        if (!gameLevel || !gameLevel.bombs) return;
        
        for (const otherBomb of gameLevel.bombs) {
            if (otherBomb === this || otherBomb.exploded) continue;

            const otherBombGridX = Math.round(otherBomb.x / GRID_SIZE);
            const otherBombGridY = Math.round(otherBomb.y / GRID_SIZE);

            for (const tile of this.explosionTiles) {
                const tileGridX = Math.round(tile.x / GRID_SIZE);
                const tileGridY = Math.round(tile.y / GRID_SIZE);

                if (otherBombGridX === tileGridX && otherBombGridY === tileGridY) {
                    console.log(`Chain reaction triggered for bomb at ${tileGridX}, ${tileGridY}`);
                    // Use a slight delay to make chain reactions look better?
                    setTimeout(() => otherBomb.explode(), 50); // Small delay
                    break; // Check next bomb
                }
            }
        }
    }

    checkDamage() {
        if (!gameLevel || !gameLevel.player || !gameLevel.enemies) return;
        
        const playerGridX = Math.round(gameLevel.player.x / GRID_SIZE);
        const playerGridY = Math.round(gameLevel.player.y / GRID_SIZE);
        let playerHit = false; // Prevent multiple hits from one explosion

        // Check enemy damage first
        for (let i = gameLevel.enemies.length - 1; i >= 0; i--) {
            const enemy = gameLevel.enemies[i];
            const enemyGridX = Math.round(enemy.x / GRID_SIZE);
            const enemyGridY = Math.round(enemy.y / GRID_SIZE);
            let enemyHit = false;

            for (const tile of this.explosionTiles) {
                const tileGridX = Math.round(tile.x / GRID_SIZE);
                const tileGridY = Math.round(tile.y / GRID_SIZE);

                if (enemyGridX === tileGridX && enemyGridY === tileGridY) {
                    console.log(`Enemy hit at ${tileGridX}, ${tileGridY}`);
                    enemy.takeDamage();
                    enemyHit = true;
                    break; // Enemy hit, check next enemy
                }
            }
        }
        
        // Check player damage
        for (const tile of this.explosionTiles) {
            const tileGridX = Math.round(tile.x / GRID_SIZE);
            const tileGridY = Math.round(tile.y / GRID_SIZE);
            
            if (playerGridX === tileGridX && playerGridY === tileGridY) {
                console.log(`Player hit at ${tileGridX}, ${tileGridY}`);
                gameLevel.player.takeDamage(); // Use the player's takeDamage method
                playerHit = true;
                break; // Player hit once is enough for this explosion
            }
        }
    }
}

// Export the Bomb class
window.Bomb = Bomb; 