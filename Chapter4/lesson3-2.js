// Mendapatkan konteks WebGL
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

// Vertex shader
const vsSource = `
    attribute vec4 aPosition;
    attribute vec4 aColor;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix;
    varying lowp vec4 vColor;
    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
        vColor = aColor;
    }
`;

// Fragment shader
const fsSource = `
    varying lowp vec4 vColor;
    void main() {
        gl_FragColor = vColor;
    }
`;

// Fungsi untuk membuat shader
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    } else {
        console.error('Error compiling shader: ', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }
}

// Fungsi untuk membuat program shader
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    return program;
}

// Membuat shader dan program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// Mengatur verteks kubus
const vertices = new Float32Array([
    // Posisi            // Warna
    -0.5, -0.5, 0.5,    1.0, 0.0, 0.0,  // Depan kiri bawah
     0.5, -0.5, 0.5,    0.0, 1.0, 0.0,  // Depan kanan bawah
     0.5,  0.5, 0.5,    0.0, 0.0, 1.0,  // Depan kanan atas
    -0.5,  0.5, 0.5,    1.0, 1.0, 0.0,  // Depan kiri atas
    -0.5, -0.5, -0.5,   1.0, 0.0, 1.0,  // Belakang kiri bawah
     0.5, -0.5, -0.5,   0.0, 1.0, 1.0,  // Belakang kanan bawah
     0.5,  0.5, -0.5,   0.5, 0.5, 0.5,  // Belakang kanan atas
    -0.5,  0.5, -0.5,   0.0, 0.0, 0.0   // Belakang kiri atas
]);

const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3, // Depan
    4, 5, 6, 4, 6, 7, // Belakang
    0, 1, 5, 0, 5, 4, // Kiri
    2, 3, 7, 2, 7, 6, // Kanan
    0, 3, 7, 0, 7, 4, // Atas
    1, 2, 6, 1, 6, 5  // Bawah
]);

// Membuat buffer untuk verteks dan indeks
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// Mengikat dan mempersiapkan atribut
const positionLocation = gl.getAttribLocation(program, 'aPosition');
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.enableVertexAttribArray(positionLocation);

const colorLocation = gl.getAttribLocation(program, 'aColor');
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
gl.enableVertexAttribArray(colorLocation);

// Inisialisasi matriks perspektif
const projectionMatrix = mat4.create();
const modelViewMatrix = mat4.create();

let rotationY = 0; // Rotasi pada sumbu Y
let rotationX = 0; // Rotasi pada sumbu X
let zoomLevel = -5; // Jarak awal kamera

// Posisi kamera
let cameraPosition = [0, 0, zoomLevel];

// Mengupdate matriks perspektif
function updatePerspective() {
    const fieldOfView = 45 * Math.PI / 180; // sudut pandang dalam radian
    const aspect = canvas.clientWidth / canvas.clientHeight; // rasio lebar-tinggi
    const zNear = 0.1;  // jarak dekat
    const zFar = 100.0; // jarak jauh
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    
    // Reset model view matrix sebelum menerapkan transformasi
    mat4.identity(modelViewMatrix); // Mengatur modelViewMatrix ke identitas
    mat4.translate(modelViewMatrix, modelViewMatrix, cameraPosition); // posisi kamera
    mat4.rotateY(modelViewMatrix, modelViewMatrix, rotationY); // rotasi pada sumbu Y
    mat4.rotateX(modelViewMatrix, modelViewMatrix, rotationX); // rotasi pada sumbu X
}

// Fungsi untuk menggambar kubus
function drawScene() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    // Update perspektif dan modelView
    updatePerspective();

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uProjectionMatrix'), false, projectionMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uModelViewMatrix'), false, modelViewMatrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

// Kontrol keyboard untuk mengubah perspektif
document.addEventListener('keydown', (event) => {
    const key = event.key;

    // Mengubah rotasi berdasarkan tombol yang ditekan
    if (key === 'ArrowLeft') {
        rotationY -= 0.1; // Putar ke kiri
    } else if (key === 'ArrowRight') {
        rotationY += 0.1; // Putar ke kanan
    } else if (key === 'ArrowUp') {
        rotationX -= 0.1; // Putar ke atas
    } else if (key === 'ArrowDown') {
        rotationX += 0.1; // Putar ke bawah
    } else if (key === 'w' || key === 'W') {
        cameraPosition[2] += 0.1; // Gerak maju
    } else if (key === 's' || key === 'S') {
        cameraPosition[2] -= 0.1; // Gerak mundur
    } else if (key === 'a' || key === 'A') {
        cameraPosition[0] -= 0.1; // Gerak ke kiri
    } else if (key === 'd' || key === 'D') {
        cameraPosition[0] += 0.1; // Gerak ke kanan
    }

    drawScene(); // Gambar ulang dengan perspektif baru
});

// Menjalankan fungsi gambar pada awal
drawScene();