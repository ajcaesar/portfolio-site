const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const colors = document.getElementById("colors")
let allColor = "blue";

let balls = [];
const ballCount = 30;
let speedMultiplier = 1;

class Ball {
    constructor(x, y, radius, dx, dy, color=allColor) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.mass = radius; // Assume mass is proportional to radius
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    changeColor(color) {
        ctx.fillStyle = color;
    }

    update() {
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
                // Calculate angle of collision
                const angle = Math.atan2(dy, dx);
                
                // Calculate sin and cos of angle
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);

                // Rotate ball velocities to collision axis
                const v1 = rotate(this.dx, this.dy, sin, cos, true);
                const v2 = rotate(balls[i].dx, balls[i].dy, sin, cos, true);

                // Perform 1D collision response
                const v1Final = collisionResponse(v1, v2, this.mass, balls[i].mass);
                const v2Final = collisionResponse(v2, v1, balls[i].mass, this.mass);

                // Rotate velocities back to original axis
                const v1New = rotate(v1Final[0], v1Final[1], sin, cos, false);
                const v2New = rotate(v2Final[0], v2Final[1], sin, cos, false);

                // Update velocities
                this.dx = v1New[0];
                this.dy = v1New[1];
                balls[i].dx = v2New[0];
                balls[i].dy = v2New[1];

                // Separate balls to prevent sticking
                const overlap = 0.5 * (this.radius + balls[i].radius - distance);
                const smallerBall = this.radius < balls[i].radius ? this : balls[i];
                const largerBall = this.radius < balls[i].radius ? balls[i] : this;

                smallerBall.x += overlap * (smallerBall.x - largerBall.x) / distance;
                smallerBall.y += overlap * (smallerBall.y - largerBall.y) / distance;
                largerBall.x -= overlap * (smallerBall.x - largerBall.x) / distance;
                largerBall.y -= overlap * (smallerBall.y - largerBall.y) / distance;
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

function collisionResponse(v1, v2, m1, m2) {
    const u1 = v1[0];
    const u2 = v2[0];
    const v1Final = (u1 * (m1 - m2) + 2 * m2 * u2) / (m1 + m2);
    return [v1Final, v1[1]]; // Only return the x component for 1D collision
}

function addBall() {
    const radius = 20;
    let x = Math.random() * (canvas.width - radius * 2) + radius;
    let y = Math.random() * (canvas.height - radius * 2) + radius;
    let dx = (Math.random() - 0.5) * 4;
    let dy = (Math.random() - 0.5) * 4;

    balls.push(new Ball(x, y, radius, dx, dy));
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

document.getElementById('addBall').addEventListener('click', addBall);
document.getElementById('removeBall').addEventListener('click', removeBall);
document.getElementById('increaseSpeed').addEventListener('click', increaseSpeed);
document.getElementById('decreaseSpeed').addEventListener('click', decreaseSpeed);

function init() {
    balls = [];
    for (let i = 0; i < ballCount; i++) {
        addBall();
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    balls.forEach(ball => ball.update());
}

function getRandomColor() {
    // Generate a random number between 0 and 255 for each color component
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    // Convert the RGB values to a hexadecimal string
    const color = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');

    return color;
}

colors.addEventListener("click", () => {
    console.log("hello");
    let col = getRandomColor();
    for (let ball of balls) {
        ball.color = col;
    }
    allColor = col;
});

init();
animate();



