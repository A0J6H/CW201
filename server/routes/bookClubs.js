const express = require("express");
const router = express.Router();
const db = require("../db/db");

//middleware for JWT handling:
const verifyToken = require("../middleware/authmiddleware");
const { ref } = require("node:process");

router.get("/", (req, res) => {
  db.query("SELECT * FROM book_clubs", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB query failed" });
    }
    res.json(results);
  });
});

router.get("/userclubs", verifyToken, async (req, res) => {
  try {

    db.query(
      "SELECT members.userID, members.clubID, book_clubs.name, book_clubs.description FROM members JOIN book_clubs ON members.clubID = book_clubs.clubID WHERE members.userID = ?",
      [req.user.userID],
      (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch users" });

        if (results.length === 0) {
          return res.status(404).json({ error: "Club not found" });
        }

        res.json(results);
      }
    );

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/addPost", async (req,res) => {
  const {clubID, userID, title, post} = req.body;

  // validation (check if all fields filled & password typed correctly)
  if (!clubID || !userID || !title || !post) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // insert new post
        db.query(
          "INSERT INTO club_posts (clubID, userID, title, post) VALUES (?, ?, ?, ?)",
          [clubID, userID, title, post],
          (err, result) => {
            if (err) return res.status(500).json({ error: "Failed to create post" });
            res.status(201).json({ message: "Post successfully created" });
          }

        );

    }
    
   catch (err){
    res.status(500).json({ error: "Server error" });
  }

});


module.exports = router;