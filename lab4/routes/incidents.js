const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");

// GET /api/v1/incidents - List all incidents with optional filtering
router.get("/", incidentController.getAll);

// POST /api/v1/incidents - Report a new incident
router.post("/", incidentController.create);

// GET /api/v1/incidents/:id - List all incidents with optional filtering
router.get("/:id", incidentController.getById);

// POST /api/v1/incidents/:id/assign - Assign a hero to an incident
router.post("/:id/assign", incidentController.assign);

// PATCH /api/v1/incidents/:id/resolve - Close an incident
router.patch("/:id/resolve", incidentController.resolve);

module.exports = router;
