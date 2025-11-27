const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/profile", require("./routes/profile"));

const PORT = 3000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database synced successfully.");
    app.listen(PORT, () => console.log("Server running at", PORT));
  })
  .catch(err => console.log("DB sync error:", err));
