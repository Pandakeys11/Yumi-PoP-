class SpriteManager {
    constructor() {
        // No need to store sprites anymore
        // this.sprites = { ... };
        this.loaded = true; // Assume loaded immediately
        console.log('SpriteManager: Bypassing sprite loading, setting loaded=true');
    }

    // Make loadSprites do nothing and not be async
    loadSprites() {
        console.log('SpriteManager: loadSprites() called, but doing nothing (bypassed).');
        this.loaded = true; // Ensure it stays true
        // No async operations, return immediately or return a resolved promise
        return Promise.resolve(); 
    }

    // loadImage is no longer needed
    // loadImage(src) { ... }

    // getSprite methods should consistently return null or a placeholder if needed,
    // but they shouldn't be called by the updated render functions anyway.
    getSprite(category, name) {
        // console.warn(`SpriteManager: getSprite(${category}, ${name}) called but sprites are bypassed.`);
        return null;
    }

    getPlayerSprite(state) { return null; }
    getEnemySprite(type) { return null; }
    getBombSprite(type = 'default') { return null; }
    getExplosionSprite(size = 'small') { return null; }
    getTileSprite(type) { return null; }
    getPowerupSprite(type) { return null; }
}

// Export the SpriteManager class
window.SpriteManager = SpriteManager; 