require("dotenv").config();
const express = require("express");

const heroesRouter = require("./routes/heroes");
const incidentsRouter = require("./routes/incidents");
const statsRouter = require("./routes/stats");
const errorHandler = require("./middleware/errorHandler");

const { client } = require("./mongo/client.js");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Mount routes
app.use("/api/v1/heroes", heroesRouter);
app.use("/api/v1/incidents", incidentsRouter);
app.use("/api/v1/stats", statsRouter);

// Global RFC 7807 error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Błąd połączenia z MongoDB:", err);
    process.exit(1);
  }
}

start();
