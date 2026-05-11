const express = require("express"); 
const router= express.Router(); 

router.get("/author", async (req, res) => {
  const query = req.query.q; // will be the author name

  try {
    // First search for the author to get their key
    const searchRes = await fetch(
      `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(query)}`
    );
    const searchData = await searchRes.json();

    if (!searchData.docs?.length) {
      return res.status(404).json({ error: "Author not found" });
    }

    const authorKey = searchData.docs[0].key; // e.g. "OL23919A"

    // Then fetch full author details using that key
    const authorRes = await fetch(
      `https://openlibrary.org/authors/${authorKey}.json`
    );
    const authorData = await authorRes.json();

    const author = {
      name: authorData.name,
      bio: typeof authorData.bio === "object" ? authorData.bio.value : authorData.bio,
      birthDate: authorData.birth_date,
      photoId: authorData.photos?.[0],
      key: authorKey
    };

    res.json(author);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch author" });
  }
});

module.exports = router;