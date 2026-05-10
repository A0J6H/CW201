const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM book_clubs", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB query failed" });
    }

    res.json(results);
  });
});

module.exports = router;