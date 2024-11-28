import * as THREE from './three.module.js';
import { VRButton } from './VRButton.js';

// Deklarasi variabel global yang digunakan dalam aplikasi 3D
var gl, cube, sphere, light, camera, scene;

// Memanggil fungsi inisialisasi dan animasi
init();
animate();

function init() {
    // Membuat konteks WebGLRenderer
    gl = new THREE.WebGLRenderer({ antialias: true }); // Mengaktifkan antialiasing untuk kualitas rendering lebih halus
    gl.setPixelRatio(window.devicePixelRatio); // Menyesuaikan dengan pixel ratio perangkat
    gl.setSize(window.innerWidth, window.innerHeight); // Mengatur ukuran kanvas sesuai ukuran jendela
    gl.outputEncoding = THREE.sRGBEncoding; // Menggunakan encoding warna sRGB untuk rendering warna lebih akurat
    gl.xr.enabled = true; // Mengaktifkan mode XR (untuk VR)
    document.body.appendChild(gl.domElement); // Menambahkan elemen kanvas ke dalam dokumen HTML
    document.body.appendChild(VRButton.createButton(gl)); // Menambahkan tombol VR untuk memulai sesi XR

    // Membuat kamera dengan perspektif
    const angleOfView = 55; // Sudut pandang kamera (field of view)
    const aspectRatio = window.innerWidth / window.innerHeight; // Rasio aspek kamera (lebar/tinggi)
    const nearPlane = 0.1; // Jarak terdekat dari kamera ke objek yang akan dirender
    const farPlane = 1000; // Jarak terjauh dari kamera ke objek yang akan dirender
    camera = new THREE.PerspectiveCamera(angleOfView, aspectRatio, nearPlane, farPlane); // Membuat kamera perspektif
    camera.position.set(0, 8, 30); // Mengatur posisi kamera di koordinat (x, y, z)

    // Membuat adegan (scene) dan menambahkan latar belakang warna serta kabut
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.3, 0.5, 0.8); // Mengatur warna latar belakang
    const fog = new THREE.Fog("grey", 1, 90); // Mengatur efek kabut (fog) untuk kedalaman
    scene.fog = fog; // Menambahkan efek kabut ke adegan

    // GEOMETRI
    // Membuat kubus
    const cubeSize = 4;
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize); // Membuat geometri kubus

    // Membuat bola
    const sphereRadius = 3;
    const sphereWidthSegments = 32;
    const sphereHeightSegments = 16;
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, sphereWidthSegments, sphereHeightSegments); // Membuat geometri bola

    // Membuat bidang datar (plane)
    const planeWidth = 256;
    const planeHeight = 128;
    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight); // Membuat geometri bidang datar

    // MATERIALS
    const textureLoader = new THREE.TextureLoader(); // Loader untuk memuat tekstur

    // Material untuk kubus
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 'pink' }); // Membuat material kubus dengan warna merah muda

    // Material untuk bola dengan normal map
    const sphereNormalMap = textureLoader.load('textures/cement.jpg'); // Memuat tekstur normal map
    sphereNormalMap.wrapS = THREE.RepeatWrapping; // Mengatur agar tekstur diulang secara horizontal
    sphereNormalMap.wrapT = THREE.RepeatWrapping; // Mengatur agar tekstur diulang secara vertikal
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 'tan',
        normalMap: sphereNormalMap
    }); // Membuat material bola dengan tekstur normal map

    // Material untuk bidang datar
    const planeTextureMap = textureLoader.load('textures/cement.jpg'); // Memuat tekstur untuk bidang datar
    planeTextureMap.wrapS = THREE.RepeatWrapping; // Mengulang tekstur secara horizontal
    planeTextureMap.wrapT = THREE.RepeatWrapping; // Mengulang tekstur secara vertikal
    planeTextureMap.repeat.set(16, 16); // Mengatur pengulangan tekstur pada bidang datar
    planeTextureMap.minFilter = THREE.NearestFilter; // Mengatur filter tekstur
    planeTextureMap.anisotropy = gl.capabilities.getMaxAnisotropy(); // Menggunakan anisotropi untuk meningkatkan kualitas tekstur

    const planeNorm = textureLoader.load('textures/cement.jpg'); // Memuat tekstur normal untuk bidang
    planeNorm.wrapS = THREE.RepeatWrapping;
    planeNorm.wrapT = THREE.RepeatWrapping;
    planeNorm.minFilter = THREE.NearestFilter;
    planeNorm.repeat.set(16, 16);

    const planeMaterial = new THREE.MeshStandardMaterial({
        map: planeTextureMap,
        side: THREE.DoubleSide, // Material diterapkan di kedua sisi bidang
        normalMap: planeNorm
    });

    // MESHES
    // Menambahkan kubus ke adegan
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(cubeSize + 1, cubeSize + 1, 0); // Mengatur posisi kubus
    scene.add(cube); // Menambahkan kubus ke adegan

    // Menambahkan bola ke adegan
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-sphereRadius - 1, sphereRadius + 2, 0); // Mengatur posisi bola
    scene.add(sphere); // Menambahkan bola ke adegan

    // Menambahkan bidang datar ke adegan
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2; // Memutar bidang agar tegak lurus
    scene.add(plane); // Menambahkan bidang ke adegan

    // LIGHTS
    // Menambahkan cahaya directional
    const color = 0xffffff;
    const intensity = 0.7;
    light = new THREE.DirectionalLight(color, intensity); // Membuat cahaya directional
    light.target = plane; // Mengatur target cahaya ke bidang datar
    light.position.set(0, 30, 30); // Mengatur posisi cahaya
    scene.add(light); // Menambahkan cahaya ke adegan
    scene.add(light.target); // Menambahkan target cahaya ke adegan

    // Menambahkan cahaya ambient
    const ambientColor = 0xffffff;
    const ambientIntensity = 0.2;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity); // Membuat cahaya ambient
    scene.add(ambientLight); // Menambahkan cahaya ambient ke adegan
}

function animate() {
    // Loop animasi untuk merender setiap frame
    gl.setAnimationLoop(() => {
        resizeDisplay(); // Memeriksa apakah ukuran jendela berubah
        render(); // Merender adegan
    });
}

function render() {
    // Memutar kubus dan bola
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube.rotation.z += 0.01;
    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;

    // Menggerakkan posisi cahaya berdasarkan waktu
    light.position.x = 20 * Math.cos(performance.now() * 0.001);
    light.position.y = 20 * Math.sin(performance.now() * 0.001);

    // Merender adegan dengan kamera
    gl.render(scene, camera);
}

function resizeDisplay() {
    // Memastikan ukuran tampilan kanvas sesuai dengan ukuran jendela
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        gl.setSize(width, height, false); // Mengatur ukuran kanvas
        camera.aspect = width / height; // Memperbarui rasio aspek kamera
        camera.updateProjectionMatrix(); // Memperbarui matriks proyeksi kamera
    }
}
