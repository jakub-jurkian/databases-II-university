const express = require("express");
const router = express.Router();
const heroController = require("../controllers/heroController");

// GET /api/v1/heroes - List all heroes with optional filtering
router.get("/", heroController.getAll);

// POST /api/v1/heroes - Register a new hero
router.post("/", heroController.create);

// GET /api/v1/heroes/:id - Return a specific hero
router.get("/:id", heroController.getById);

// PATCH /api/v1/heroes/:id - Update a specific hero
router.patch("/:id", heroController.update);

// GET /api/v1/heroes/:id/incidents -  List all incidents of given hero
router.get("/:id/incidents", heroController.getIncidents);

module.exports = router;
