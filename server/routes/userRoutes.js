const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

// Protected routes - require authentication
router.use(authController.protect);
router.get("/me", userController.getMe);
router.patch("/me", userController.updateMe);
router.patch("/update-password", userController.updatePassword);
router.patch(
	"/update-profile-picture",
	upload.single("profilePicture"),
	userController.updateProfilePicture
);
router.delete("/delete-profile-picture", userController.deleteProfilePicture);
router.patch("/updateProfileInfo", userController.updateProfileInfo);
router.patch("/updateMe", userController.updateMe);
module.exports = router;
