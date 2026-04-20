const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", async (req, res) => {//gets books based of a title search
  const query = req.query.q;

  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${query}`
    );

    const data = await response.json();

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
  const { title, author, cover, apiID } = req.body;

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
        res.json({
          message: "Book exist",
          bookID: results.bookID
        });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch the book" });
  }
});

module.exports = router;