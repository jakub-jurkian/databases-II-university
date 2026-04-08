require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client;

function getClient() {
  if (!client) {
    client = new MongoClient(uri, options);
  }
  return client;
}

// Funkcje zwracające referencje do kolekcji
const db = () => getClient().db("superhero_db");
const heroProfiles = () => db().collection("heroProfiles");
const heroAuditLog = () => db().collection("heroAuditLog");

module.exports = {
  client: getClient(),
  heroProfiles,
  heroAuditLog,
};
