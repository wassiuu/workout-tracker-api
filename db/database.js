const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "workout.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to SQLite Database")

    const schema = fs.readFileSync(
      path.join(__dirname, "schema.sql"),
      "utf8"
    );
    db.exec(schema, (err) => {
      if (err) {
        console.error("Failed to create tables:", err.message);
      } else {
        console.log("Database tables ready");
      }
    });
  }
});

db.run("PRAGMA foreign_keys = ON");

module.exports = db;