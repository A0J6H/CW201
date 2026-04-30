// this is used for verifying the JWT token on protected routes

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    //JWT string is made up of a header, payload, and signature
    // token goes in the header, payload will be userID, signature is a secret key we don't need to worry about

    //reads auth header
    const authHeader = req.headers["authorization"];
    
    // http client sends tokens in this format: "Bearer <token>", so we split and take the second part only
    const token = authHeader && authHeader.split(" ")[1]; 

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        //attempt to verify the token using JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // makes { userID: ... } available for any route with this middleware implemented
        // (for andrew: there's an example of me implementing this onto the users page ((here)), could be useful for the chat?)
        req.user = decoded;
        
        // middleware sits between request and route handler, so this proceeds onto the actual route
        next();

    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

module.exports = verifyToken;