class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.speed = this.getSpeed();
        this.lives = this.getStartingLives();
        this.direction = 'down';
        this.state = 'idle';
        this.moving = false;
        this.targetX = x;
        this.targetY = y;
        this.moveTimer = 0;
        this.moveInterval = this.getMoveInterval();
        this.moveProgress = 0;
        this.isInvincible = false;
        this.invincibilityTimer = 0;
        this.invincibilityDuration = 300;
        this.sprite = new Image();
        // Sprite selection and frame size for each type
        if (type === 'skeleton') {
            this.sprite.src = 'assets/sprites/player/enemy 1.png';
            this.frameSize = { width: 192, height: 192 };
        } else if (type === 'ghost') {
            this.sprite.src = 'assets/sprites/player/enemy 2.png';
            this.frameSize = { width: 192, height: 192 };
        } else if (type === 'demon') {
            this.sprite.src = 'assets/sprites/player/enemy 3.png';
            this.frameSize = { width: 192, height: 192 };
        } else if (type === 'omega') {
            this.sprite.src = 'assets/sprites/player/omega-enemy-boss.png';
            this.frameSize = { width: 192, height: 192 };
        } else if (type === 'sol') {
            this.sprite.src = 'assets/sprites/player/sol-player 4.png';
            this.frameSize = { width: 48, height: 48 };
        } else if (type === 'kage') {
            this.sprite.src = 'assets/sprites/player/Kage-player 2.png';
            this.frameSize = { width: 192, height: 192 };
        } else if (type === 'cozy') {
            this.sprite.src = 'assets/sprites/player/cozy-player 3.png';
            this.frameSize = { width: 192, height: 192 };
        } else {
            this.sprite.src = 'assets/sprites/player/enemy 1.png';
            this.frameSize = { width: 192, height: 192 };
        }
        this.animations = {
            idleDown: { row: 0, frames: [0] },
            walkDown: { row: 0, frames: [0, 1, 2, 3] },
            idleLeft: { row: 1, frames: [0] },
            walkLeft: { row: 1, frames: [0, 1, 2, 3] },
            idleRight: { row: 2, frames: [0] },
            walkRight: { row: 2, frames: [0, 1, 2, 3] },
            idleUp: { row: 3, frames: [0] },
            walkUp: { row: 3, frames: [0, 1, 2, 3] }
        };
        this.currentAnimation = 'idleDown';
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 150;
        this.facingDirection = 'down';
    }

    canMoveTo(gridX, gridY) {
        if (!gameLevel || !gameLevel.grid) return false;
        if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) return false;

        const tile = gameLevel.grid[gridY][gridX];
        return tile === 0;
    }

    update(deltaTime) {
        if (this.isInvincible) {
            this.invincibilityTimer -= deltaTime;
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
            }
        }
        
        if (this.moving) {
            const moveAmount = this.speed * (deltaTime / 16.67); // Normalize to 60fps
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
                if ((this.direction === 'up' && this.y < this.targetY) || (this.direction === 'down' && this.y > this.targetY)) this.y = this.targetY;
                if ((this.direction === 'left' && this.x < this.targetX) || (this.direction === 'right' && this.x > this.targetX)) this.x = this.targetX;
            }
        } else {
            this.moveTimer += deltaTime;
            if (this.moveTimer >= this.moveInterval) {
                this.moveTimer = 0;
                this.determineNextMove();
            }
        }

        // Animation state logic (match player logic)
        let animDir = this.direction;
        if (animDir === 'up') animDir = 'Up';
        else if (animDir === 'down') animDir = 'Down';
        else if (animDir === 'left') animDir = 'Left';
        else if (animDir === 'right') animDir = 'Right';
        if (this.moving) {
            this.currentAnimation = 'walk' + animDir;
            this.facingDirection = this.direction;
        } else {
            let idleDir = this.facingDirection;
            if (idleDir === 'up') idleDir = 'Up';
            else if (idleDir === 'down') idleDir = 'Down';
            else if (idleDir === 'left') idleDir = 'Left';
            else if (idleDir === 'right') idleDir = 'Right';
            this.currentAnimation = 'idle' + idleDir;
        }
        this.updateAnimation(deltaTime);
    }

    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
        const anim = this.animations[this.currentAnimation];
        if (this.animationTimer > this.animationSpeed) {
            this.animationTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % anim.frames.length;
        }
    }

    render(ctx) {
        if (this.isInvincible && Math.floor(this.invincibilityTimer / 50) % 2 === 0) {
            return;
        }
        if (!this.sprite.complete || this.sprite.naturalWidth === 0) {
            return; // Don't draw if sprite not loaded
        }
        const anim = this.animations[this.currentAnimation];
        const frame = anim.frames[this.currentFrame];
        // Clamp source rectangle to sprite sheet size
        const sx = Math.min(frame * this.frameSize.width, this.sprite.naturalWidth - this.frameSize.width);
        const sy = Math.min(anim.row * this.frameSize.height, this.sprite.naturalHeight - this.frameSize.height);
        ctx.drawImage(
            this.sprite,
            sx,
            sy,
            this.frameSize.width,
            this.frameSize.height,
            this.x,
            this.y,
            GRID_SIZE,
            GRID_SIZE
        );
    }

    determineNextMove() {
        if (this.moving) return;
        
        const currentGridX = Math.round(this.x / GRID_SIZE);
        const currentGridY = Math.round(this.y / GRID_SIZE);

        if (!this.isTileSafe(currentGridX, currentGridY)) {
            console.log(`Enemy at ${currentGridX},${currentGridY} is in danger! Trying to move.`);
            const safeMoves = [];
            const directions = ['up', 'down', 'left', 'right'];
            for (const dir of directions) {
                let nextX = currentGridX, nextY = currentGridY;
                if (dir === 'up') nextY--; else if (dir === 'down') nextY++;
                else if (dir === 'left') nextX--; else if (dir === 'right') nextX++;
                
                if (this.canMoveTo(nextX, nextY) && this.isTileSafe(nextX, nextY)) {
                    safeMoves.push(dir);
                }
            }
            
            if (safeMoves.length > 0) {
                const chosenDir = safeMoves[Math.floor(Math.random() * safeMoves.length)];
                console.log(`Enemy moving to safe spot: ${chosenDir}`);
                this.moveInDirection(chosenDir);
                return;
            }
            console.log("Enemy trapped by bomb!");
            return; 
        }

        switch (this.type) {
            case 'skeleton':
                this.randomMove();
                break;
            case 'ghost':
                this.chasePlayer();
                break;
            case 'demon':
                this.patrolMove();
                break;
        }
    }

    randomMove() {
        const directions = ['up', 'down', 'left', 'right'];
        let possibleMoves = [];
        for(const dir of directions) {
             let nextX = Math.round(this.x / GRID_SIZE), nextY = Math.round(this.y / GRID_SIZE);
             if (dir === 'up') nextY--; else if (dir === 'down') nextY++;
             else if (dir === 'left') nextX--; else if (dir === 'right') nextX++;
             if(this.canMoveTo(nextX, nextY)) {
                 possibleMoves.push(dir);
             }
        }
        if (possibleMoves.length > 0) {
            const direction = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            this.moveInDirection(direction);
        }
    }

    chasePlayer() {
        if (!gameLevel || !gameLevel.player) return;
        const player = gameLevel.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        
        let primaryDir = null;
        let secondaryDir = null;

        if (Math.abs(dx) > Math.abs(dy)) {
            primaryDir = dx > 0 ? 'right' : 'left';
            secondaryDir = dy > 0 ? 'down' : 'up';
        } else {
            primaryDir = dy > 0 ? 'down' : 'up';
            secondaryDir = dx > 0 ? 'right' : 'left';
        }

        if (this.moveInDirection(primaryDir)) return;
        if (this.moveInDirection(secondaryDir)) return;
        const tertiaryDir = (secondaryDir === 'up' ? 'down' : secondaryDir === 'down' ? 'up' : secondaryDir === 'left' ? 'right' : 'left');
        if (this.moveInDirection(tertiaryDir)) return;
        this.randomMove(); 
    }

    patrolMove() {
        if (!this.moveInDirection(this.direction)) { 
            let possibleTurns = [];
            if (this.direction === 'up' || this.direction === 'down') possibleTurns = ['left', 'right'];
            else possibleTurns = ['up', 'down'];
            
            const turnDir = possibleTurns[Math.floor(Math.random() * 2)];
            if (!this.moveInDirection(turnDir)) {
                 const otherTurnDir = (turnDir === possibleTurns[0]) ? possibleTurns[1] : possibleTurns[0];
                 if (!this.moveInDirection(otherTurnDir)) {
                     const reverseDir = (this.direction === 'up' ? 'down' : this.direction === 'down' ? 'up' : this.direction === 'left' ? 'right' : 'left');
                     this.moveInDirection(reverseDir);
                 }
            }
        }
    }

    moveInDirection(direction) {
        if (this.moving) return false;
        
        this.direction = direction;
        let nextGridX = Math.round(this.x / GRID_SIZE);
        let nextGridY = Math.round(this.y / GRID_SIZE);
        let potentialTargetX = this.x;
        let potentialTargetY = this.y;

        switch (direction) {
            case 'up':    nextGridY--; potentialTargetY = nextGridY * GRID_SIZE; break;
            case 'down':  nextGridY++; potentialTargetY = nextGridY * GRID_SIZE; break;
            case 'left':  nextGridX--; potentialTargetX = nextGridX * GRID_SIZE; break;
            case 'right': nextGridX++; potentialTargetX = nextGridX * GRID_SIZE; break;
        }

        if (this.canMoveTo(nextGridX, nextGridY)) {
            this.targetX = potentialTargetX;
            this.targetY = potentialTargetY;
            this.moving = true;
            this.state = 'walk';
            this.moveProgress = 0;
            return true;
        } else {
            this.state = 'idle';
            this.moving = false;
            return false;
        }
    }

    getSpeed() {
        switch (this.type) {
            case 'skeleton':
                return 1;
            case 'ghost':
                return 1.5;
            case 'demon':
                return 0.8;
            default:
                return 1;
        }
    }

    getStartingLives() {
        switch (this.type) {
            case 'skeleton': return 1;
            case 'ghost':    return 2;
            case 'demon':    return 3;
            default:         return 1;
        }
    }

    takeDamage() {
        if (this.isInvincible) return;
        
        this.lives--;
        console.log(`Enemy ${this.type} hit! Lives remaining: ${this.lives}`);
        this.isInvincible = true;
        this.invincibilityTimer = this.invincibilityDuration;
        
        if (this.lives <= 0) {
            gameLevel.removeEnemy(this);
            score += 100;
            updateScore();
        }
    }

    getMoveInterval() {
        switch (this.type) {
            case 'skeleton':
                return 1000;
            case 'ghost':
                return 800;
            case 'demon':
                return 1200;
            default:
                return 1000;
        }
    }

    isTileSafe(gridX, gridY) {
        if (!gameLevel || !gameLevel.bombs) return true;
        
        for (const bomb of gameLevel.bombs) {
            if (bomb.exploded && !bomb.finished) {
                for (const tile of bomb.explosionTiles) {
                    const tileGridX = Math.round(tile.x / GRID_SIZE);
                    const tileGridY = Math.round(tile.y / GRID_SIZE);
                    if (gridX === tileGridX && gridY === tileGridY) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}

window.Enemy = Enemy; 