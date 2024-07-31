const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const generationSpan = document.getElementById('generation');
const liveSnakesSpan = document.getElementById('live-snakes');

const canvasSize = 400;
canvas.width = canvasSize;
canvas.height = canvasSize;

const scale = 20;
const rows = canvasSize / scale;
const columns = canvasSize / scale;
const numSnakes = 5;

let snakes = [];
let food;
let generation = 0;

class Snake {
    constructor() {
        this.body = [{ x: Math.floor(columns / 2), y: Math.floor(rows / 2) }];
        this.direction = { x: 1, y: 0 };
        this.growPending = false;
        this.alive = true;
    }

    update() {
        if (!this.alive) return;

        const head = { ...this.body[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        if (this.growPending) {
            this.growPending = false;
        } else {
            this.body.pop();
        }

        this.body.unshift(head);

        if (this.checkCollision()) {
            this.alive = false;
        }
    }

    changeDirection(newDirection) {
        const oppositeDirection = { x: -this.direction.x, y: -this.direction.y };
        if (newDirection.x !== oppositeDirection.x || newDirection.y !== oppositeDirection.y) {
            this.direction = newDirection;
        }
    }

    randomDirection() {
        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    checkCollision() {
        const head = this.body[0];
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }
        if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows) {
            return true;
        }
        return false;
    }

    grow() {
        this.growPending = true;
    }
}

class Food {
    constructor() {
        this.position = this.randomPosition();
    }

    randomPosition() {
        let x = Math.floor(Math.random() * columns);
        let y = Math.floor(Math.random() * rows);
        return { x, y };
    }
}

function setup() {
    snakes = [];
    for (let i = 0; i < numSnakes; i++) {
        snakes.push(new Snake());
    }
    food = new Food();
    generation++;
    generationSpan.innerText = generation;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snakes.forEach(snake => {
        if (!snake.alive) return;
        ctx.fillStyle = '#FFF';
        snake.body.forEach(part => {
            ctx.fillRect(part.x * scale, part.y * scale, scale, scale);
        });
    });

    ctx.fillStyle = 'red'; // Убедитесь, что цвет установлен в красный
    ctx.fillRect(food.position.x * scale, food.position.y * scale, scale, scale);
}

function update() {
    snakes.forEach(snake => {
        if (snake.alive) {
            snake.update();

            if (snake.body[0].x === food.position.x && snake.body[0].y === food.position.y) {
                snake.grow();
                food = new Food();
            }
        }
    });

    if (snakes.every(snake => !snake.alive)) {
        setup();
    }

    liveSnakesSpan.innerText = snakes.filter(snake => snake.alive).length;
}

function gameLoop() {
    snakes.forEach(snake => {
        if (snake.alive) {
            snake.changeDirection(snake.randomDirection());
        }
    });

    update();
    draw();
    setTimeout(gameLoop, 100);
}

setup();
gameLoop();
