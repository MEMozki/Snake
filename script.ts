// script.js
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const generationSpan = document.getElementById('generation');

const canvasSize = 400;
canvas.width = canvasSize;
canvas.height = canvasSize;

const scale = 20;
const rows = canvasSize / scale;
const columns = canvasSize / scale;

let snake;
let food;
let generation = 0;

// Basic snake and food classes
class Snake {
    constructor() {
        this.body = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.grow = false;
    }

    update() {
        const head = { ...this.body[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        if (this.grow) {
            this.grow = false;
        } else {
            this.body.pop();
        }

        this.body.unshift(head);
    }

    changeDirection(direction) {
        this.direction = direction;
    }

    grow() {
        this.grow = true;
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
    snake = new Snake();
    food = new Food();
    generation++;
    generationSpan.innerText = generation;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';

    for (let part of snake.body) {
        ctx.fillRect(part.x * scale, part.y * scale, scale, scale);
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(food.position.x * scale, food.position.y * scale, scale, scale);
}

function update() {
    snake.update();

    if (snake.body[0].x === food.position.x && snake.body[0].y === food.position.y) {
        snake.grow();
        food = new Food();
    }

    if (snake.checkCollision()) {
        setup();
    }
}

function gameLoop() {
    update();
    draw();
    setTimeout(gameLoop, 100);
}

setup();
gameLoop();
