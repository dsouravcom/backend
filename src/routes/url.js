const express = require('express');
const router = express.Router();
const axios = require ("axios");
const logger = require("../logger.js");

router.post('/', async (req, res)=>{
    var url = req.query.url;
    var finalUrl;

    if(!url.startsWith("https://")){
      finalUrl = "https://"+url;
    }
    else{
      finalUrl = url;
    }
    try{
      await axios.head(finalUrl, { maxRedirects: 5 })
      .then(response => {
          // Sending back the full url
          res.send(response.request.res.responseUrl);
          logger.info("Hostname -> "+finalUrl+", Status code -> "+ response.status);
      })
      .catch(error => {
          logger.warn("Hostname -> "+finalUrl+", Error code -> "+ error.code);
          res.send("No website live on this URL");
      });
    }catch(error){
      logger.log(error);
    }
  })

module.exports = router;