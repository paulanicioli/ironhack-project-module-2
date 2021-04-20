const express = require('express');

const router = express();

router.get('/', (request, response) => {
  response.render('home', {
    currentUser: request.session.currentUser,
    isTeacher: request.session.currentUser.role === 'teacher',
  });
});

module.exports = router;
