var VRButton = {
    // Fungsi createButton akan membuat tombol untuk memulai sesi XR
    createButton: function(gl, options) {
        
        // Jika ada opsi yang diberikan, dan ada referenceSpaceType, maka atur referenceSpaceType
        if (options && options.referenceSpaceType) {
            gl.xr.setReferenceSpaceType(options.referenceSpaceType); // Mengatur tipe ruang referensi (misalnya 'local-floor' atau 'bounded-floor')
        }

        // Membuat tombol HTML untuk memasuki XR
        var button = document.createElement('button');
        button.innerHTML = 'Enter XR'; // Teks pada tombol
        button.style.position = 'absolute'; // Memposisikan tombol di halaman secara absolut
        button.style.bottom = '20px'; // Jarak 20px dari bagian bawah layar
        button.style.left = '20px'; // Jarak 20px dari kiri layar
        button.style.padding = '12px 24px'; // Padding dalam tombol untuk tampilan yang lebih baik
        button.style.fontSize = '16px'; // Ukuran teks tombol
        document.body.appendChild(button); // Menambahkan tombol ke body halaman

        // Variabel untuk menyimpan sesi XR saat ini, diinisialisasi dengan null (tidak ada sesi)
        var currentSession = null;

        // Fungsi dipanggil ketika sesi XR dimulai
        function onSessionStarted(session) {
            // Menambahkan event listener untuk mengakhiri sesi ketika selesai
            session.addEventListener('end', onSessionEnded);
            // Mengatur sesi aktif di WebGL XR
            gl.xr.setSession(session);
            // Mengubah teks tombol menjadi "Exit XR" ketika sesi dimulai
            button.textContent = 'Exit XR';
            // Menyimpan referensi sesi XR yang aktif
            currentSession = session;
        }

        // Fungsi dipanggil ketika sesi XR berakhir
        function onSessionEnded() {
            // Menghapus event listener agar tidak terjadi kebocoran memori
            currentSession.removeEventListener('end', onSessionEnded);
            // Mengubah teks tombol kembali menjadi "Enter XR" saat sesi berakhir
            button.textContent = 'Enter XR';
            // Mengatur kembali currentSession menjadi null untuk menandakan tidak ada sesi aktif
            currentSession = null;
        }

        // Event handler untuk tombol ketika diklik
        button.onclick = function() {
            // Jika tidak ada sesi XR yang aktif (currentSession = null), maka memulai sesi baru
            if (currentSession === null) {
                // Menyiapkan parameter sesi XR (misalnya menggunakan 'local-floor' atau 'bounded-floor')
                let sessionInit = { optionalFeatures: ["local-floor", "bounded-floor"] };
                // Meminta sesi XR immersive-vr melalui API WebXR
                navigator.xr.requestSession('immersive-vr', sessionInit).then(onSessionStarted);
            } else {
                // Jika sesi sudah aktif, mengakhiri sesi
                currentSession.end();
            }
        };

        // Fungsi untuk menangani kasus di mana XR tidak didukung oleh browser
        function NotFound() {
            console.log("XR session not supported."); // Menampilkan pesan di konsol
        }

        // Mengecek apakah browser mendukung WebXR
        if (navigator.xr) {
            // Mengecek apakah sesi 'immersive-vr' didukung
            navigator.xr.isSessionSupported('immersive-vr')
                .then(function(supported) {
                    if (supported) {
                        // Jika didukung, tombol akan tetap tampil (dapat dimodifikasi untuk menambahkan logika tambahan jika diperlukan)
                    } else {
                        // Jika tidak didukung, panggil fungsi NotFound
                        NotFound();
                    }
                })
                .catch(function(error) {
                    // Jika ada kesalahan saat memeriksa dukungan XR, tampilkan pesan error di konsol
                    console.error("Error checking XR support:", error);
                });
        } else {
            // Jika WebXR tidak didukung oleh browser
            console.warn("WebXR not supported in this browser.");
        }

        // Mengembalikan tombol yang telah dibuat
        return button;
    }
};

export { VRButton };
