const express = require('express');
const cheerio = require('cheerio');
const router = express.Router();
const axios = require ("axios");


router.post('/', async (req, res) => {
    const url = req.query.url;
  try {
    // Make a GET request to the URL
    const response = await axios.get(url);

    // Load HTML content into Cheerio
    const $ = cheerio.load(response.data);

    // Extract metadata (example: title and description)
    // const title = $('head title').text();
    const description = $('meta[property="og:title"]').attr('content');

    // split it to get original caption

    const str = description.split(':').slice(1);
    const result = str.join(':');

    // Send the extracted metadata as JSON response
    res.json({ result });
    // console.log("caption - " + description);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;