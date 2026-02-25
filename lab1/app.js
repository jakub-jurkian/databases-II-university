require("dotenv").config();
const express = require("express");

const heroesRouter = require("./routes/heroes");
const incidentsRouter = require("./routes/incidents");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Mount routes
app.use("/api/v1/heroes", heroesRouter);
app.use("/api/v1/incidents", incidentsRouter);

// Global RFC 7807 error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
