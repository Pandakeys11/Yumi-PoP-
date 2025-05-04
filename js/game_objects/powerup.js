class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.collected = false;
    }

    render(ctx) {
        if (!this.collected) {
            const drawX = this.x + GRID_SIZE * 0.1;
            const drawY = this.y + GRID_SIZE * 0.1;
            const size = GRID_SIZE * 0.8;
            const centerX = drawX + size / 2;
            const centerY = drawY + size / 2;
            
            // Base background
            ctx.fillStyle = '#222'; // Dark background for contrast
            ctx.fillRect(drawX, drawY, size, size);
            ctx.strokeStyle = '#555';
            ctx.strokeRect(drawX, drawY, size, size);

            // Draw themed icon
            ctx.lineWidth = 2;
            if (this.type === 'speed') { // Cyan boot/lightning?
                ctx.strokeStyle = '#00ffff'; // Cyan
                ctx.beginPath();
                ctx.moveTo(centerX - size * 0.2, centerY + size * 0.3);
                ctx.lineTo(centerX, centerY - size * 0.3);
                ctx.lineTo(centerX + size * 0.2, centerY + size * 0.1);
                ctx.stroke();
            } else if (this.type === 'bomb') { // Magenta orb
                ctx.fillStyle = '#ff00ff'; // Magenta
                ctx.beginPath();
                ctx.arc(centerX, centerY, size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'range') { // Green explosion burst
                 ctx.strokeStyle = '#2ecc71'; // Emerald green
                 ctx.beginPath();
                 for (let i = 0; i < 8; i++) { // 8 points
                     const angle = (i / 8) * Math.PI * 2;
                     const startRadius = size * 0.1;
                     const endRadius = size * 0.4;
                     ctx.moveTo(centerX + Math.cos(angle) * startRadius, centerY + Math.sin(angle) * startRadius);
                     ctx.lineTo(centerX + Math.cos(angle) * endRadius, centerY + Math.sin(angle) * endRadius);
                 }
                 ctx.stroke();
            } else {
                // Fallback ? icon
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `${size * 0.6}px sans-serif`;
                ctx.fillText('?', centerX, centerY);
            }
        }
    }
}

// Export the Powerup class
window.Powerup = Powerup; 