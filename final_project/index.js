const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session configuration
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
  })
);

// JWT authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {

  let token;

  // Check Authorization header first
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // If no header token, check session
  else if (req.session.authorization) {
    token = req.session.authorization.accessToken;
  }

  // No token provided
  if (!token) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  // Verify JWT
  jwt.verify(token, "access_secret_key", function(err, decoded) {

    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token"
      });
    }

    // Store decoded user information for protected routes
    req.user = decoded;

    next();
  });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
