// Game constants
const GRID_SIZE = 32;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRID_WIDTH = Math.floor(CANVAS_WIDTH / GRID_SIZE);
const GRID_HEIGHT = Math.floor(CANVAS_HEIGHT / GRID_SIZE);

// Game state
let gameRunning = false;
let gamePaused = false;
let score = 0;
let spriteManager;
let walletManager;
let gameLevel;
let lastTime = 0;
let keys = {};

// Initialize the game
function init() {
    console.log('Initializing game...');
    
    try {
        // Initialize sprite manager
        console.log('Initializing sprite manager...');
        spriteManager = new SpriteManager();
        console.log('Calling spriteManager.loadSprites() (bypassed)...');
        spriteManager.loadSprites(); 
        console.log('spriteManager.loadSprites() finished (bypassed).');
        console.log(`Sprite manager loaded status: ${spriteManager.loaded}`);

        // Initialize wallet manager
        console.log('Initializing wallet manager...');
        walletManager = new WalletManager();
        
        // Set up canvas
        console.log('Setting up canvas...');
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        console.log('Canvas setup complete');

        // Set up event listeners
        console.log('Setting up event listeners...');
        const startButton = document.getElementById('start-button');
        const pauseButton = document.getElementById('pause-button');
        const restartButton = document.getElementById('restart-button');
        const connectWalletButton = document.getElementById('connectWalletButton');
        const playAgainButton = document.getElementById('playAgainButton');
        const levelCompleteModal = document.getElementById('levelCompleteModal');

        if (!startButton || !pauseButton || !restartButton || !connectWalletButton || !playAgainButton || !levelCompleteModal) {
            console.error('One or more UI elements not found. Check IDs in index.html');
            if (!startButton) console.error('Start button not found');
            if (!pauseButton) console.error('Pause button not found');
            if (!restartButton) console.error('Restart button not found');
            if (!connectWalletButton) console.error('Connect Wallet button not found');
            if (!playAgainButton) console.error('Play Again button not found');
            if (!levelCompleteModal) console.error('Level Complete Modal not found');
            return;
        }

        startButton.addEventListener('click', () => {
            console.log('Start button clicked');
            startGame();
        });
        pauseButton.addEventListener('click', () => {
            console.log('Pause button clicked');
            togglePause();
        });
        restartButton.addEventListener('click', () => {
            console.log('Restart button clicked');
            restartGame();
        });
        connectWalletButton.addEventListener('click', () => {
            console.log('Connect Wallet button clicked');
            if (walletManager) {
                walletManager.connect();
            } else {
                console.error('WalletManager not initialized');
            }
        });
        playAgainButton.addEventListener('click', () => {
            console.log('Play Again button clicked');
            restartGame();
        });
        console.log('Event listeners set up');

        // Set up keyboard controls
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Start the game loop
        console.log('Setting lastTime and requesting initial game loop frame');
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
        
        console.log('Game initialized successfully! init() finished.');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

// Game loop
function gameLoop(currentTime) {
    // console.log('Game loop running...'); // Can be too noisy, enable if needed
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    if (!gamePaused && gameRunning) {
        // console.log('Updating game state...'); // Noisy
        update(deltaTime);
        // console.log('Rendering game state...'); // Noisy
        render();
    } else {
        // Log why we are not updating/rendering
        if (!gameRunning) console.log('Game loop: gameRunning is false.');
        if (gamePaused) console.log('Game loop: gamePaused is true.');
    }
    requestAnimationFrame(gameLoop);
}

// Update game state
function update(deltaTime) {
    if (gameLevel && gameLevel.player) {
        gameLevel.update(deltaTime);

        // Check win condition (defeating all enemies)
        if (gameLevel.checkWinCondition()) {
            // Removed level progression logic
            // if (currentLevel < 10) { ... } else { ... } 
            showGameOver(true); // Just show victory screen
        }
    } else if (!gameRunning) {
        // Don't warn if game simply hasn't started
    } else {
        console.warn('Update called but gameLevel or gameLevel.player is null or undefined.');
    }
    // Update HTML UI elements AFTER game logic updates
    updateUI(); 
}

// Render game
function render() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return; // Safety check
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Render failed: Could not get canvas context.");
        return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw simple background
    ctx.fillStyle = '#222228'; // Match floor color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game level (which draws tiles, items, characters)
    if (gameLevel) {
        gameLevel.render(ctx);
    } else {
        // Optional: Draw placeholder text centered on canvas if needed
        ctx.fillStyle = '#555';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click Start Game', canvas.width / 2, canvas.height / 2);
    }

    // UI updates are now handled separately in updateUI()
}

// UI update function (updates HTML elements, called less frequently? or on change?)
function updateUI() {
    // Update Score Display
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) scoreDisplay.textContent = `Score: ${score}`;

    // Update Lives Display
    const livesDisplay = document.getElementById('lives-display');
    if (livesDisplay && gameLevel && gameLevel.player) {
        livesDisplay.textContent = `Lives: ${gameLevel.player.lives}`;
    } else if (livesDisplay) {
        livesDisplay.textContent = `Lives: N/A`;
    }

    // Update Inventory Display
    const invSpeed = document.getElementById('inv-speed');
    const invBomb = document.getElementById('inv-bomb');
    const invRange = document.getElementById('inv-range');
    if (invSpeed && invBomb && invRange && gameLevel && gameLevel.player) {
        const inv = gameLevel.player.collectedPowerups;
        invSpeed.textContent = `S: ${inv.speed}`;
        invBomb.textContent = `B: ${inv.bomb}`;
        invRange.textContent = `R: ${inv.range}`;
    } else if (invSpeed) {
        // Reset if no player/level
        invSpeed.textContent = `S: 0`;
        invBomb.textContent = `B: 0`;
        invRange.textContent = `R: 0`;
    }
    
    // Update Game Status Display
    const statusDisplay = document.getElementById('game-status-display');
    if(statusDisplay) {
        statusDisplay.textContent = `Running: ${gameRunning}, Paused: ${gamePaused}`;
    }
    
    // Update Wallet Display (already handled by WalletManager?)
    // If not, add: walletManager.updateUI(); 
}

// Game control functions
function startGame() {
    console.log('startGame function called');
    // console.log(`Attempting to load level: ${currentLevel}`); // Removed level number log
    try {
        // Create a new procedurally generated level
        gameLevel = new Level(); 
        console.log('gameLevel object created (procedural):', gameLevel);
        if (!gameLevel || !gameLevel.grid || gameLevel.grid.length === 0) {
            console.error('Failed to initialize gameLevel correctly. Check Level class and level designs.');
            gameRunning = false; // Ensure game doesn't run if level fails
            return;
        }
        gameRunning = true;
        gamePaused = false;
        score = 0;
        hideGameOver();
        // hideLevelComplete(); // Removed - no level complete modal needed now
        console.log('Game started successfully! gameRunning set to true.');
        updateUI(); // Initial UI update for the new game
    } catch (error) {
        console.error('Error creating Level object:', error);
        gameRunning = false;
    }
}

function togglePause() {
    gamePaused = !gamePaused;
    document.getElementById('pause-button').textContent = gamePaused ? 'Resume' : 'Pause';
    console.log('Game ' + (gamePaused ? 'paused' : 'resumed'));
    updateUI(); // Update status display
}

function restartGame() {
    console.log('Restarting game...');
    // currentLevel = 1; // Removed
    gameRunning = false;
    gamePaused = false;
    score = 0;
    hideGameOver();
    // hideLevelComplete(); // Removed
    startGame(); // Starts a new procedural level
    updateUI(); // Update UI on restart
}

// Input handling
function handleKeyDown(event) {
    keys[event.key] = true;

    if (gameRunning && !gamePaused && gameLevel) {
        // Player movement
        if (keys['ArrowUp'] || keys['w']) {
            gameLevel.player.move('up');
        } else if (keys['ArrowDown'] || keys['s']) {
            gameLevel.player.move('down');
        } else if (keys['ArrowLeft'] || keys['a']) {
            gameLevel.player.move('left');
        } else if (keys['ArrowRight'] || keys['d']) {
            gameLevel.player.move('right');
        }

        // Place bomb
        if (keys[' ']) {
            const bomb = gameLevel.player.placeBomb();
            if (bomb) {
                gameLevel.addBomb(bomb);
            }
        }
    }
}

function handleKeyUp(event) {
    keys[event.key] = false;

    if (gameRunning && !gamePaused && gameLevel) {
        // Stop player movement when no movement keys are pressed
        if (!(keys['ArrowUp'] || keys['w'] || keys['ArrowDown'] || keys['s'] || 
              keys['ArrowLeft'] || keys['a'] || keys['ArrowRight'] || keys['d'])) {
            gameLevel.player.stop();
        }
    }
}

// UI updates
function showGameOver(won) {
    gameRunning = false;
    const modal = document.getElementById('gameOverModal');
    const title = document.getElementById('gameOverTitle');
    const message = document.getElementById('gameOverMessage');
    
    if (won) {
        title.textContent = 'Victory!';
        message.textContent = `Congratulations! You defeated all enemies with a score of ${score}!`;
    } else {
        title.textContent = 'Game Over';
        message.textContent = `Your score: ${score}`;
    }
    
    modal.style.display = 'block';
}

function hideGameOver() {
    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'none';
}

// Initialize the game when the page loads
window.addEventListener('load', init); 