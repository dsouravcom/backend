const express = require('express');
const router = express.Router();
const axios = require ("axios");

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
      })
      .catch(error => {
          console.error("Hostname -> "+error.hostname+", Error code -> "+ error.code);
          res.send("No website live on this URL");
      });
    }catch(error){
      console.log(error);
    }
  })

module.exports = router;