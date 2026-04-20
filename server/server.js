const express = require("express");
const app = express();

const cors = require("cors");

app.use(cors());
app.use(express.json());

app.use("/api/books",require("./routes/books"));


app.get("/", (req, res) => {
    res.send("Server running");
});

app.use("/db",require("./routes/auth"));


app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
})