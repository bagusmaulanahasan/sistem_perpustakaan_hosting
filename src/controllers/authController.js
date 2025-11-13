const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
// 1. PASTIKAN ANDA IMPORT 'validationResult'
const { validationResult } = require("express-validator");

exports.getRegisterPage = (req, res) => {
    res.render("register", {
        title: "Register",
        layout: "./layouts/auth",
        error: null,
        errors: [], // Kirim array kosong agar EJS tidak error
        oldInput: { username: "", email: "" } // Kirim data lama kosong
    });
};

exports.postRegister = async (req, res) => {
    // 2. CEK HASIL VALIDASI DARI MIDDLEWARE
    const errors = validationResult(req);
    const { username, email, password } = req.body;

    // 3. JIKA ADA ERROR, KEMBALIKAN KE HALAMAN REGISTER
    if (!errors.isEmpty()) {
        return res.status(422).render("register", {
            title: "Register",
            layout: "./layouts/auth",
            error: errors.array()[0].msg, // Ambil error pertama (opsional)
            errors: errors.array(),      // Kirim semua error
            oldInput: { username: username, email: email } // Kirim input lama
        });
    }

    // 4. JIKA LOLOS, LANJUTKAN (cek manual sudah tidak perlu)
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        await User.create(username, email, hashedPassword);
        res.redirect("/login?success=registrasi");
    } catch (error) {
        console.error(error);
        res.render("register", {
            title: "Register",
            layout: "./layouts/auth",
            error: "Terjadi kesalahan pada server.",
            errors: [], // Tetap kirim ini
            oldInput: { username, email } // Kirim data lama
        });
    }
};

exports.getLoginPage = (req, res) => {
    const successMessage =
        req.query.success === "registrasi"
            ? "Registrasi berhasil! Silakan login."
            : null;
    res.render("login", {
        title: "Login",
        layout: "./layouts/auth",
        error: null,
        errors: [], // Tambahkan ini
        oldInput: { email: "" }, // Tambahkan ini
        success: successMessage,
    });
};

exports.postLogin = async (req, res) => {
    // 1. CEK HASIL VALIDASI LOGIN
    const errors = validationResult(req);
    const { email, password } = req.body;

    const successMessage =
        req.query.success === "registrasi"
            ? "Registrasi berhasil! Silakan login."
            : null;

    // 2. JIKA ADA ERROR (misal format email salah / password kosong)
    if (!errors.isEmpty()) {
        return res.status(422).render("login", {
            title: "Login",
            layout: "./layouts/auth",
            error: errors.array()[0].msg,
            errors: errors.array(),
            oldInput: { email: email },
            success: successMessage,
        });
    }

    // 3. LANJUTKAN LOGIKA LOGIN (cek ke database)
    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.render("login", {
                title: "Login",
                layout: "./layouts/auth",
                error: "Email atau password salah.",
                errors: [],
                oldInput: { email: email },
                success: successMessage,
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", {
                title: "Login",
                layout: "./layouts/auth",
                error: "Email atau password salah.",
                errors: [],
                oldInput: { email: email },
                success: successMessage,
            });
        }

        req.session.isLoggedIn = true;
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        return res.redirect("/books"); // Asumsi redirect ke halaman buku
    } catch (error) {
        console.error(error);
        res.render("login", {
            title: "Login",
            layout: "./layouts/auth",
            error: "Terjadi kesalahan pada server.",
            errors: [],
            oldInput: { email: email },
            success: successMessage,
        });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/login");
    });
};