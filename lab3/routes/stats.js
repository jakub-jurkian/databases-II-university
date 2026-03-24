const express = require("express");
const router = express.Router();
const statController = require("../../lab2/controllers/statController");

// GET
router.get("/", statController.getStats);

module.exports = router;
