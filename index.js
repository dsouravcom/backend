const express = require('express');
const cors = require("cors");
require('dotenv').config();

// import routes
const instaRoute = require("./src/routes/insta-caption.js");
const urlRoute = require("./src/routes/url.js");

const app = express();
const port = 5000;

// Configure the CORS for whitelisted domains. 
const allowedOrigins = process.env.WHITELISTED_DOMAINS;
const corsOptions = {
  origin: (origin, callback) => {
    // Check if the origin is allowed
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS -> '+origin));
    }
  },
  methods: 'POST,GET',
  credentials: true, // Enable credentials (if needed)
  optionsSuccessStatus: 204, // Respond with a 204 status for preflight requests
};

// Apply CORS middleware globally to all routes 
app.use((req, res, next) => {
  const excludeRoutes = ['/test']; // You can include routes that don't use Whitelisted domains.
  if (excludeRoutes.includes(req.path)) {
    cors()(req, res, next);
  } else {
    cors(corsOptions)(req, res, next);
  }
});

app.use('/get-caption',instaRoute);
app.use('/expand-url', urlRoute);

app.get('/test',(req, res)=>{
  res.send("servre is up.");
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
