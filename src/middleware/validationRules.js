const { check } = require('express-validator');
const User = require('../models/userModel');

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