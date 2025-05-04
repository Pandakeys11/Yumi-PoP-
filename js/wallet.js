class WalletManager {
    constructor(game) {
        this.game = game;
        this.provider = null;
        this.web3 = null;
        this.address = null;
        this.connected = false;
    }

    async connect() {
        try {
            // Initialize Web3Modal
            const web3Modal = new Web3Modal.default({
                cacheProvider: true,
                providerOptions: {
                    // Add your provider options here
                }
            });

            // Connect to wallet
            this.provider = await web3Modal.connect();
            this.web3 = new ethers.providers.Web3Provider(this.provider);

            // Get account
            const accounts = await this.web3.listAccounts();
            this.address = accounts[0];
            this.connected = true;

            // Update UI
            this.updateUI();

            // Set up event listeners
            this.setupEventListeners();

            return true;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            return false;
        }
    }

    setupEventListeners() {
        // Listen for account changes
        this.provider.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                this.disconnect();
            } else {
                this.address = accounts[0];
                this.updateUI();
            }
        });

        // Listen for chain changes
        this.provider.on('chainChanged', () => {
            window.location.reload();
        });

        // Listen for disconnect
        this.provider.on('disconnect', () => {
            this.disconnect();
        });
    }

    disconnect() {
        this.provider = null;
        this.web3 = null;
        this.address = null;
        this.connected = false;
        this.updateUI();
    }

    updateUI() {
        const display = document.getElementById('walletAddressDisplay');
        const button = document.getElementById('connectWalletButton');

        if (this.connected) {
            display.textContent = `${this.address.substring(0, 6)}...${this.address.substring(this.address.length - 4)}`;
            button.textContent = 'Disconnect Wallet';
            button.onclick = () => this.disconnect();
        } else {
            display.textContent = 'Not connected';
            button.textContent = 'Connect Wallet';
            button.onclick = () => this.connect();
        }
    }

    async signMessage(message) {
        if (!this.connected) {
            throw new Error('Wallet not connected');
        }

        try {
            const signer = this.web3.getSigner();
            const signature = await signer.signMessage(message);
            return signature;
        } catch (error) {
            console.error('Error signing message:', error);
            throw error;
        }
    }

    async sendTransaction(transaction) {
        if (!this.connected) {
            throw new Error('Wallet not connected');
        }

        try {
            const signer = this.web3.getSigner();
            const tx = await signer.sendTransaction(transaction);
            return tx;
        } catch (error) {
            console.error('Error sending transaction:', error);
            throw error;
        }
    }
} 