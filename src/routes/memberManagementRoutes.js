const express = require("express");
const router = express.Router();

const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

router.use(isLoggedIn, isAdmin);

router.get("/members", adminController.showMemberList);
router.post("/members/reset-password/:id", adminController.resetPassword);

module.exports = router;
