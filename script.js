const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const pointsEl = document.getElementById("points");
const livesEl = document.getElementById("lives");
const restartBtn = document.getElementById("restartBtn");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");

canvas.width = 400;
canvas.height = 400;

const box = 20;
let snake = [{ x: 200, y: 200 }];
let direction = "RIGHT";
let food = getRandomFood();
let score = 0;
let speed = 200;
let points = JSON.parse(localStorage.getItem("points")) || 0;
let snakeColor = JSON.parse(localStorage.getItem("snakeColor")) || "lime";
let startBonus = false;
let lives = 3;
let game; // змінна для інтервалу

const eatSound = new Audio("sounds/eat.mp3");
const loseSound = new Audio("sounds/lose.mp3");
const startSound = new Audio("sounds/start.mp3");

function updatePoints() {
    pointsEl.textContent = `Очки: ${points}`;
    localStorage.setItem("points", JSON.stringify(points));
}

function updateLives() {
    livesEl.textContent = `Життя: ${lives}`;
}

function buySkin(color) {
    if (points >= 10) {
        points -= 10;
        snakeColor = color;
        localStorage.setItem("snakeColor", JSON.stringify(snakeColor));
        updatePoints();
        alert("Ви купили новий колір змійки!");
    } else {
        alert("Недостатньо очок!");
    }
}

function buyRainbowSnake() {
    if (points >= 50) {
        points -= 50;
        snakeColor = "RAINBOW";
        localStorage.setItem("snakeColor", JSON.stringify(snakeColor));
        updatePoints();
        alert("Ви купили різнокольорову змійку!");
    } else {
        alert("Недостатньо очок!");
    }
}

function buyBonus() {
    if (points >= 15) {
        points -= 15;
        startBonus = true;
        updatePoints();
        alert("Ви купили стартовий бонус (+5 очок)!");
    } else {
        alert("Недостатньо очок!");
    }
}

function buyLife() {
    if (points >= 20) {
        points -= 20;
        lives += 1;
        updatePoints();
        updateLives();
        alert("Ви купили додаткове життя!");
    } else {
        alert("Недостатньо очок!");
    }
}

function getRandomFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = snakeColor === "RAINBOW" ? `hsl(${index * 20}, 100%, 50%)` : snakeColor;
        ctx.fillRect(segment.x, segment.y, box, box);
        ctx.strokeStyle = "black";
        ctx.strokeRect(segment.x, segment.y, box, box);
    });
}

function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);
}

function updateSnake() {
    const head = { ...snake[0] };

    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 1;
        scoreEl.textContent = `Рахунок: ${score}`;
        food = getRandomFood();
        eatSound.play();
    } else {
        snake.pop();
    }

    if (
        head.x < 0 || head.x >= canvas.width ||
        head.y < 0 || head.y >= canvas.height ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        loseLife();
    }
}

function loseLife() {
    if (lives > 0) {
        lives -= 1;
        updateLives();
    }

    // Якщо життя закінчились, то припиняємо гру і не мінусуємо більше життя
    if (lives === 0) {
        loseSound.play();
        clearInterval(game);
        alert("Гра закінчена! Ваш рахунок: " + score);
        points += score;
        updatePoints();
        restartBtn.style.display = "block";
    } else {
        // Перезапуск гри, але не мінусуємо більше життів
        snake = [{ x: 200, y: 200 }];
        direction = "RIGHT";
        food = getRandomFood();
    }
}

function directionControl(dir) {
    if (dir === "UP" && direction !== "DOWN") direction = "UP";
    if (dir === "DOWN" && direction !== "UP") direction = "DOWN";
    if (dir === "LEFT" && direction !== "RIGHT") direction = "LEFT";
    if (dir === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
}

function startGame() {
    snake = [{ x: 200, y: 200 }];
    direction = "RIGHT";
    score = 0;
    scoreEl.textContent = `Рахунок: ${score}`;
    food = getRandomFood();
    restartBtn.style.display = "none";
    lives = 3; // Відновлення життів після початку нової гри

    if (game) clearInterval(game);
    game = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFood();
        updateSnake();
        drawSnake();
    }, speed);
}

restartBtn.addEventListener("click", startGame);
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") directionControl("UP");
    if (e.key === "ArrowDown") directionControl("DOWN");
    if (e.key === "ArrowLeft") directionControl("LEFT");
    if (e.key === "ArrowRight") directionControl("RIGHT");
});

// Оновлення швидкості гри при зміні значення повзунка
speedSlider.addEventListener("input", (e) => {
    speed = e.target.value;
    speedValue.textContent = speed;
});

updatePoints();
updateLives();
startGame();