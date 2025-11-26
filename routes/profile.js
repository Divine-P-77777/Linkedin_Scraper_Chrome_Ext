const express = require("express");
const router = express.Router();
const { Profile } = require("../models/Profile");

router.post("/", async (req, res) => {
  try {
    const data = await Profile.create(req.body);
    res.json({ message: "Profile stored", data });
  } catch (error) {
    res.status(500).json({ error: "Failed to save" });
  }
});

module.exports = router;
