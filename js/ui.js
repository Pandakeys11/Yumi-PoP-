class UI {
    constructor(game) {
        this.game = game;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Game controls
        document.getElementById('start-button').addEventListener('click', () => {
            this.game.startGame();
            this.updateGameState('playing');
        });

        document.getElementById('pause-button').addEventListener('click', () => {
            this.game.togglePause();
            this.updateGameState(this.game.gameState);
        });

        document.getElementById('restart-button').addEventListener('click', () => {
            this.game.restartGame();
            this.updateGameState('playing');
        });

        // Wallet connection
        document.getElementById('connectWalletButton').addEventListener('click', () => {
            this.connectWallet();
        });
    }

    updateGameState(state) {
        const startButton = document.getElementById('start-button');
        const pauseButton = document.getElementById('pause-button');
        const restartButton = document.getElementById('restart-button');

        switch(state) {
            case 'menu':
                startButton.textContent = 'Start Game';
                pauseButton.disabled = true;
                restartButton.disabled = true;
                break;
            case 'playing':
                startButton.textContent = 'Resume Game';
                pauseButton.disabled = false;
                restartButton.disabled = false;
                break;
            case 'paused':
                startButton.textContent = 'Resume Game';
                pauseButton.disabled = false;
                restartButton.disabled = false;
                break;
            case 'gameover':
                startButton.textContent = 'New Game';
                pauseButton.disabled = true;
                restartButton.disabled = false;
                break;
        }
    }

    updatePlayerStats(stats) {
        document.getElementById('bombCount').textContent = stats.maxBombs;
        document.getElementById('bombPower').textContent = stats.bombPower;
        document.getElementById('playerSpeed').textContent = stats.speed.toFixed(1);
    }

    updateScore(score) {
        document.getElementById('score').textContent = score;
    }

    showGameOver(won, score) {
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');

        modal.style.display = 'flex';
        title.textContent = won ? 'Victory!' : 'Game Over';
        message.textContent = won ? 
            `You defeated all enemies! Final score: ${score}` :
            `You were defeated! Final score: ${score}`;
    }

    async connectWallet() {
        try {
            // Initialize Web3Modal
            const web3Modal = new Web3Modal.default({
                cacheProvider: true,
                providerOptions: {
                    // Add your provider options here
                }
            });

            // Connect to wallet
            const provider = await web3Modal.connect();
            const web3 = new ethers.providers.Web3Provider(provider);

            // Get account
            const accounts = await web3.listAccounts();
            const address = accounts[0];

            // Update UI
            document.getElementById('walletAddressDisplay').textContent = 
                `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
            
            // Store provider and web3 instance
            this.game.wallet = {
                provider,
                web3,
                address
            };

        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet. Please try again.');
        }
    }
} 