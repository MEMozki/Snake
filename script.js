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
const initialEpsilon = 0.2;
const epsilonDecay = 0.99;
const learningRate = 0.1;
const discountFactor = 0.9;

let snakes = [];
let food;
let generation = 0;
let epsilon = initialEpsilon;

const colors = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3"];

class Snake {
    constructor(qTable = {}, color = '#FFF') {
        this.body = [{ x: Math.floor(columns / 2), y: Math.floor(rows / 2) }];
        this.direction = { x: 1, y: 0 };
        this.growPending = false;
        this.alive = true;
        this.qTable = qTable;
        this.state = this.getState();
        this.totalReward = 0;
        this.color = color;
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
            console.log(`Snake with color ${this.color} collided.`);
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

    getState() {
        const head = this.body[0];
        const foodDirection = {
            x: Math.sign(food.position.x - head.x),
            y: Math.sign(food.position.y - head.y)
        };
        return `${head.x},${head.y},${foodDirection.x},${foodDirection.y}`;
    }

    chooseAction() {
        const state = this.getState();
        if (Math.random() < epsilon) {
            return this.randomDirection();
        } else {
            if (!(state in this.qTable)) {
                this.qTable[state] = {
                    up: 0,
                    down: 0,
                    left: 0,
                    right: 0
                };
            }
            const actions = this.qTable[state];
            const maxQ = Math.max(actions.up, actions.down, actions.left, actions.right);
            const bestActions = Object.keys(actions).filter(action => actions[action] === maxQ);
            const action = bestActions[Math.floor(Math.random() * bestActions.length)];
            switch (action) {
                case 'up': return { x: 0, y: -1 };
                case 'down': return { x: 0, y: 1 };
                case 'left': return { x: -1, y: 0 };
                case 'right': return { x: 1, y: 0 };
            }
        }
    }

    updateQTable(reward) {
        const prevState = this.state;
        const newState = this.getState();
        if (!(newState in this.qTable)) {
            this.qTable[newState] = {
                up: 0,
                down: 0,
                left: 0,
                right: 0
            };
        }

        const actions = this.qTable[prevState];
        const nextActions = this.qTable[newState];
        const maxQ = Math.max(nextActions.up, nextActions.down, nextActions.left, nextActions.right);
        const action = this.getActionName(this.direction);

        actions[action] = actions[action] + learningRate * (reward + discountFactor * maxQ - actions[action]);
        this.state = newState;
        this.totalReward += reward;
    }

    getActionName(direction) {
        if (direction.x === 1) return 'right';
        if (direction.x === -1) return 'left';
        if (direction.y === 1) return 'down';
        if (direction.y === -1) return 'up';
    }

    grow() {
        this.growPending = true;
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
    snakes = [];
    for (let i = 0; i < numSnakes; i++) {
        snakes.push(new Snake({}, colors[i % colors.length]));
    }
    food = new Food();
    generation++;
    generationSpan.innerText = generation;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snakes.forEach(snake => {
        if (!snake.alive) return;
        ctx.fillStyle = snake.color;
        snake.body.forEach(part => {
            ctx.fillRect(part.x * scale, part.y * scale, scale, scale);
        });
    });

    ctx.fillStyle = 'white';
    ctx.fillRect(food.position.x * scale, food.position.y * scale, scale, scale);
}

function update() {
    snakes.forEach(snake => {
        if (snake.alive) {
            const prevState = snake.getState();
            snake.update();

            if (snake.body[0].x === food.position.x && snake.body[0].y === food.position.y) {
                snake.grow();
                food = new Food();
                snake.updateQTable(10); // Reward for eating food
            } else {
                snake.updateQTable(-1); // Penalty for each move
            }
        }
    });

    if (snakes.every(snake => !snake.alive)) {
        epsilon *= epsilonDecay;
        setup();
    }

    liveSnakesSpan.innerText = snakes.filter(snake => snake.alive).length;
}

function gameLoop() {
    snakes.forEach(snake => {
        if (snake.alive) {
            snake.changeDirection(snake.chooseAction());
        }
    });

    update();
    draw();
    setTimeout(gameLoop, 100);
}

setup();
gameLoop();
