const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { error } = require("node:console");

router.get("/", async (req, res) => {//gets books based of a title search
  const query = req.query.q;

  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${query}`
    );

    const data = await response.json();

    // sometimes the API times out with a 500 error, so here's a way of handling it
    if (!data || !data.docs) {
      return res.status(503).json({ error: "Open Library Search is currently unavailable, please try again later!" });
    }

    const books = data.docs.slice(0, 10).map(book => ({
      title: book.title,
      author: book.author_name?.join(", "),
      year: book.first_publish_year,
      coverId: book.cover_i,
      key: book.key
    }));

    res.json(books);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

router.get("/book", async (req, res) => {//gets details for a specific book using the key
  const query = req.query.q;

  try {
    const response = await fetch(
      `https://openlibrary.org/${query}.json`
    );

    const data = await response.json();

    const book = {
      title: data.title,
      description: typeof data.description === "object"
        ? data.description.value
        : data.description,
      coverId: data.covers?.[0],
      subjects: data.subjects?.slice(0, 5),
      authorKey: data.authors?.[0]?.author?.key
    };

    res.json(book);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch the book" });
  }
});

router.post("/dbCheck", async (req, res) => {//Checks if book is in db, if not insert 
  const { title, author, cover, apiID, userID} = req.body;

  try {
    db.query(`SELECT * FROM books WHERE apiID = '${apiID}'`, (err, results) => {
      if (err) return res.status(500).json(err);
      console.log(results.length);
      if (results.length!=1){
        db.query("INSERT INTO books (title, author, cover, apiID) VALUES (?, ?, ?, ?)",[title, author, cover, apiID]);
        console.log("inserted")
        res.json({
          message: "Book inserted successfully",
          bookID: results.insertId
        });
      }
      else{
        console.log("exists")
        db.query('SELECT bookID FROM books WHERE apiID = ?', [apiID], (err, results) => {
          if (err) return res.status(500).json(err);
          const bookID = results[0].bookID;
          db.query(`UPDATE user_books SET lastAccessed = CURRENT_TIMESTAMP WHERE userID = ? AND bookID = ?`,[userID, bookID]);
        });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch the book" });
  }
});

router.post("/reviewInsert", async (req, res) => {//Checks if book is in db, if not insert 
  const { userID, bookID, status, review, rating } = req.body;

  try{
      db.query("INSERT INTO user_books (userID, bookID, status, review, rating, lastAccessed) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",[userID, bookID, status, review, rating]);
      console.log("inserted")
      res.json({
        message: "Book inserted successfully"
  });
  }catch{
    console.log("Already inserted");
    console.log(error);
    db.query(`UPDATE user_books SET review = ?, rating = ?, lastAccessed = CURRENT_TIMESTAMP WHERE userID = ? AND bookID = ?`,[review, rating, userID, bookID]);
  }
});

router.get("/bookID", (req, res) => {
  const apiID = req.query.q;

  try {
        db.query('SELECT bookID FROM books WHERE apiID = ?', [apiID], (err, results) => {
        if (err) return res.status(500).json(err);
            res.json(results);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookID" });
  }
});

router.get("/userBooks", (req, res) => {
  const userID = req.query.q;
  let resultsArray = [];
  let length;
  try {
        db.query('SELECT bookID FROM user_books WHERE userID = ? ORDER BY lastAccessed DESC', [userID], (err, results) => {
        if (err) return res.status(500).json(err);
        length = results.length;
        for (let i = 0; i < results.length; i++) {
          db.query('SELECT apiID FROM books WHERE bookID = ?', [results[i].bookID], (err, results2) => {
            if (err) return res.status(500).json(err);
            console.log(results2[0]);
            resultsArray.push(results2[0]);
            if (length == resultsArray.length) {
              res.json(resultsArray);
            }
          });
        }

    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookID" });
  }
});

module.exports = router;