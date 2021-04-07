const express = require('express');

const router = express();

router.get('/', (request, response) => {
  response.render('home');
});

module.exports = router;
