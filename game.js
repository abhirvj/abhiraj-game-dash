const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PASTEL_COLORS = [
    'rgb(173, 216, 230)',  // Light Blue
    'rgb(144, 238, 144)',  // Light Green
    'rgb(255, 182, 193)',  // Light Pink
    'rgb(255, 255, 224)',  // Light Yellow
    'rgb(216, 191, 216)',  // Light Purple
    'rgb(255, 218, 185)',  // Light Orange
    'rgb(240, 255, 240)'   // Light Mint
];

const SHAPES = ['rect', 'circle', 'triangle'];
let game, player, level, obstacles, score, gameOver, startTime, retryButtonRect;

document.getElementById('continueButton').addEventListener('click', startGame);
document.getElementById('retryButton').addEventListener('click', resetGame);

function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    initGame();
    gameLoop();
}

function initGame() {
    score = 0;
    gameOver = false;
    startTime = Date.now();
    player = new Player();
    level = new Level(0);
    obstacles = [];
    generateObstacles();
}

function resetGame() {
    document.getElementById('retryScreen').classList.add('hidden');
    initGame();
}

class Player {
    constructor() {
        this.x = 100;
        this.y = HEIGHT - 100;
        this.size = 40;
        this.velY = 0;
        this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        this.rotation = 0;
    }

    update() {
        this.velY += 0.8;
        this.y += this.velY;
        if (this.y > HEIGHT - this.size) {
            this.y = HEIGHT - this.size;
            this.velY = 0;
        }
        this.rotation += 2;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.translate(-this.size / 2, -this.size / 2);
        ctx.fillStyle = PASTEL_COLORS[1];
        if (this.shape === 'rect') {
            ctx.fillRect(0, 0, this.size, this.size);
        } else if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(this.size / 2, this.size / 2, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(this.size / 2, 0);
            ctx.lineTo(0, this.size);
            ctx.lineTo(this.size, this.size);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    jump() {
        this.velY = -15;
    }
}

class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    update() {
        this.x -= 5;
    }

    draw() {
        ctx.fillStyle = PASTEL_COLORS[2];
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Level {
    constructor(levelNum) {
        this.levelNum = levelNum;
    }
}

function generateObstacles() {
    for (let i = 0; i < 10; i++) {
        let x = WIDTH + i * 300;
        let y = Math.random() * (HEIGHT - 200) + 200;
        let width = Math.random() * 50 + 20;
        let height = HEIGHT - y;
        obstacles.push(new Obstacle(x, y, width, height));
    }
}

function gameLoop() {
    if (gameOver) {
        document.getElementById('retryScreen').classList.remove('hidden');
        return;
    }
    ctx.fillStyle = PASTEL_COLORS[0];
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    player.update();
    player.draw();

    obstacles.forEach((obs) => {
        obs.update();
        obs.draw();
        if (collisionDetection(player, obs)) {
            gameOver = true;
        }
    });

    obstacles = obstacles.filter((obs) => obs.x + obs.width > 0);

    score++;
    drawHUD();

    requestAnimationFrame(gameLoop);
}

function collisionDetection(player, obstacle) {
    return (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.size > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.size > obstacle.y
    );
}

function drawHUD() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
    let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    ctx.fillText(`Time: ${elapsedTime}`, WIDTH - 100, 20);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        player.jump();
    }
});