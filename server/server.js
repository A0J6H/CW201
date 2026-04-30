const express = require("express");
const app = express();
const cookieParser = require("cookie-parser"); // <- new, used for storing refresh tokens
const cors = require("cors");
const path = require("path");
app.use(express.static(path.join(__dirname, "../client")));

app.use(cors({
  origin: "http://127.0.0.1:8080",
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

app.use("/api/books",require("./routes/books"));


app.get("/", (req, res) => {
    res.send("Server running");
});

app.use("/auth",require("./routes/auth"));


app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});