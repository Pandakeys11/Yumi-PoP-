class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 3;
        this.direction = 'down';
        this.state = 'idle';
        this.lives = 3;
        this.bombCount = 1;
        this.bombRange = 1;
        this.maxBombs = 1;
        this.moving = false;
        this.targetX = x;
        this.targetY = y;
        this.moveProgress = 0;
        // Inventory to track collected powerups for UI display
        this.collectedPowerups = { 
            speed: 0, 
            bomb: 0, 
            range: 0 
        };
        this.isInvincible = false; // For hit flashing
        this.invincibilityTimer = 0;
        this.invincibilityDuration = 500; // ms
    }

    canMoveTo(gridX, gridY) {
        if (!gameLevel || !gameLevel.grid) return false;
        if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) return false;

        const tile = gameLevel.grid[gridY][gridX];
        return tile === 0;
    }

    move(direction) {
        if (this.moving) return;

        this.direction = direction;
        let nextGridX = Math.round(this.x / GRID_SIZE);
        let nextGridY = Math.round(this.y / GRID_SIZE);
        let potentialTargetX = this.x;
        let potentialTargetY = this.y;

        switch (direction) {
            case 'up':
                nextGridY--;
                potentialTargetY = nextGridY * GRID_SIZE;
                break;
            case 'down':
                nextGridY++;
                potentialTargetY = nextGridY * GRID_SIZE;
                break;
            case 'left':
                nextGridX--;
                potentialTargetX = nextGridX * GRID_SIZE;
                break;
            case 'right':
                nextGridX++;
                potentialTargetX = nextGridX * GRID_SIZE;
                break;
        }

        if (this.canMoveTo(nextGridX, nextGridY)) {
            this.targetX = potentialTargetX;
            this.targetY = potentialTargetY;
            this.moving = true;
            this.state = 'walk';
            this.moveProgress = 0;
        } else {
            this.state = 'idle';
            this.moving = false;
        }
    }

    stop() {
        this.state = 'idle';
        this.moving = false;
        this.moveProgress = 0;
        this.x = Math.round(this.x / GRID_SIZE) * GRID_SIZE;
        this.y = Math.round(this.y / GRID_SIZE) * GRID_SIZE;
    }

    update(deltaTime) {
        // Handle invincibility flashing after being hit
        if (this.isInvincible) {
            this.invincibilityTimer -= deltaTime;
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
            }
        }
        
        if (this.moving) {
            const moveAmount = this.speed;
            this.moveProgress += moveAmount;

            if (this.moveProgress >= GRID_SIZE) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.moving = false;
                this.state = 'idle';
                this.moveProgress = 0;
            } else {
                switch (this.direction) {
                    case 'up': this.y -= moveAmount; break;
                    case 'down': this.y += moveAmount; break;
                    case 'left': this.x -= moveAmount; break;
                    case 'right': this.x += moveAmount; break;
                }
                if ((this.direction === 'up' && this.y < this.targetY) || (this.direction === 'down' && this.y > this.targetY)) {
                    this.y = this.targetY;
                }
                if ((this.direction === 'left' && this.x < this.targetX) || (this.direction === 'right' && this.x > this.targetX)) {
                    this.x = this.targetX;
                }
            }
        }
    }

    render(ctx) {
        // Flash if invincible
        if (this.isInvincible && Math.floor(this.invincibilityTimer / 50) % 2 === 0) {
             return; 
        }
        
        // Draw player base (Yumi - Diamond/Cyan)
        ctx.fillStyle = '#00ced1'; // Dark Turquoise / Cyan
        ctx.fillRect(this.x, this.y, GRID_SIZE, GRID_SIZE);
        // Inner highlight
        ctx.fillStyle = '#40e0d0'; // Turquoise
        ctx.fillRect(this.x + GRID_SIZE * 0.1, this.y + GRID_SIZE * 0.1, GRID_SIZE * 0.8, GRID_SIZE * 0.8);
        
        // Direction indicator (Brighter Cyan Arrow/Triangle?)
        ctx.fillStyle = '#00ffff'; // Bright Cyan
        const indicatorSize = GRID_SIZE / 3;
        ctx.beginPath();
        if (this.direction === 'up') {
            ctx.moveTo(this.x + GRID_SIZE / 2, this.y + indicatorSize * 0.5);
            ctx.lineTo(this.x + GRID_SIZE / 2 - indicatorSize / 2, this.y + indicatorSize);
            ctx.lineTo(this.x + GRID_SIZE / 2 + indicatorSize / 2, this.y + indicatorSize);
        } else if (this.direction === 'down') {
            ctx.moveTo(this.x + GRID_SIZE / 2, this.y + GRID_SIZE - indicatorSize * 0.5);
            ctx.lineTo(this.x + GRID_SIZE / 2 - indicatorSize / 2, this.y + GRID_SIZE - indicatorSize);
            ctx.lineTo(this.x + GRID_SIZE / 2 + indicatorSize / 2, this.y + GRID_SIZE - indicatorSize);
        } else if (this.direction === 'left') {
             ctx.moveTo(this.x + indicatorSize * 0.5, this.y + GRID_SIZE / 2);
             ctx.lineTo(this.x + indicatorSize, this.y + GRID_SIZE / 2 - indicatorSize / 2);
             ctx.lineTo(this.x + indicatorSize, this.y + GRID_SIZE / 2 + indicatorSize / 2);
        } else { // right
             ctx.moveTo(this.x + GRID_SIZE - indicatorSize * 0.5, this.y + GRID_SIZE / 2);
             ctx.lineTo(this.x + GRID_SIZE - indicatorSize, this.y + GRID_SIZE / 2 - indicatorSize / 2);
             ctx.lineTo(this.x + GRID_SIZE - indicatorSize, this.y + GRID_SIZE / 2 + indicatorSize / 2);
        }
        ctx.closePath();
        ctx.fill();
    }

    takeDamage() {
        if (this.lives > 0 && !this.isInvincible) { // Only take damage if not invincible
            this.lives--;
            console.log(`Player hit! Lives remaining: ${this.lives}`);
            this.isInvincible = true;
            this.invincibilityTimer = this.invincibilityDuration;
            
            if (this.lives <= 0) {
                showGameOver(false);
            }
        }
    }

    placeBomb() {
        const currentBombs = gameLevel ? gameLevel.bombs.filter(b => !b.exploded).length : 0;
        if (this.bombCount > 0 && currentBombs < this.maxBombs) { 
            this.bombCount--;
            
            const gridX = Math.round(this.x / GRID_SIZE);
            const gridY = Math.round(this.y / GRID_SIZE);
            
            if (gameLevel && gameLevel.grid[gridY][gridX] !== 0) {
                console.log("Cannot place bomb inside a wall/block.");
                this.bombCount++;
                return null;
            }

            console.log(`Player placed bomb at ${gridX}, ${gridY}`);
            return new Bomb(gridX * GRID_SIZE, gridY * GRID_SIZE, this.bombRange, this);
        } else {
            console.log(`Cannot place bomb. Count: ${this.bombCount}, CurrentPlaced: ${currentBombs}, Max: ${this.maxBombs}`);
            return null;
        }
    }

    returnBomb() {
        this.bombCount++;
        console.log(`Bomb returned to player. Count: ${this.bombCount}`);
    }

    addPowerup(type) {
        // Track collected powerup for UI
        if (this.collectedPowerups.hasOwnProperty(type)) {
            this.collectedPowerups[type]++;
        }
        
        // Apply effect immediately (current behavior)
        switch (type) {
            case 'speed':
                this.speed = Math.min(this.speed + 0.5, 5); // Cap speed
                console.log(`Player speed increased to ${this.speed}. Total Speed ups: ${this.collectedPowerups.speed}`);
                break;
            case 'bomb':
                this.maxBombs++;
                this.bombCount++; // Also give one immediately
                console.log(`Player max bombs increased to ${this.maxBombs}. Total Bomb ups: ${this.collectedPowerups.bomb}`);
                break;
            case 'range':
                this.bombRange++;
                console.log(`Player bomb range increased to ${this.bombRange}. Total Range ups: ${this.collectedPowerups.range}`);
                break;
        }
    }
}

window.Player = Player; 