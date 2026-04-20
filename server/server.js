const express = require("express");
const app = express();

const cors = require("cors");

const db = require("./db/db");

app.use(cors());
app.use(express.json());

app.use("/api/books",require("./routes/books"));

app.get("/", (req, res) => {
    res.send("Server running");
});

app.get("/test-db", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
})