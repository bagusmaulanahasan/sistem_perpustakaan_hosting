const { check } = require('express-validator');
const User = require('../models/userModel'); // Dibutuhkan untuk cek duplikat email

/* * Kumpulan aturan ini kita 'exports' sebagai array.
 * Router akan menggunakannya sebagai middleware.
 */

// Aturan untuk rute registrasi
exports.registerRules = [
    
    // --- ATURAN BARU UNTUK USERNAME ---
    check('username')
        // 1. Pastikan tidak kosong (untuk handle input "")
        .notEmpty().withMessage('Username tidak boleh kosong.')

        // 2. TAMBAHKAN INI: Tolak jika diawali atau diakhiri spasi.
        // Ini akan menangani " budi", "budi ", dan " "
        .not().matches(/(^\s|\s$)/)
        .withMessage('Username tidak boleh diawali atau diakhiri spasi.')

        // 3. Aturan whitelist karakter (tetap sama)
        .matches(/^[a-zA-Z0-9_ ]+$/)
        .withMessage('Username hanya boleh berisi huruf, angka, spasi, dan underscore (_).')

        // -----------------------------------------------------------------
        // ✅ INI TAMBAHANNYA: Memeriksa jumlah huruf
        .custom(value => {
            // Menghitung jumlah huruf (a-z, A-Z)
            const letterCount = (value.match(/[a-zA-Z]/g) || []).length;
            
            if (letterCount < 2) {
                // Jika kurang dari 2, lempar error
                throw new Error('Username harus mengandung minimal 2 huruf.');
            }
            // Jika lolos, return true
            return true;
        })
        // -----------------------------------------------------------------
        
        // 4. Aturan tolok "hanya angka" (tetap sama)
        .not().matches(/^[0-9]+$/)
        .withMessage('Username tidak boleh hanya berisi angka.')

        // 5. Aturan tolok "hanya underscore" (tetap sama)
        .not().matches(/^[_]+$/)
        .withMessage('Username tidak boleh only berisi underscore.')

        // 6. PINDAHKAN INI KE AKHIR: Bersihkan string HANYA JIKA lolos semua validasi di atas.
        .trim(), // trim() sekarang menjadi sanitizer, bukan validator
        
    check('email')
        .isEmail().withMessage('Format email tidak valid.')
        .normalizeEmail()
        .custom(async (value) => {
            // Cek duplikat email langsung di sini
            const existingUser = await User.findByEmail(value);
            if (existingUser) {
                // Jika user ada, 'reject' promise ini
                return Promise.reject('Email sudah terdaftar.');
            }
        }),

    check('password')
        .isLength({ min: 6, max: 100 })
        .withMessage('Password harus memiliki 6 hingga 100 karakter.')

        // ✅ TAMBAHKAN ATURAN INI
        .isAscii()
        .withMessage('Password mengandung karakter tidak valid (seperti emoji).')

        // ✅ TAMBAHKAN BARIS INI
        .not().matches(/\s/)
        .withMessage('Password tidak boleh mengandung spasi.')

        .trim()
];

// Aturan untuk rute login
exports.loginRules = [
    check('email')
        .isEmail().withMessage('Format email tidak valid.')
        .normalizeEmail(),

    check('password')
        .notEmpty().withMessage('Password tidak boleh kosong.')

        // ✅ TAMBAHKAN ATURAN INI JUGA
        .isAscii()
        .withMessage('Password mengandung karakter tidak valid (seperti emoji).')

        // ✅ TAMBAHKAN BARIS INI JUGA
        .not().matches(/\s/)
        .withMessage('Password tidak boleh mengandung spasi.')
];