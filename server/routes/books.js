const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q;

  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${query}`
    );

    const data = await response.json();

    // Clean the data
    const books = data.docs.slice(0, 10).map(book => ({
      title: book.title,
      author: book.author_name?.join(", "),
      year: book.first_publish_year,
      coverId: book.cover_i
    }));

    res.json(books);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

module.exports = router;