const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// 2. Import aturan validasi yang baru Anda buat
const { registerRules, loginRules } = require('../middleware/validationRules');

router.get("/register", authController.getRegisterPage);
router.get("/login", authController.getLoginPage);

router.post("/register", registerRules, authController.postRegister);
router.post("/login", loginRules, authController.postLogin);

router.get("/logout", authController.logout);   

module.exports = router;
