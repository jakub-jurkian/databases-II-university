const express = require("express");
const router = express.Router();
const heroController = require("../controllers/heroController");

// GET /api/v1/heroes - List all heroes with optional filtering
router.get("/", heroController.getAll);

// GET /api/v1/heroes/profiles - List profiles with Mongo filters
router.get("/profiles", heroController.getProfiles);

// POST /api/v1/heroes - Register a new hero
router.post("/", heroController.create);

// GET /api/v1/heroes/:id - Return a specific hero
router.get("/:id", heroController.getById);

// PATCH /api/v1/heroes/:id - Update a specific hero
router.patch("/:id", heroController.update);

// GET /api/v1/heroes/:id/incidents -  List all incidents of given hero
router.get("/:id/incidents", heroController.getIncidents);

// GET /api/v1/heroes/:id/profile - Get active profile by hero id
router.get("/:id/profile", heroController.getProfileByHeroId);

// PATCH /api/v1/heroes/:id/profile - Update profile bio
router.patch("/:id/profile", heroController.patchProfileBio);

// DELETE /api/v1/heroes/:id/profile - Soft-delete profile with audit log transaction
router.delete("/:id/profile", heroController.softDeleteProfile);

// POST /api/v1/heroes/:id/profile/specializations - Add specialization
router.post(
	"/:id/profile/specializations",
	heroController.addProfileSpecialization,
);

// DELETE /api/v1/heroes/:id/profile/specializations/:name - Remove specialization
router.delete(
	"/:id/profile/specializations/:name",
	heroController.removeProfileSpecialization,
);

module.exports = router;
