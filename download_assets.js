const fs = require('fs');
const https = require('https');
const path = require('path');

// Asset URLs from OpenGameArt
const ASSETS = {
    player: {
        url: 'https://opengameart.org/sites/default/files/dark-fantasy-character-pack.zip',
        dest: 'assets/sprites/player'
    },
    enemies: {
        url: 'https://opengameart.org/sites/default/files/dark-fantasy-enemies.zip',
        dest: 'assets/sprites/enemies'
    },
    bombs: {
        url: 'https://opengameart.org/sites/default/files/dark-magic-effects.zip',
        dest: 'assets/sprites/bombs'
    },
    explosions: {
        url: 'https://opengameart.org/sites/default/files/dark-magic-explosion-effects.zip',
        dest: 'assets/sprites/explosions'
    },
    tiles: {
        url: 'https://opengameart.org/sites/default/files/dark-fantasy-tileset.zip',
        dest: 'assets/sprites/tiles'
    },
    powerups: {
        url: 'https://opengameart.org/sites/default/files/dark-fantasy-items.zip',
        dest: 'assets/sprites/powerups'
    }
};

// Function to download a file
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {}); // Delete the file if download fails
            reject(err);
        });
    });
}

// Main function to download all assets
async function downloadAssets() {
    console.log('Starting asset download...');
    
    for (const [category, asset] of Object.entries(ASSETS)) {
        try {
            console.log(`Downloading ${category} assets...`);
            const fileName = path.basename(asset.url);
            const destPath = path.join(asset.dest, fileName);
            
            // Ensure destination directory exists
            if (!fs.existsSync(asset.dest)) {
                fs.mkdirSync(asset.dest, { recursive: true });
            }
            
            await downloadFile(asset.url, destPath);
            console.log(`Successfully downloaded ${category} assets to ${destPath}`);
        } catch (error) {
            console.error(`Error downloading ${category} assets:`, error);
        }
    }
    
    console.log('Asset download complete!');
}

// Run the download process
downloadAssets().catch(console.error); 