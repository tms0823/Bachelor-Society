const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { upload } = require("../utils/fileUpload");

router.post("/register", upload.any(), AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

module.exports = router;
