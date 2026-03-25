const express = require("express");
const router = express.Router();
const statController = require("../controllers/statController");

// GET
router.get("/", statController.getStats);

module.exports = router;
