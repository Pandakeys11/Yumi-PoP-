const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Function to extract a ZIP file
function extractZip(zipPath, destPath) {
    try {
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(destPath, true);
        console.log(`Successfully extracted ${path.basename(zipPath)} to ${destPath}`);
    } catch (error) {
        console.error(`Error extracting ${path.basename(zipPath)}:`, error);
    }
}

// Main function to extract all assets
function extractAssets() {
    console.log('Starting asset extraction...');
    
    const categories = ['player', 'enemies', 'bombs', 'explosions', 'tiles', 'powerups'];
    
    categories.forEach(category => {
        const zipPath = path.join('assets', 'sprites', category, `dark-fantasy-${category}.zip`);
        const destPath = path.join('assets', 'sprites', category);
        
        if (fs.existsSync(zipPath)) {
            extractZip(zipPath, destPath);
        } else {
            console.log(`No ZIP file found for ${category}`);
        }
    });
    
    console.log('Asset extraction complete!');
}

// Run the extraction process
extractAssets(); 