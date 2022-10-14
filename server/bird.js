const axios = require('axios')
var express = require('express');
var router = express.Router();
// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
// define the home page route
router.get('/', async function (req, res) {
    const response = await axios.get("https://www.cifraclub.com.br/legiao-urbana/tempo-perdido/");
    console.log(response.data);
    res.send('Birds home page');

});
// define the about route
router.get('/about', function(req, res) {
  res.send('About birds');
});

module.exports = router;