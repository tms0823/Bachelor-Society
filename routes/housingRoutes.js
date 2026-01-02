const express = require("express");
const router = express.Router();
const HousingController = require("../controllers/housingController");
const authMiddleware = require("../middlewares/authMiddleware"); // Protect routes
const { upload } = require("../utils/fileUpload");

// Create a new housing listing (POST)
router.post("/", authMiddleware, upload.array('photos', 10), HousingController.createHousing);

// Get all housing listings (GET)
router.get("/", authMiddleware, HousingController.getAllHousing);

// Get a single housing listing by ID (GET)
router.get("/:id", HousingController.getHousingById);

// Update a housing listing (PUT)
router.put("/:id", authMiddleware, upload.array('photos', 10), HousingController.updateHousing);

// Delete a housing listing (DELETE)
router.delete("/:id", authMiddleware, HousingController.deleteHousing);

// Inquire about a housing listing
router.post("/:id/inquire", authMiddleware, HousingController.inquire);

module.exports = router;
