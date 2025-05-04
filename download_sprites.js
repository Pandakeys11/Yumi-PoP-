const fs = require('fs');
const https = require('https');
const path = require('path');

// Individual sprite URLs
const SPRITES = {
    player: {
        idle: 'https://opengameart.org/sites/default/files/dark-mage-idle.png',
        walk: 'https://opengameart.org/sites/default/files/dark-mage-walk.png',
        attack: 'https://opengameart.org/sites/default/files/dark-mage-attack.png'
    },
    enemies: {
        skeleton: 'https://opengameart.org/sites/default/files/skeleton.png',
        ghost: 'https://opengameart.org/sites/default/files/ghost.png',
        demon: 'https://opengameart.org/sites/default/files/demon.png'
    },
    bombs: {
        default: 'https://opengameart.org/sites/default/files/dark-orb.png',
        special: 'https://opengameart.org/sites/default/files/dark-rune.png'
    },
    explosions: {
        small: 'https://opengameart.org/sites/default/files/dark-explosion-small.png',
        large: 'https://opengameart.org/sites/default/files/dark-explosion-large.png'
    },
    tiles: {
        floor: 'https://opengameart.org/sites/default/files/dungeon-floor.png',
        wall: 'https://opengameart.org/sites/default/files/dungeon-wall.png',
        destructible: 'https://opengameart.org/sites/default/files/dungeon-destructible.png'
    },
    powerups: {
        speed: 'https://opengameart.org/sites/default/files/speed-rune.png',
        bomb: 'https://opengameart.org/sites/default/files/bomb-rune.png',
        range: 'https://opengameart.org/sites/default/files/range-rune.png'
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

// Main function to download all sprites
async function downloadSprites() {
    console.log('Starting sprite download...');
    
    for (const [category, sprites] of Object.entries(SPRITES)) {
        const categoryPath = path.join('assets', 'sprites', category);
        
        // Ensure category directory exists
        if (!fs.existsSync(categoryPath)) {
            fs.mkdirSync(categoryPath, { recursive: true });
        }
        
        for (const [spriteName, url] of Object.entries(sprites)) {
            try {
                console.log(`Downloading ${category}/${spriteName}...`);
                const destPath = path.join(categoryPath, `${spriteName}.png`);
                await downloadFile(url, destPath);
                console.log(`Successfully downloaded ${category}/${spriteName}`);
            } catch (error) {
                console.error(`Error downloading ${category}/${spriteName}:`, error);
            }
        }
    }
    
    console.log('Sprite download complete!');
}

// Run the download process
downloadSprites().catch(console.error); 