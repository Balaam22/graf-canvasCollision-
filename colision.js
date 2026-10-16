const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Dimensiones del canvas
const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;

// 1. Cargar la imagen de fondo bugatti.jpg
let bgImage = new Image();
bgImage.src = 'bugatti.jpg';
let imageLoaded = false;

bgImage.onload = function() {
    imageLoaded = true;
};

// Función para dibujar el fondo (imagen o respaldo con color si aún no carga)
function drawBackground() {
    if (imageLoaded) {
        ctx.drawImage(bgImage, 0, 0, window_width, window_height);
    } else {
        ctx.fillStyle = "#222222";
        ctx.fillRect(0, 0, window_width, window_height);
    }
}

// Variables globales del juego
let score = 0; // Contador de objetos eliminados

// Clase Triangle (Triángulo interactivo con caída libre, rebote y rotación)
class Triangle {
    constructor(size, initialSpawn = false) {
        this.size = size;
        this.radius = size; // Radio para detección de colisión con clic del mouse
        this.resetPosition(initialSpawn);
        
        // Color aleatorio vibrante para el triángulo
        this.color = `hsl(${Math.random() * 360}, 85%, 55%)`;
        this.angle = Math.random() * Math.PI * 2; // Ángulo inicial de rotación
        this.rotationSpeed = (Math.random() - 0.5) * 0.05; // Velocidad de giro
    }

    // Reiniciar posición en la parte superior con distribución en altura
    resetPosition(initialSpawn = false) {
        this.posX = Math.random() * (window_width - this.size * 2) + this.size;
        
        // Si es el inicio del juego, se distribuyen en una franja amplia arriba para evitar espacios en blanco
        if (initialSpawn) {
            this.posY = -Math.random() * window_height - this.size;
        } else {
            this.posY = -this.size - Math.random() * 150;
        }

        this.vx = (Math.random() - 0.5) * 2; // Ligera deriva horizontal
        this.vy = Math.random() * 2; // Velocidad inicial vertical
        this.bounceFactor = 0.68; // Factor de rebote (pérdida de energía)
    }

    // Dibujar el triángulo
    draw(context) {
        context.save();
        context.translate(this.posX, this.posY);
        context.rotate(this.angle);

        context.beginPath();
        // Vértices de un triángulo equilátero respecto al centro
        context.moveTo(0, -this.size);
        context.lineTo(this.size * 0.866, this.size * 0.5);
        context.lineTo(-this.size * 0.866, this.size * 0.5);
        context.closePath();

        context.fillStyle = this.color;
        context.fill();

        context.lineWidth = 2;
        context.strokeStyle = "#ffffff";
        context.stroke();

        context.restore();
    }

    // Actualizar física (Caída libre y rebote en parábola)
    update(context, gravity) {
        // Aplicar gravedad y rotación
        this.vy += gravity;
        this.angle += this.rotationSpeed;

        // Actualizar posiciones
        this.posX += this.vx;
        this.posY += this.vy;

        // Rebote en bordes laterales
        if (this.posX + this.size > window_width || this.posX - this.size < 0) {
            this.vx = -this.vx;
        }

        // Rebote en el suelo (borde inferior)
        if (this.posY + this.size >= window_height) {
            this.posY = window_height - this.size; // Ajuste de posición
            this.vy = -this.vy * this.bounceFactor; // Invertir dirección y amortiguar
            this.vx *= 0.95; // Fricción horizontal en el suelo

            // Si perdió la energía suficiente tras rebotar, reaparece arriba
            if (Math.abs(this.vy) < 1.5) {
                this.resetPosition(false);
            }
        }

        this.draw(context);
    }

    // Comprobar clic del ratón dentro del radio del triángulo
    isClicked(mouseX, mouseY) {
        let dx = mouseX - this.posX;
        let dy = mouseY - this.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.radius;
    }
}

// Crear arreglo de 25 triángulos[cite: 9]
let triangles = [];
function initTriangles(n) {
    triangles = [];
    for (let i = 0; i < n; i++) {
        let size = Math.random() * 12 + 20; // Tamaño entre 20 y 32
        triangles.push(new Triangle(size, true));
    }
}

// Dibujar marcador de eliminaciones en la esquina superior derecha[cite: 9]
function drawScore() {
    ctx.fillStyle = "#ffffff"; // Color blanco para destacar sobre la imagen de fondo
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "right";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)"; // Sombra para mejor legibilidad
    ctx.shadowBlur = 6;
    ctx.fillText(`Eliminadas: ${score}`, window_width - 30, 40);
    ctx.shadowBlur = 0; // Limpiar sombra
}

// Ajustar gravedad según el marcador de eliminados (Reglas de velocidad)[cite: 9]
function getGravity() {
    if (score > 20) {
        return 0.5; // Velocidad alta (Contador > 20)[cite: 9]
    } else if (score > 10) {
        return 0.35; // Velocidad media (Contador > 10)[cite: 9]
    }
    return 0.2; // Velocidad inicial predefinida[cite: 9]
}

// Evento de clic con el mouse para eliminar objetos y sumarlos al contador[cite: 8, 9]
canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Detectar clic en el triángulo más cercano/superior
    for (let i = triangles.length - 1; i >= 0; i--) {
        if (triangles[i].isClicked(mouseX, mouseY)) {
            score++; // Incrementar marcador[cite: 9]
            triangles[i].resetPosition(false); // Vuelve a subir para caer inmediatamente
            break; // Eliminar solo un triángulo por clic
        }
    }
});

// Bucle de animación
function animate() {
    drawBackground();

    let currentGravity = getGravity();

    // Actualizar y dibujar cada triángulo
    triangles.forEach(triangle => {
        triangle.update(ctx, currentGravity);
    });

    drawScore();

    requestAnimationFrame(animate);
}

// Inicializar 25 triángulos y comenzar la animación[cite: 9]
initTriangles(25);
animate();