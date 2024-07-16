const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('scroll', resizeCanvas);
resizeCanvas();

const colors = document.getElementById("colors");
let allColor = "blue";

let balls = [];
const ballCount = 30;
let speedMultiplier = 1;
let time = 0;

class Ball {
    constructor(x, y, radius, color = allColor, delay = 0) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.angle = 0;
        this.distance = 0;
        this.dx = 0;
        this.dy = 0;
        this.initialSpiral = true;
        this.delay = delay;
        this.startTime = null;
        this.spiralSpeed = 2.5; // Increased speed for the initial spiral
        this.spiralDuration = Math.random() * 2000 + 1000; // Random duration between 1-3 seconds
    }

    draw() {
        const gradient = ctx.createRadialGradient(this.x - this.radius / 4, this.y - this.radius / 4, this.radius / 8, this.x, this.y, this.radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, this.color);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();

        this.drawShadow();
    }

    drawShadow() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        ctx.fill();
        ctx.closePath();
    }

    update(currentTime) {
        if (!this.startTime) {
            this.startTime = currentTime;
        }

        if (currentTime - this.startTime < this.delay) {
            return;
        }

        if (this.initialSpiral) {
            this.angle += 0.05 * this.spiralSpeed * speedMultiplier;
            this.distance += 0.5 * this.spiralSpeed * speedMultiplier;
            const newX = canvas.width / 2 + this.distance * Math.cos(this.angle);
            const newY = canvas.height / 2 + this.distance * Math.sin(this.angle);
            this.dx = (newX - this.x) / 2; // Adjust to maintain trajectory speed
            this.dy = (newY - this.y) / 2; // Adjust to maintain trajectory speed
            this.x = newX;
            this.y = newY;

            if (currentTime - this.startTime >= this.delay + this.spiralDuration) {
                this.initialSpiral = false;
            }
        } else {
            this.x += this.dx * speedMultiplier;
            this.y += this.dy * speedMultiplier;

            // Check for collision with walls
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                this.dx = -this.dx;
            }
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                this.dy = -this.dy;
            }

            // Check for collision with other balls
            for (let i = 0; i < balls.length; i++) {
                if (this === balls[i]) continue;

                const dx = this.x - balls[i].x;
                const dy = this.y - balls[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.radius + balls[i].radius) {
                    // Resolve overlap
                    const overlap = (this.radius + balls[i].radius) - distance;
                    const smallerBall = this.radius < balls[i].radius ? this : balls[i];
                    const largerBall = this.radius < balls[i].radius ? balls[i] : this;

                    smallerBall.x -= overlap * (dx / distance) * 0.5;
                    smallerBall.y -= overlap * (dy / distance) * 0.5;
                    largerBall.x += overlap * (dx / distance) * 0.5;
                    largerBall.y += overlap * (dy / distance) * 0.5;

                    // Calculate angle of collision
                    const angle = Math.atan2(dy, dx);
                    const sin = Math.sin(angle);
                    const cos = Math.cos(angle);

                    // Rotate ball velocities to collision axis
                    const v1 = rotate(this.dx, this.dy, sin, cos, true);
                    const v2 = rotate(balls[i].dx, balls[i].dy, sin, cos, true);

                    // Perform 1D collision response
                    const v1Final = collisionResponse(v1, v2, this.radius, balls[i].radius);
                    const v2Final = collisionResponse(v2, v1, balls[i].radius, this.radius);

                    // Rotate velocities back to original axis
                    const v1New = rotate(v1Final[0], v1Final[1], sin, cos, false);
                    const v2New = rotate(v2Final[0], v2Final[1], sin, cos, false);

                    // Update velocities
                    this.dx = v1New[0];
                    this.dy = v1New[1];
                    balls[i].dx = v2New[0];
                    balls[i].dy = v2New[1];
                }
            }
        }

        this.draw();
    }
}

function rotate(dx, dy, sin, cos, reverse) {
    return reverse
        ? [dx * cos + dy * sin, dy * cos - dx * sin]
        : [dx * cos - dy * sin, dy * cos + dx * sin];
}

function collisionResponse(v1, v2, r1, r2) {
    const u1 = v1[0];
    const u2 = v2[0];
    const v1Final = (u1 * (r1 - r2) + 2 * r2 * u2) / (r1 + r2);
    return [v1Final, v1[1]]; // Only return the x component for 1D collision
}

function addBallWithDelay(index) {
    const delay = index * 500; // 500 milliseconds delay between each ball
    const radius = 20;
    let x = canvas.width / 2;
    let y = canvas.height / 2;

    balls.push(new Ball(x, y, radius, allColor, delay));
}

function removeBall() {
    if (balls.length > 0) {
        balls.pop();
    }
}

function increaseSpeed() {
    speedMultiplier += 0.1;
}

function decreaseSpeed() {
    speedMultiplier = Math.max(0.1, speedMultiplier - 0.1);
}

document.getElementById('addBall').addEventListener('click', () => addBallWithDelay(balls.length));
document.getElementById('removeBall').addEventListener('click', removeBall);
document.getElementById('increaseSpeed').addEventListener('click', increaseSpeed);
document.getElementById('decreaseSpeed').addEventListener('click', decreaseSpeed);

function init() {
    balls = [];
    for (let i = 0; i < ballCount; i++) {
        addBallWithDelay(i);
    }
}

function animate(currentTime) {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    time += 0.01;
    balls.forEach(ball => ball.update(currentTime));
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const color = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    return color;
}

colors.addEventListener("click", () => {
    let col = getRandomColor();
    for (let ball of balls) {
        ball.color = col;
    }
    allColor = col;
});

init();
animate();
