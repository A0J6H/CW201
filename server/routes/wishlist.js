// routes/wishlist.js

const express = require("express");
const router = express.Router();
const db = require("../db/db");
const verifyToken = require("../middleware/authmiddleware");

// All wishlist routes are protected — user must be logged in
// req.user.userID is set by verifyToken middleware


// GET /api/wishlist — get all wishlist entries for the logged-in user
router.get("/", verifyToken, (req, res) => {
  const userID = req.user.userID;

  db.query(
    "SELECT * FROM wishlist WHERE userID = ? ORDER BY added_at DESC",
    [userID],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Failed to fetch wishlist" });
      res.json(results);
    }
  );
});


// POST /api/wishlist — add a book to the logged-in user's wishlist
router.post("/", verifyToken, (req, res) => {
  const userID = req.user.userID;
  const { book_key, title, author, year, cover_id } = req.body;

  if (!book_key || !title) {
    return res.status(400).json({ error: "book_key and title are required" });
  }

  db.query(
    `INSERT INTO wishlist (userID, book_key, title, author, year, cover_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userID, book_key, title, author || null, year || null, cover_id || null],
    (err, result) => {
      if (err) {
        // MySQL error 1062 = duplicate entry (UNIQUE KEY on userID + book_key)
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "Book already in wishlist" });
        }
        return res.status(500).json({ error: "Failed to add to wishlist" });
      }
      res.status(201).json({ message: "Added to wishlist", id: result.insertId });
    }
  );
});


 router.delete("/", verifyToken, (req, res) => {
  const userID = req.user.userID;
  const book_key = req.query.book_key;

  if (!book_key) {
    return res.status(400).json({ error: "book_key query param is required" });
  }

  db.query(
    "DELETE FROM wishlist WHERE userID = ? AND book_key = ?",
    [userID, book_key],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to remove from wishlist" });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Book not found in wishlist" });
      }
      res.json({ message: "Removed from wishlist" });
    }
  );
});


module.exports = router;
