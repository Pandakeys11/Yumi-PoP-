class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 32;
        this.tileSize = 32;
        this.player = null;
        this.enemies = [];
        this.bombs = [];
        this.explosions = [];
        this.powerups = [];
        this.level = null;
        this.score = 0;
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.assets = {
            player: null,
            enemy: null,
            bomb: null,
            explosion: null,
            powerup: null,
            tiles: null
        };
        
        this.init();
    }

    async init() {
        // Set canvas size
        this.canvas.width = this.gridSize * this.tileSize;
        this.canvas.height = this.gridSize * this.tileSize;

        // Load assets
        await this.loadAssets();
        
        // Initialize level
        this.level = new Level(this.gridSize);
        
        // Initialize player
        this.player = new Player(1, 1, this);
        
        // Initialize enemies
        this.spawnEnemies(3);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop();
    }

    async loadAssets() {
        const assetPromises = [
            this.loadImage('assets/sprites/player.png'),
            this.loadImage('assets/sprites/enemy.png'),
            this.loadImage('assets/sprites/bomb.png'),
            this.loadImage('assets/sprites/explosion.png'),
            this.loadImage('assets/sprites/powerup.png'),
            this.loadImage('assets/sprites/tiles.png')
        ];

        const [player, enemy, bomb, explosion, powerup, tiles] = await Promise.all(assetPromises);
        
        this.assets = {
            player,
            enemy,
            bomb,
            explosion,
            powerup,
            tiles
        };
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('pause-button').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainButton').addEventListener('click', () => this.restartGame());
    }

    handleKeyDown(e) {
        if (this.gameState !== 'playing') return;

        switch(e.key) {
            case 'ArrowUp':
                this.player.move(0, -1);
                break;
            case 'ArrowDown':
                this.player.move(0, 1);
                break;
            case 'ArrowLeft':
                this.player.move(-1, 0);
                break;
            case 'ArrowRight':
                this.player.move(1, 0);
                break;
            case ' ':
                this.player.placeBomb();
                break;
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.updateScore();
    }

    togglePause() {
        this.gameState = this.gameState === 'playing' ? 'paused' : 'playing';
    }

    restartGame() {
        this.player = new Player(1, 1, this);
        this.enemies = [];
        this.bombs = [];
        this.explosions = [];
        this.powerups = [];
        this.spawnEnemies(3);
        this.gameState = 'playing';
        this.score = 0;
        this.updateScore();
        document.getElementById('gameOverModal').style.display = 'none';
    }

    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (this.gridSize - 2)) + 1;
                y = Math.floor(Math.random() * (this.gridSize - 2)) + 1;
            } while (this.level.getTile(x, y) !== 0 || 
                    (x === this.player.x && y === this.player.y));
            
            this.enemies.push(new Enemy(x, y, this));
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    gameLoop() {
        if (this.gameState === 'playing') {
            this.update();
        }
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Update player
        this.player.update();
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update());
        
        // Update bombs
        this.bombs.forEach(bomb => bomb.update());
        
        // Update explosions
        this.explosions.forEach(explosion => explosion.update());
        
        // Update powerups
        this.powerups.forEach(powerup => powerup.update());
        
        // Check collisions
        this.checkCollisions();
    }

    checkCollisions() {
        // Check player-enemy collisions
        this.enemies.forEach(enemy => {
            if (this.player.x === enemy.x && this.player.y === enemy.y) {
                this.gameOver(false);
            }
        });
        
        // Check player-powerup collisions
        this.powerups.forEach((powerup, index) => {
            if (this.player.x === powerup.x && this.player.y === powerup.y) {
                this.player.applyPowerup(powerup.type);
                this.powerups.splice(index, 1);
            }
        });
    }

    gameOver(won) {
        this.gameState = 'gameover';
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        
        modal.style.display = 'flex';
        title.textContent = won ? 'Victory!' : 'Game Over';
        message.textContent = won ? 
            `You defeated all enemies! Final score: ${this.score}` :
            `You were defeated! Final score: ${this.score}`;
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw level
        this.level.render(this.ctx, this.assets.tiles);
        
        // Draw powerups
        this.powerups.forEach(powerup => powerup.render(this.ctx, this.assets.powerup));
        
        // Draw bombs
        this.bombs.forEach(bomb => bomb.render(this.ctx, this.assets.bomb));
        
        // Draw explosions
        this.explosions.forEach(explosion => explosion.render(this.ctx, this.assets.explosion));
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx, this.assets.enemy));
        
        // Draw player
        this.player.render(this.ctx, this.assets.player);
    }
}

// Start the game when the window loads
window.addEventListener('load', () => {
    new Game();
}); 