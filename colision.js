const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.originalColor = color; // Guardamos el color original para el efecto de flash
        this.text = text;
        this.speed = speed;
        // Asignamos dirección aleatoria inicial en X y Y
        this.dx = (Math.random() < 0.5 ? 1 : -1) * this.speed;
        this.dy = (Math.random() < 0.5 ? 1 : -1) * this.speed;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context) {
        // Actualizar la posición X
        this.posX += this.dx;
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }

        // Actualizar la posición Y
        this.posY += this.dy;
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }

        this.draw(context);
        
        // Regresamos al color original para el siguiente frame (el flash dura solo el impacto)
        this.color = this.originalColor;
    }
}

// Crear un array para almacenar N círculos
let circles = [];

// Función para generar círculos aleatorios
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;
        let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Color aleatorio
        let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5 unidades
        let text = `C${i + 1}`; // Etiqueta del círculo
        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

// Función para detectar colisiones, aplicar rebote y efecto de flash azul
function checkCollisions() {
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            let c1 = circles[i];
            let c2 = circles[j];

            // Distancia entre los centros (Fórmula del inciso A)[cite: 2, 4]
            let dx = c2.posX - c1.posX;
            let dy = c2.posY - c1.posY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Si hay colisión
            if (distance < c1.radius + c2.radius) {
                // 1. Efecto de "flash" en color azul (#0000FF)[cite: 4]
                c1.color = "#0000FF";
                c2.color = "#0000FF";

                // 2. Rebote en dirección contraria (intercambio de velocidades)[cite: 4]
                let tempDx = c1.dx;
                let tempDy = c1.dy;
                c1.dx = c2.dx;
                c1.dy = c2.dy;
                c2.dx = tempDx;
                c2.dy = tempDy;

                // 3. Corrección de superposición para evitar que se queden pegados
                let overlap = (c1.radius + c2.radius) - distance;
                let nx = dx / distance;
                let ny = dy / distance;
                
                c1.posX -= nx * overlap * 0.5;
                c1.posY -= ny * overlap * 0.5;
                c2.posX += nx * overlap * 0.5;
                c2.posY += ny * overlap * 0.5;
            }
        }
    }
}

// Función para animar los círculos
function animate() {
    ctx.clearRect(0, 0, window_width, window_height); // Limpiar el canvas

    // Primero verificamos colisiones (cambia el color a azul y ajusta vectores)
    checkCollisions();

    // Después actualizamos y dibujamos cada círculo
    circles.forEach(circle => {
        circle.update(ctx); 
    });

    requestAnimationFrame(animate); // Repetir la animación
}

// Generar 20 círculos y comenzar la animación[cite: 4]
generateCircles(20); 
animate();