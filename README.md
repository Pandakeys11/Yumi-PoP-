# Dark Fantasy Bomber

A Bomberman-style game with a dark fantasy theme, featuring blockchain integration through WalletConnect.

## Features

- Grid-based movement and bomb placement
- Chain reactions for bomb explosions
- Power-ups (extra bombs, increased power, speed boost, invincibility)
- Enemy AI with different behaviors (wander, chase, flee)
- WalletConnect integration for blockchain features
- Responsive UI with dark fantasy theme

## Controls

- Arrow Keys: Move the player
- Space: Place a bomb
- Start/Pause/Restart buttons: Control game state
- Connect Wallet button: Connect your Web3 wallet

## Game Mechanics

### Player
- Start with 1 bomb
- Can collect power-ups to increase abilities
- Must avoid enemies and explosions
- Can destroy destructible blocks to find power-ups

### Bombs
- Explode after 3 seconds
- Create explosions in all directions
- Chain reactions with other bombs
- Destroy destructible blocks
- Can kill enemies and player

### Enemies
- Wander randomly when player is far
- Chase player when in range
- Can be destroyed by explosions
- Move at different speeds

### Power-ups
- Extra Bomb: Increase maximum bombs
- Power: Increase explosion radius
- Speed: Increase movement speed
- Invincible: Temporary invincibility

## Installation

1. Clone the repository
2. Open `index.html` in a web browser
3. Connect your wallet to access blockchain features

## Development

The game is built using vanilla JavaScript and HTML5 Canvas. The code is organized into several modules:

- `game.js`: Main game loop and state management
- `player.js`: Player movement and abilities
- `bomb.js`: Bomb placement and explosion mechanics
- `enemy.js`: Enemy AI and behavior
- `powerup.js`: Power-up spawning and effects
- `level.js`: Level generation and management
- `ui.js`: User interface management
- `wallet.js`: Blockchain wallet integration

## Assets

The game uses free assets from:
- [OpenGameArt.org](https://opengameart.org/)
- [itch.io](https://itch.io/game-assets/free)
- [Kenney.nl](https://kenney.nl/assets)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 