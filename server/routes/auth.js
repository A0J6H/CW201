const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/users", async (req, res) => {
  const query = req.query.q;

  try {
        db.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json(err);
            res.json(results);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;