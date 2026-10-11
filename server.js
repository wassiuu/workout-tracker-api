require("dotenv").config();

const express = require("express");
const app = express();
const db = require("./db/database");
const authRoutes = require("./routes/auth")

const PORT = process.env.PORT || 3000;
app.use(express.json());



app.get("/", (req, res) => {
  res.json({ message: "Workout Tracker API is running" });
});

app.use("/auth",authRoutes);




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});