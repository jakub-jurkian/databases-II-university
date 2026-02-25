const express = require("express");
const router = express.Router();
const heroController = require("../controllers/heroController");

// GET /api/v1/heroes - List all heroes with optional filtering
router.get("/", heroController.getAll);

// POST /api/v1/heroes - Register a new hero
router.post("/", heroController.create);

module.exports = router;
