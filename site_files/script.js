const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const colors = document.getElementById("colors");
const playButton = document.getElementById("playButton");
const increaseBallButton = document.getElementById("increaseBallButton");
const decreaseBallButton = document.getElementById("decreaseBallButton");
const increaseStringButton = document.getElementById("increaseStringButton");
const decreaseStringButton = document.getElementById("decreaseStringButton");
const increaseGravityButton = document.getElementById("increaseGravityButton");
const decreaseGravityButton = document.getElementById("decreaseGravityButton");
const resetButton = document.getElementById("resetButton");

let allColor = "blue";
let isPlaying = false;
let draggedBall = null;
let dragStartAngle = 0;
const balls = [];
const radius = 20;
let stringLength = 200;
let gravity = 100; // m/s^2
const damping = 1; // Slight damping for realism

function resetBalls() {
    const startX = canvas.width / 2 - (balls.length * radius * 2) / 2;
    const topY = 120; // Align with the top of the Newton's Cradle
    balls.forEach((ball, index) => {
        ball.x = startX + index * (radius * 2);
        ball.y = topY;
        ball.angle = 0;
        ball.angularVelocity = 0;
    });
    draw();
}

function createBall(x, y, radius) {
    return { x, y, angle: 0, angularVelocity: 0, radius, mass: 1 };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const topY = 120; // Align with the top of the Newton's Cradle
    ctx.beginPath();
    ctx.moveTo(0, topY);
    ctx.lineTo(canvas.width, topY);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.stroke();

    balls.forEach(ball => {
        const ballX = ball.x + Math.sin(ball.angle) * stringLength;
        const ballY = ball.y + Math.cos(ball.angle) * stringLength;

        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ballX, ballY);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        const gradient = ctx.createRadialGradient(ballX - ball.radius / 4, ballY - ball.radius / 4, ball.radius / 8, ballX, ballY, ball.radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, allColor);

        ctx.beginPath();
        ctx.arc(ballX, ballY, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.stroke();
    });
    updateContentPosition();
}

function updateContentPosition() {
    const topY = 120; // Align with the top of the Newton's Cradle
    const contentDiv = document.querySelector('.content');
    contentDiv.style.marginTop = `${topY + stringLength + 30}px`;
}

increaseStringButton.addEventListener("click", () => {
    stringLength += 10;
    draw();
    updateContentPosition();
});

decreaseStringButton.addEventListener("click", () => {
    stringLength = Math.max(50, stringLength - 10);
    draw();
    updateContentPosition();
});

function update(dt) {
    if (isPlaying) {
        balls.forEach(ball => {
            const tangentialAcceleration = -gravity / stringLength * Math.sin(ball.angle);
            ball.angularVelocity += tangentialAcceleration * dt;
            ball.angularVelocity *= damping;
            ball.angle += ball.angularVelocity * dt;
            const maxAngle = Math.PI / 2 - 0.1;
            ball.angle = Math.max(-maxAngle, Math.min(maxAngle, ball.angle));
        });

        for (let i = 0; i < balls.length - 1; i++) {
            const ball1 = balls[i];
            const ball2 = balls[i + 1];
            const x1 = ball1.x + Math.sin(ball1.angle) * stringLength;
            const y1 = ball1.y + Math.cos(ball1.angle) * stringLength;
            const x2 = ball2.x + Math.sin(ball2.angle) * stringLength;
            const y2 = ball2.y + Math.cos(ball2.angle) * stringLength;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 2 * radius) {
                const totalMass = ball1.mass + ball2.mass;
                const newVel1 = (ball1.angularVelocity * (ball1.mass - ball2.mass) + 2 * ball2.mass * ball2.angularVelocity) / totalMass;
                const newVel2 = (ball2.angularVelocity * (ball2.mass - ball1.mass) + 2 * ball1.mass * ball1.angularVelocity) / totalMass;
                ball1.angularVelocity = newVel1;
                ball2.angularVelocity = newVel2;
            }
        }
    }
}

let lastTime = 0;
let animationId = null;

function animate(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    update(dt);
    draw();
    animationId = requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    balls.forEach(ball => {
        const ballX = ball.x + Math.sin(ball.angle) * stringLength;
        const ballY = ball.y + Math.cos(ball.angle) * stringLength;
        const dx = mouseX - ballX;
        const dy = mouseY - ballY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < ball.radius) {
            draggedBall = ball;
            dragStartAngle = ball.angle;
        }
    });
});

canvas.addEventListener('mousemove', (event) => {
    if (!draggedBall) return;
    const dx = event.clientX - draggedBall.x;
    const dy = event.clientY - draggedBall.y;
    const newAngle = Math.atan2(dx, dy);
    const maxAngle = Math.PI / 2 - 0.1;
    const clampedAngle = Math.max(-maxAngle, Math.min(maxAngle, newAngle));
    draggedBall.angle = clampedAngle;

    const index = balls.indexOf(draggedBall);
    if (clampedAngle > 0) {
        for (let i = index + 1; i < balls.length; i++) {
            balls[i].angle = clampedAngle;
        }
        for (let i = 0; i < index; i++) {
            balls[i].angle = 0;
        }
    } else {
        for (let i = 0; i < index; i++) {
            balls[i].angle = clampedAngle;
        }
        for (let i = index + 1; i < balls.length; i++) {
            balls[i].angle = 0;
        }
    }
    draw();
});

canvas.addEventListener('mouseup', () => {
    draggedBall = null;
});

colors.addEventListener("click", () => {
    allColor = getRandomColor();
    draw();
});

playButton.addEventListener("click", () => {
    isPlaying = !isPlaying;
    playButton.textContent = isPlaying ? "Pause" : "Play";
    if (isPlaying && !animationId) {
        lastTime = performance.now();
        animate(lastTime);
    }
});

increaseBallButton.addEventListener("click", () => {
    const topY = 120; // Align with the top of the Newton's Cradle
    balls.push(createBall(canvas.width / 2, topY, radius));
    resetBalls();
});

decreaseBallButton.addEventListener("click", () => {
    if (balls.length > 0) {
        balls.pop();
        resetBalls();
    }
});

increaseStringButton.addEventListener("click", () => {
    stringLength += 10;
    draw();
});

decreaseStringButton.addEventListener("click", () => {
    stringLength = Math.max(50, stringLength - 10);
    draw();
});

increaseGravityButton.addEventListener("click", () => {
    gravity += 10;
});

decreaseGravityButton.addEventListener("click", () => {
    gravity = Math.max(0, gravity - 10);
});

resetButton.addEventListener("click", () => {
    resetBalls();
    isPlaying = false;
    playButton.textContent = "Play";
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
});

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}

function initialize() {
    const topY = 120; // Align with the top of the Newton's Cradle
    for (let i = 0; i < 5; i++) {
        balls.push(createBall(canvas.width / 2, topY, radius));
    }
    resetBalls();
    animate(performance.now());
}

initialize();

document.querySelectorAll('.fullscreen-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const column = e.target.closest('.column');
        column.classList.add('expanded');
        column.querySelector('.fullscreen-button').style.display = 'none';
        column.querySelector('.minimize-button').style.display = 'block';
        document.body.classList.add('expanded-column');
        document.querySelectorAll('.column').forEach(col => {
            if (col !== column) {
                col.style.display = 'none';
            }
        });
        document.querySelector('.name-box').style.zIndex = '0';
        document.querySelector('.controls').style.zIndex = '0';
    });
});

document.querySelectorAll('.minimize-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const column = e.target.closest('.column');
        column.classList.remove('expanded');
        column.querySelector('.fullscreen-button').style.display = 'block';
        column.querySelector('.minimize-button').style.display = 'none';
        document.body.classList.remove('expanded-column');
        document.querySelectorAll('.column').forEach(col => {
            col.style.display = 'block';
        });
        document.querySelector('.name-box').style.zIndex = '10';
        document.querySelector('.controls').style.zIndex = '10';
    });
});