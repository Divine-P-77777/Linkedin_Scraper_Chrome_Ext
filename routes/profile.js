const express = require("express");
const router = express.Router();
const { Profile } = require("../models");

router.post("/", async (req, res) => {
  try {
    const saved = await Profile.create(req.body);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
