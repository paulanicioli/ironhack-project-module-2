const express = require('express');

const router = express();

router.get('/', (request, response) => {
  response.render('home', {
    currentUser: request.session.currentUser,
    isTeacher: request.session.currentUser
      ? request.session.currentUser.role === 'teacher'
      : null,
  });
});

module.exports = router;
