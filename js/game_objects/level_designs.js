// Level designs for the game
const LEVEL_DESIGNS = {
    // Level 1: Basic Training
    level1: {
        name: "Basic Training",
        description: "Learn the basics of movement and bomb placement",
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        playerStart: { x: 1, y: 1 },
        enemies: [
            { type: 'skeleton', x: 11, y: 1 },
            { type: 'skeleton', x: 1, y: 9 }
        ],
        powerups: [
            { type: 'speed', x: 6, y: 5 },
            { type: 'bomb', x: 6, y: 1 }
        ]
    },

    // Level 2: The Maze
    level2: {
        name: "The Maze",
        description: "Navigate through a complex maze while avoiding enemies",
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        playerStart: { x: 1, y: 1 },
        enemies: [
            { type: 'ghost', x: 11, y: 1 },
            { type: 'ghost', x: 1, y: 9 },
            { type: 'ghost', x: 11, y: 9 }
        ],
        powerups: [
            { type: 'range', x: 6, y: 5 },
            { type: 'speed', x: 6, y: 1 },
            { type: 'bomb', x: 6, y: 9 }
        ]
    },

    // Level 3: The Arena
    level3: {
        name: "The Arena",
        description: "Fight your way through waves of enemies in an open arena",
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        playerStart: { x: 6, y: 5 },
        enemies: [
            { type: 'demon', x: 2, y: 2 },
            { type: 'demon', x: 10, y: 2 },
            { type: 'demon', x: 2, y: 8 },
            { type: 'demon', x: 10, y: 8 }
        ],
        powerups: [
            { type: 'range', x: 6, y: 2 },
            { type: 'speed', x: 6, y: 8 },
            { type: 'bomb', x: 2, y: 5 },
            { type: 'bomb', x: 10, y: 5 }
        ]
    },

    // Level 4: The Crossroads
    level4: {
        name: "The Crossroads",
        description: "Navigate through intersecting paths while avoiding enemies",
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        playerStart: { x: 1, y: 1 },
        enemies: [
            { type: 'ghost', x: 11, y: 1 },
            { type: 'skeleton', x: 6, y: 5 },
            { type: 'ghost', x: 1, y: 9 }
        ],
        powerups: [
            { type: 'speed', x: 6, y: 1 },
            { type: 'range', x: 6, y: 9 },
            { type: 'bomb', x: 1, y: 5 },
            { type: 'bomb', x: 11, y: 5 }
        ]
    },

    // Level 5: The Spiral
    level5: {
        name: "The Spiral",
        description: "Navigate through a spiral pattern while collecting powerups",
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        playerStart: { x: 1, y: 1 },
        enemies: [
            { type: 'demon', x: 6, y: 6 },
            { type: 'ghost', x: 9, y: 1 },
            { type: 'skeleton', x: 1, y: 9 }
        ],
        powerups: [
            { type: 'speed', x: 6, y: 1 },
            { type: 'range', x: 6, y: 9 },
            { type: 'bomb', x: 9, y: 9 },
            { type: 'speed', x: 1, y: 5 }
        ]
    },

    // Level 6: The Fortress
    level6: {
        name: "The Fortress",
        description: "Break through the fortress walls to reach the enemies",
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1],
            [1, 0, 2, 1, 1, 1, 1, 1, 1, 1, 2, 0, 1],
            [1, 0, 2, 1, 0, 0, 0, 0, 0, 1, 2, 0, 1],
            [1, 0, 2, 1, 0, 0, 0, 0, 0, 1, 2, 0, 1],
            [1, 0, 2, 1, 0, 0, 0, 0, 0, 1, 2, 0, 1],
            [1, 0, 2, 1, 1, 1, 1, 1, 1, 1, 2, 0, 1],
            [1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        playerStart: { x: 6, y: 1 },
        enemies: [
            { type: 'demon', x: 6, y: 6 },
            { type: 'ghost', x: 4, y: 6 },
            { type: 'ghost', x: 8, y: 6 }
        ],
        powerups: [
            { type: 'range', x: 2, y: 2 },
            { type: 'bomb', x: 10, y: 2 },
            { type: 'speed', x: 2, y: 8 },
            { type: 'bomb', x: 10, y: 8 }
        ]
    },

    // Level 7: The Gauntlet
    level7: {
        name: "The Gauntlet",
        description: "Survive the narrow passage filled with enemies",
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        playerStart: { x: 1, y: 1 },
        enemies: [
            { type: 'ghost', x: 11, y: 1 },
            { type: 'ghost', x: 1, y: 9 },
            { type: 'skeleton', x: 6, y: 3 },
            { type: 'skeleton', x: 6, y: 7 }
        ],
        powerups: [
            { type: 'speed', x: 6, y: 1 },
            { type: 'range', x: 6, y: 5 },
            { type: 'bomb', x: 6, y: 9 }
        ]
    },

    // Level 8: The Labyrinth
    level8: {
        name: "The Labyrinth",
        description: "Find your way through a complex maze with multiple paths",
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        playerStart: { x: 1, y: 1 },
        enemies: [
            { type: 'demon', x: 11, y: 1 },
            { type: 'ghost', x: 1, y: 9 },
            { type: 'skeleton', x: 11, y: 9 },
            { type: 'ghost', x: 6, y: 5 }
        ],
        powerups: [
            { type: 'speed', x: 6, y: 1 },
            { type: 'range', x: 6, y: 9 },
            { type: 'bomb', x: 1, y: 5 },
            { type: 'bomb', x: 11, y: 5 }
        ]
    },

    // Level 9: The Challenge
    level9: {
        name: "The Challenge",
        description: "Face the ultimate test of skill and strategy",
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1],
            [1, 0, 2, 1, 1, 1, 1, 1, 1, 1, 2, 0, 1],
            [1, 0, 2, 1, 0, 0, 0, 0, 0, 1, 2, 0, 1],
            [1, 0, 2, 1, 0, 0, 0, 0, 0, 1, 2, 0, 1],
            [1, 0, 2, 1, 0, 0, 0, 0, 0, 1, 2, 0, 1],
            [1, 0, 2, 1, 1, 1, 1, 1, 1, 1, 2, 0, 1],
            [1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        playerStart: { x: 6, y: 1 },
        enemies: [
            { type: 'demon', x: 6, y: 6 },
            { type: 'ghost', x: 4, y: 6 },
            { type: 'ghost', x: 8, y: 6 },
            { type: 'skeleton', x: 6, y: 4 },
            { type: 'skeleton', x: 6, y: 8 }
        ],
        powerups: [
            { type: 'range', x: 2, y: 2 },
            { type: 'speed', x: 10, y: 2 },
            { type: 'bomb', x: 2, y: 8 },
            { type: 'bomb', x: 10, y: 8 }
        ]
    },

    // Level 10: The Final Battle
    level10: {
        name: "The Final Battle",
        description: "Face the ultimate challenge in an epic showdown",
        layout: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1],
            [1, 0, 2, 1, 1, 1, 1, 1, 1, 1, 2, 0, 1],
            [1, 0, 2, 1, 0, 0, 0, 0, 0, 1, 2, 0, 1],
            [1, 0, 2, 1, 0, 0, 0, 0, 0, 1, 2, 0, 1],
            [1, 0, 2, 1, 0, 0, 0, 0, 0, 1, 2, 0, 1],
            [1, 0, 2, 1, 1, 1, 1, 1, 1, 1, 2, 0, 1],
            [1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        playerStart: { x: 6, y: 1 },
        enemies: [
            { type: 'demon', x: 6, y: 6 },
            { type: 'demon', x: 4, y: 6 },
            { type: 'demon', x: 8, y: 6 },
            { type: 'ghost', x: 6, y: 4 },
            { type: 'ghost', x: 6, y: 8 },
            { type: 'skeleton', x: 4, y: 4 },
            { type: 'skeleton', x: 8, y: 4 },
            { type: 'skeleton', x: 4, y: 8 },
            { type: 'skeleton', x: 8, y: 8 }
        ],
        powerups: [
            { type: 'range', x: 2, y: 2 },
            { type: 'speed', x: 10, y: 2 },
            { type: 'bomb', x: 2, y: 8 },
            { type: 'bomb', x: 10, y: 8 },
            { type: 'range', x: 6, y: 2 },
            { type: 'speed', x: 6, y: 8 }
        ]
    }
};

// Export the level designs
window.LEVEL_DESIGNS = LEVEL_DESIGNS; 