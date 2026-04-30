// back-end verification for sign up, log in, and log out

const express = require("express");
const router = express.Router();
const db = require("../db/db");
const bcrypt = require("bcrypt") //<- new, used for password hash mapping
const jwt = require("jsonwebtoken") // <- new, used for web tokens

// middleware for JWT handling:
const verifyToken = require("../middleware/authmiddleware");
const { ref } = require("node:process");


// GET all users (test route)
router.get("/users", async (req, res) => {
  const query = req.query.q;

  try {
        db.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json(err);
            res.json(results);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});



// POST /auth/register (sign up user)
router.post("/register", async (req,res) => {
  const {username, email, password, confirmPassword} = req.body;

  // validation (check if all fields filled & password typed correctly)
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords don't match" });
  }


  try {
    // check for existing username or email first
    db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?", [username, email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch users" })
        
        if (results.length > 0) {
          return res.status(400).json( { error: "Username or email already in use" })
        }


        // otherwise, continue with account creation

        // hash the password
        const hashedPassword = await bcrypt.hash(password,10);

        // insert new user
        db.query(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          [username, email, hashedPassword],
          (err, result) => {
            if (err) return res.status(500),json({ error: "Failed to create user" });
            res.status(201).json({ message: "Account successfully created" });
          }

        );

      }

    );
    
  } catch (err){
    res.status(500).json({ error: "Server error" });
  }

});




// POST /auth/login (log in user)
router.post("/login", async (req,res) => {
  
  // identifier can be either username or email
  const {identifier, password} = req.body

  if (!identifier || !password) {
    return res.status(400).json({ error: "Please enter all fields" });
  }

  try {

    // attempt to find existing user via username or email
    db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [identifier, identifier],
      async (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch users" });

        if (results.length === 0) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // take whatever row was returned and store it as "user"
        const user = results[0];

        // compare inputted password and stored hash
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return res.status(401).json({ error: "Invalid credentials" });
        }


        // if there's a correct match, generate the JWT access token for future use
        const accessToken = jwt.sign(
          { userID: user.userID },
          process.env.JWT_SECRET,
          { expiresIn: "15m"}
        );

        // also generate a longer lasting refresh token
        const refreshToken = jwt.sign(
          { userID: user.userID },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        // store refresh token in the database
        db.query(
          "INSERT INTO refresh_tokens (userID, token) VALUES (?, ?)",
          [user.userID, refreshToken],
          (err) => {
            if (err) return res.status(500).json({ error: "Could not fetch refresh tokens" });

            // send refresh token as httpOnly cookie (extra secure)
            res.cookie("refreshToken", refreshToken, {
              httpOnly: true,

              //for some reason, 7 days has be calculated from milliseconds, like so:
              maxAge: 7 * 24 * 60 * 60 * 1000
            });
 
            res.json({
              message: "Valid!",
              token: accessToken
            });

          }
        );

      }

    );

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }

});


// GET /auth/profile (display relevant user information when visiting profile)
// authmiddleware's verifyToken is put before the actual route handler, so if the token's missing, this doesn't run
// if /profile routing runs, we already know who's logged in, so just display the information
router.get("/profile", verifyToken, async (req, res) => {
  
  try {

    db.query(
      "SELECT userID, username, email, createdAt FROM users WHERE userID = ?",
      [req.user.userID],
      (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch users" });

        if (results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        // return details about the logged in user
        res.json(results[0]);
      }
    );

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// POST /auth/refresh (route to get refresh token)
router.post("/refresh", async (req, res) => {

  console.log("Cookies received:", req.cookies);

  // way of accessing refresh token:
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token found" });
  }

  try {
    // check token exists in database
    db.query(
      "SELECT * FROM refresh_tokens WHERE token = ?",
      [refreshToken],
      async (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch refresh tokens" });

        if (results.length === 0) {
          return res.status(403).json({ error: "Invalid refresh token" });
        }

        // verify if the token is still valid
        try {
          const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

          // issue a new access token if valid
          // this prevents the user from having to log back in every 15 mins, whilst also stopping the vulnerabilites that come with regular JWT tokens
          const newAccessToken = jwt.sign(
            { userID: decoded.userID },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
          );

          res.json({ token: newAccessToken });

        } catch (err) {
          // runs if it's been >7 days, clean up the expired refresh token and ask the user to log in again
          db.query("DELETE FROM refresh_tokens WHERE token = ?", [refreshToken]);
          res.clearCookie("refreshToken");
          return res.status(403).json({ error: "Refresh token expired" });
        }
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



// POST /auth/logout (log the user out, delete all tokens)
// (note that our regular JWT access token is deleted via profile.js)
router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  console.log("Logout hit");
  console.log("Cookies:", req.cookies);

  if (!refreshToken) {
    res.clearCookie("refreshToken");
    return res.json({ message: "Logged out successfully" });
  }

  db.query(
    "SELECT userID FROM refresh_tokens WHERE token = ?",
    [refreshToken],
    (err, results) => {
      if (err) {
        console.error("Failed to find refresh token:", err);
        res.clearCookie("refreshToken");
        return res.json({ message: "Logged out successfully" });
      }

      if (results.length === 0) {
      res.clearCookie("refreshToken");
        return res.json({ message: "Logged out successfully" });
      }

      // delete all tokens for that user
      db.query(
        "DELETE FROM refresh_tokens WHERE userID = ?",
        [results[0].userID],
        (err) => {
          if (err) console.error("Failed to delete refresh tokens:", err);

          // only clear cookies and send back to log in page after delete finishes
          res.clearCookie("refreshToken");
          return res.json({ message: "Logged out successfully" })
        }
      );
    }
  );
});


module.exports = router;