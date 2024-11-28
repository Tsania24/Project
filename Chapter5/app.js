import * as THREE from './module/three.module.js'; // Mengimpor modul Three.js

main(); // Memanggil fungsi utama

function main() {
    // --------------------
    // PART 1: INISIALISASI
    // --------------------

    // Buat konteks
    const canvas = document.querySelector("#c"); // Mengambil elemen canvas
    const gl = new THREE.WebGLRenderer({
        canvas,
        antialias: true // Mengaktifkan antialiasing untuk tampilan lebih halus
    });

    // Buat kamera
    const angleOfView = 55; // Sudut pandang kamera
    const aspectRatio = canvas.clientWidth / canvas.clientHeight; // Rasio aspek
    const nearPlane = 0.1; // Bidang dekat
    const farPlane = 100; // Bidang jauh
    const camera = new THREE.PerspectiveCamera(
        angleOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    camera.position.set(0, 5, 25); // Posisi kamera

    // Buat scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0.2, 0.4, 0.6); // Mengubah warna latar belakang
    const fog = new THREE.Fog("lightblue", 1, 100); // Mengatur kabut
    scene.fog = fog; // Menambahkan kabut ke scene

    // --------------------
    // PART 2: GEOMETRI DAN MATERIAL
    // --------------------

    // GEOMETRY
    // Buat kubus
    const cubeSize = 4; // Ukuran kubus
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    // Buat bola
    const sphereRadius = 3; // Jari-jari bola
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 16);

    // Buat bidang
    const planeWidth = 256; // Lebar bidang
    const planeHeight = 256; // Tinggi bidang
    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    // MATERIALS
    const textureLoader = new THREE.TextureLoader(); // Memuat tekstur

    // Material kubus dengan tekstur
    const cubeTextureMap = textureLoader.load('image/kotak_texture.jpeg'); // Ganti dengan jalur ke tekstur kubus
    const cubeMaterial = new THREE.MeshStandardMaterial({
        map: cubeTextureMap // Menambahkan tekstur ke kubus
    });

    // Material bola dengan normal map
    const sphereNormalMap = textureLoader.load('image/texture_kertas.jpeg'); // Memuat normal map
    sphereNormalMap.wrapS = THREE.RepeatWrapping; // Mengatur pembungkusan
    sphereNormalMap.wrapT = THREE.RepeatWrapping; // Mengatur pembungkusan
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 'coral', // Mengubah warna bola
        normalMap: sphereNormalMap // Menambahkan normal map
    });

    // Material bidang dengan tekstur dan normal map
    const planeTextureMap = textureLoader.load('image/pebble.jpeg'); // Memuat tekstur bidang
    planeTextureMap.wrapS = THREE.RepeatWrapping; // Mengatur pembungkusan
    planeTextureMap.wrapT = THREE.RepeatWrapping; // Mengatur pembungkusan
    planeTextureMap.repeat.set(16, 16); // Mengatur pengulangan
    const planeNorm = textureLoader.load('image/normal-map.jpg'); // Memuat normal map untuk bidang
    planeNorm.wrapS = THREE.RepeatWrapping; // Mengatur pembungkusan
    planeNorm.wrapT = THREE.RepeatWrapping; // Mengatur pembungkusan
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: planeTextureMap, // Menambahkan tekstur
        side: THREE.DoubleSide, // Mengatur kedua sisi
        normalMap: planeNorm // Menambahkan normal map
    });

    // MESHES
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial); // Menggabungkan geometris dan material
    cube.position.set(2, 10, 0); // Posisi kubus
    scene.add(cube); // Menambahkan kubus ke scene

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial); // Menggabungkan geometris dan material untuk bola
    sphere.position.set(-sphereRadius - 2, 5, 0); // Posisi bola
    scene.add(sphere); // Menambahkan bola ke scene

    const plane = new THREE.Mesh(planeGeometry, planeMaterial); // Menggabungkan geometris dan material untuk bidang
    plane.rotation.x = -Math.PI / 2; // Memutar bidang 90 derajat
    scene.add(plane); // Menambahkan bidang ke scene

    // --------------------
    // PART 3: ANIMASI DAN RENDER
    // --------------------

    // LIGHTS
    const color = 0xffffff; // Warna cahaya
    const intensity = 1; // Mengubah intensitas cahaya
    const light = new THREE.DirectionalLight(color, intensity); // Membuat cahaya arah
    light.position.set(5, 30, 30); // Mengubah posisi cahaya
    scene.add(light); // Menambahkan cahaya ke scene

    const ambientColor = 0xffffff; // Warna cahaya ambient
    const ambientIntensity = 0.3; // Mengubah intensitas cahaya ambient
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity); // Membuat cahaya ambient
    scene.add(ambientLight); // Menambahkan cahaya ambient ke scene

    // DRAW
    function draw(time) {
        time *= 0.001; // Mengubah waktu menjadi detik

        if (resizeGLToDisplaySize(gl)) { // Memeriksa apakah ukuran harus diubah
            const canvas = gl.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight; // Memperbarui rasio aspek
            camera.updateProjectionMatrix(); // Memperbarui matriks proyeksi
        }
        
        // Rotasi kubus
        cube.rotation.x += 0.02; // Mengubah kecepatan rotasi kubus
        cube.rotation.y += 0.02; // Mengubah kecepatan rotasi kubus

        // Rotasi bola
        sphere.rotation.x += 0.02; // Mengubah kecepatan rotasi bola
        sphere.rotation.y += 0.02; // Mengubah kecepatan rotasi bola

        // Menggerakkan cahaya
        light.position.x = 20 * Math.cos(time); 
        light.position.y = 20 * Math.sin(time); 
        gl.render(scene, camera); // Menggambar scene
        requestAnimationFrame(draw); // Meminta frame berikutnya
    }

    requestAnimationFrame(draw); // Memulai animasi

    // UPDATE RESIZE
    function resizeGLToDisplaySize(gl) {
        const canvas = gl.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height; // Memeriksa apakah perlu mengubah ukuran
        if (needResize) {
            gl.setSize(width, height, false); // Mengatur ukuran canvas
        }
        return needResize; // Mengembalikan status perubahan ukuran
    }
}