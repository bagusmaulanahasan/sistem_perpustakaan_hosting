const { check } = require('express-validator');
const User = require('../models/userModel');
const Book = require('../models/bookModel'); // <-- PERBAIKAN 1: INI WAJIB ADA

// --- ATURAN DASAR (untuk dipakai ulang) ---
// Aturan dasar untuk username (Ini sudah benar)
const usernameRules = check('username')
    .notEmpty().withMessage('Username tidak boleh kosong.')
    .not().matches(/(^\s|\s$)/).withMessage('Username tidak boleh diawali atau diakhiri spasi.')
    .matches(/^[a-zA-Z0-9_ ]+$/).withMessage('Username hanya boleh berisi huruf, angka, spasi, dan underscore (_).')
    .custom(value => {
        const letterCount = (value.match(/[a-zA-Z]/g) || []).length;
        if (letterCount < 2) {
            throw new Error('Username harus mengandung minimal 2 huruf.');
        }
        return true;
    })
    .not().matches(/^[0-9]+$/).withMessage('Username tidak boleh hanya berisi angka.')
    .not().matches(/^[_]+$/).withMessage('Username tidak boleh hanya berisi underscore.')
    .trim();

// --- ATURAN UNTUK REGISTRASI ---
exports.registerRules = [
    usernameRules, // Pakai ulang aturan username

    check('email')
        .isEmail().withMessage('Format email tidak valid.')
        .normalizeEmail()
        .custom(async (value) => {
            const existingUser = await User.findByEmail(value);
            if (existingUser) {
                return Promise.reject('Email sudah terdaftar.');
            }
        }),

    // INI YANG DIPERBAIKI: Aturan khusus untuk 'password' saat registrasi
    check('password')
        .isLength({ min: 6, max: 100 })
        .withMessage('Password harus memiliki 6 hingga 100 karakter.')
        .isAscii()
        .withMessage('Password mengandung karakter tidak valid (seperti emoji).')
        .not().matches(/\s/)
        .withMessage('Password tidak boleh mengandung spasi.')
        .trim(),
    
    // Aturan untuk 'confirmPassword' saat registrasi
    check('confirmPassword')
        .notEmpty().withMessage('Konfirmasi password tidak boleh kosong.')
        .custom((value, { req }) => {
            if (value !== req.body.password) { // Cocokkan dengan 'password'
                throw new Error('Password dan Konfirmasi Password tidak cocok.');
            }
            return true;
        })
];

// --- ATURAN UNTUK LOGIN (YANG HILANG) ---
exports.loginRules = [
    check('email')
        .isEmail().withMessage('Format email tidak valid.')
        .normalizeEmail(),

    check('password')
        .notEmpty().withMessage('Password tidak boleh kosong.')
        .isAscii().withMessage('Password mengandung karakter tidak valid (seperti emoji).')
        .not().matches(/\s/)
        .withMessage('Password tidak boleh mengandung spasi.')
];

// --- ATURAN UNTUK UPDATE PROFIL ---
exports.updateProfileRules = [
    usernameRules, // Pakai ulang aturan username

    check('email')
        .isEmail().withMessage('Format email tidak valid.')
        .normalizeEmail()
        .custom(async (value, { req }) => {
            const existingUser = await User.findByEmail(value);
            // Boleh jika email itu milik kita sendiri
            if (existingUser && existingUser.id !== req.session.user.id) {
                return Promise.reject('Email sudah digunakan oleh akun lain.');
            }
        })
];

// --- ATURAN UNTUK GANTI PASSWORD ---
exports.changePasswordRules = [
    // Aturan khusus untuk 'newPassword'
    check('newPassword')
        .isLength({ min: 6, max: 100 }).withMessage('Password baru minimal harus 6 karakter (maks 100).')
        .isAscii().withMessage('Password baru mengandung karakter tidak valid (seperti emoji).')
        .not().matches(/\s/).withMessage('Password baru tidak boleh mengandung spasi.')
        .trim(),
    
    // Aturan untuk 'confirmPassword' saat ganti password
    check('confirmPassword')
        .notEmpty().withMessage('Konfirmasi password tidak boleh kosong.')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) { // Cocokkan dengan 'newPassword'
                throw new Error('Password baru tidak cocok dengan konfirmasi.');
            }
            return true;
        })
];

// --- ATURAN BARU UNTUK BUKU ---
// exports.bookValidationRules = [
//     // Aturan untuk Judul (Title) - Wajib
//     check('title')
//         .notEmpty().withMessage('Judul tidak boleh kosong.')
//         .not().matches(/(^\s|\s$)/).withMessage('Judul tidak boleh diawali atau diakhiri spasi.')
        
//         // UBAH BAGIAN INI: Tambahkan aturan untuk tidak boleh diawali titik
//         .not().matches(/^\./).withMessage('Judul tidak boleh diawali dengan titik (.).')

//         // UBAH BAGIAN INI: Izinkan titik (.) di dalam regex whitelist
//         .matches(/^[a-zA-Z0-9. ]+$/).withMessage('Judul hanya boleh berisi huruf, angka, spasi, dan titik (.).')
        
//         .custom(value => (value.match(/[a-zA-Z]/g) || []).length >= 2).withMessage('Judul harus mengandung minimal 2 huruf.')
        
//         // UBAH BAGIAN INI: Update aturan "hanya" untuk menyertakan titik
//         .not().matches(/^[0-9. ]+$/).withMessage('Judul tidak boleh hanya berisi angka, spasi, dan titik.')
        
//         .trim(),

//     // Aturan untuk Penulis (Author) - Wajib
//     check('author')
//         .notEmpty().withMessage('Penulis tidak boleh kosong.')
//         .not().matches(/(^\s|\s$)/).withMessage('Penulis tidak boleh diawali atau diakhiri spasi.')

//         // UBAH BAGIAN INI: Tambahkan aturan untuk tidak boleh diawali titik
//         .not().matches(/^\./).withMessage('Penulis tidak boleh diawali dengan titik (.).')
        
//         // UBAH BAGIAN INI: Izinkan titik (.) di dalam regex whitelist
//         .matches(/^[a-zA-Z0-9. ]+$/).withMessage('Penulis hanya boleh berisi huruf, angka, spasi, dan titik (.).')
        
//         .custom(value => (value.match(/[a-zA-Z]/g) || []).length >= 2).withMessage('Penulis harus mengandung minimal 2 huruf.')
        
//         // UBAH BAGIAN INI: Update aturan "hanya" untuk menyertakan titik
//         .not().matches(/^[0-9. ]+$/).withMessage('Penulis tidak boleh hanya berisi angka, spasi, dan titik.')
        
//         .trim(),

//     // Aturan untuk Penerbit (Publisher) - Opsional
//     check('publisher')
//         .optional({ checkFalsy: true }) // Boleh kosong atau null
//         .not().matches(/(^\s|\s$)/).withMessage('Penerbit tidak boleh diawali atau diakhiri spasi.')

//         // UBAH BAGIAN INI: Tambahkan aturan untuk tidak boleh diawali titik
//         .not().matches(/^\./).withMessage('Penerbit tidak boleh diawali dengan titik (.).')
        
//         // Hanya jalankan validasi sisa JIKA tidak kosong
//         .if(check('publisher').notEmpty()) 

//         // UBAH BAGIAN INI: Izinkan titik (.) di dalam regex whitelist
//         .matches(/^[a-zA-Z0-9. ]+$/).withMessage('Penerbit hanya boleh berisi huruf, angka, spasi, dan titik (.).')
        
//         .custom(value => (value.match(/[a-zA-Z]/g) || []).length >= 2).withMessage('Penerbit harus mengandung minimal 2 huruf.')
        
//         // UBAH BAGIAN INI: Update aturan "hanya" untuk menyertakan titik
//         .not().matches(/^[0-9. ]+$/).withMessage('Penerbit tidak boleh hanya berisi angka, spasi, dan titik.')
        
//         .trim()
// ];

// --- ATURAN BARU UNTUK BUKU (UPDATED) ---
exports.bookValidationRules = [
    // Aturan untuk Judul (Title) - Wajib
    check('title')
        .notEmpty().withMessage('Judul tidak boleh kosong.')
        .not().matches(/(^\s|\s$)/).withMessage('Judul tidak boleh diawali atau diakhiri spasi.')
        
        // Aturan Regex spesifik Anda (TIDAK DIHAPUS)
        .not().matches(/^\./).withMessage('Judul tidak boleh diawali dengan titik (.).')
        .matches(/^[a-zA-Z0-9. ]+$/).withMessage('Judul hanya boleh berisi huruf, angka, spasi, dan titik (.).')
        .custom(value => (value.match(/[a-zA-Z]/g) || []).length >= 2).withMessage('Judul harus mengandung minimal 2 huruf.')
        .not().matches(/^[0-9. ]+$/).withMessage('Judul tidak boleh hanya berisi angka, spasi, dan titik.')
        
        .trim()

        // 2. PENGECEKAN DUPLIKAT DITAMBAHKAN DI SINI
        .custom(async (value, { req }) => {
            // req.params.id akan ada nilainya jika ini adalah proses UPDATE/EDIT
            // Jika CREATE, req.params.id nilainya undefined (aman)
            const existingBook = await Book.findByTitle(value, req.params.id);
            
            if (existingBook) {
                throw new Error('Judul buku sudah terdaftar. Harap gunakan judul lain.');
            }
            return true;
        }),

    // Aturan untuk Penulis (Author) - Wajib (TIDAK BERUBAH)
    check('author')
        .notEmpty().withMessage('Penulis tidak boleh kosong.')
        .not().matches(/(^\s|\s$)/).withMessage('Penulis tidak boleh diawali atau diakhiri spasi.')
        .not().matches(/^\./).withMessage('Penulis tidak boleh diawali dengan titik (.).')
        .matches(/^[a-zA-Z0-9. ]+$/).withMessage('Penulis hanya boleh berisi huruf, angka, spasi, dan titik (.).')
        .custom(value => (value.match(/[a-zA-Z]/g) || []).length >= 2).withMessage('Penulis harus mengandung minimal 2 huruf.')
        .not().matches(/^[0-9. ]+$/).withMessage('Penulis tidak boleh hanya berisi angka, spasi, dan titik.')
        .trim(),

    // Aturan untuk Penerbit (Publisher) - Opsional (TIDAK BERUBAH)
    check('publisher')
        .optional({ checkFalsy: true }) 
        .not().matches(/(^\s|\s$)/).withMessage('Penerbit tidak boleh diawali atau diakhiri spasi.')
        .not().matches(/^\./).withMessage('Penerbit tidak boleh diawali dengan titik (.).')
        .if(check('publisher').notEmpty()) 
        .matches(/^[a-zA-Z0-9. ]+$/).withMessage('Penerbit hanya boleh berisi huruf, angka, spasi, dan titik (.).')
        .custom(value => (value.match(/[a-zA-Z]/g) || []).length >= 2).withMessage('Penerbit harus mengandung minimal 2 huruf.')
        .not().matches(/^[0-9. ]+$/).withMessage('Penerbit tidak boleh hanya berisi angka, spasi, dan titik.')
        .trim()
];