const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let allColor = "blue";
let isPlaying = true;
let draggedBall = null;
let dragStartAngle = 0;
const balls = [];
const radius = 20;
let stringLength = 250;
let gravity = 280;
const damping = 1;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    resetBalls(); // Ensure balls are repositioned when the canvas is resized
}

window.addEventListener('resize', resizeCanvas);

function resetBalls() {
    if (balls.length === 0) return; // Ensure there are balls to reset
    const startX = canvas.width / 2 - (balls.length * radius * 2) / 2 + radius; // Center balls horizontally
    const topY = 120;
    balls.forEach((ball, index) => {
        ball.x = startX + index * (radius * 2);
        ball.y = topY;
        ball.angle = 0;
        ball.angularVelocity = 0;
    });
    if (balls.length > 0) {
        balls[0].angle = -70 * (Math.PI / 180);
        balls[1].angle = -70 * (Math.PI / 180);
    }
    draw();
}

function createBall(x, y, radius) {
    return { x, y, angle: 0, angularVelocity: 0, radius, mass: 1 };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const topY = 120;
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
        // ctx.stroke();
    });
    updateContentPosition();
}

function updateContentPosition() {
    const topY = 120;
    const contentDiv = document.querySelector('.content');
    contentDiv.style.marginTop = `${topY + stringLength + 30}px`;

    const contentHeight = contentDiv.getBoundingClientRect().height;
    document.body.style.height = `${contentHeight + 20}px`; // Set the body height to content height plus 20px
}

function update(dt) {
    if (isPlaying) {
        balls.forEach(ball => {
            const tangentialAcceleration = -gravity / stringLength * Math.sin(ball.angle);
            ball.angularVelocity += tangentialAcceleration * dt;
            ball.angularVelocity *= damping;
            ball.angle += ball.angularVelocity * dt;
        });

        handleCollisions();
    }
}

function handleCollisions() {
    for (let i = 0; i < balls.length - 1; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const ball1 = balls[i];
            const ball2 = balls[j];
            const x1 = ball1.x + Math.sin(ball1.angle) * stringLength;
            const y1 = ball1.y + Math.cos(ball1.angle) * stringLength;
            const x2 = ball2.x + Math.sin(ball2.angle) * stringLength;
            const y2 = ball2.y + Math.cos(ball2.angle) * stringLength;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 2 * radius) {
                const overlap = 2 * radius - distance;
                const totalMass = ball1.mass + ball2.mass;
                const ball1Adjustment = overlap * (ball2.mass / totalMass);
                const ball2Adjustment = overlap * (ball1.mass / totalMass);

                ball1.angle -= ball1Adjustment / stringLength;
                ball2.angle += ball2Adjustment / stringLength;

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
    let newAngle = Math.atan2(dx, dy);
    // Limit angle to 170 degrees
    const maxAngle = 170 * (Math.PI / 180);
    newAngle = Math.min(Math.max(newAngle, -maxAngle), maxAngle);
    draggedBall.angle = newAngle;

    handleCollisions(); // Check for collisions while dragging

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
    message.style.display = "none";
});

increaseBallButton.addEventListener("click", () => {
    const topY = 120;
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
    gravity += 100;
});

decreaseGravityButton.addEventListener("click", () => {
    gravity = Math.max(0, gravity - 100);
});

resetButton.addEventListener("click", () => {
    resetBalls();
    message.style.display = "block";
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
    const topY = 120;
    for (let i = 0; i < 5; i++) {
        balls.push(createBall(canvas.width / 2, topY, radius));
    }
    resetBalls();
    animate(performance.now());
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        isPlaying = false;
        playButton.textContent = "Play";
    } else {
        isPlaying = true;
        playButton.textContent = "Pause";
        lastTime = performance.now();
        animate(lastTime);
    }
});

initialize();document.querySelectorAll('.fullscreen-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const column = e.target.closest('.column');
        if (column.id === 'technical-projects' || column.id === 'investment-blog') {
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
        }
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




function updateMessagePosition() {
    const controls = document.querySelector('.controls');
    const message = document.getElementById('message');
    if (controls && message) {
        const controlsRect = controls.getBoundingClientRect();
        message.style.width = `${controlsRect.width}px`;
    }
}

window.addEventListener('resize', updateMessagePosition);
updateMessagePosition(); // Initial call to set the position


resizeCanvas();



async function fetchStockPrice() {
    try {
        const response = await fetch('./api/getStockPrice');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.c; // Current price
    } catch (error) {
        console.error('Error fetching stock price:', error);
        return null;
    }
}
const previousPrice = 3601;
async function updateStockPrice() {
    const currentPrice = await fetchStockPrice();

    if (currentPrice !== null) {
        document.getElementById('bkng-price').textContent = currentPrice.toFixed(2);
        const returnPercentage = ((currentPrice - previousPrice) / previousPrice) * 100;
        const returnElement = document.getElementById('bkng-return');
        returnElement.textContent = ` (${returnPercentage.toFixed(2)}%)`;

        if (returnPercentage >= 0) {
            returnElement.style.color = 'green';
        } else {
            returnElement.style.color = 'red';
        }
    } else {
        document.getElementById('bkng-price').textContent = 'Error';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateStockPrice();
    setInterval(updateStockPrice, 60000); // Update every 60 seconds
});
