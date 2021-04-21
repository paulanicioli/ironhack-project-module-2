const express = require('express');

const router = express();

const mongoose = require('mongoose');

const User = require('../models/User');

const bcrypt = require('bcrypt');

const { validateSignup } = require('../validation/validations');

const { gradesValues } = require('../public/javascripts/dataComponents');

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    // verificação dos campos
    const userFromDb = await User.findOne({ email: userEmail, active: true });

    if (!userFromDb) {
      console.log('Could not find user in db');
      return res.render('login', {
        loginError: 'Usuário ou senha incorretos',
        userEmail,
      });
    }
    const isPasswordValid = bcrypt.compareSync(
      userPassword,
      userFromDb.password
    );

    if (!isPasswordValid) {
      return res.render('login', {
        loginError: 'Usuário ou senha incorretos',
        userEmail,
      });
    }

    // Iniciar uma sessão para este usuário
    req.session.currentUser = userFromDb;

    // Redirecionar para diferentes páginas dependendo do tipo de usuário

    switch (userFromDb.role) {
      case 'teacher':
        res.redirect('/students/');
        break;
      case 'parent':
        res.redirect('/students/');
        break;
      default:
        res.redirect('/courses/');
    }
  } catch (error) {
    console.log('Error in the login route ===> ', error);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();

  res.redirect('/login');
});

router.get('/request-account', (req, res) => {
  res.render('request-account', {
    gradesValues,
  });
});

router.post('/request-account', async (req, res) => {
  const {
    requestUserFirstName,
    requestUserLastName,
    requestUserEmail,
    requestUserGrade,
    requestUserType,
  } = req.body;
  const validationErrors = validateSignup(
    requestUserFirstName,
    requestUserLastName,
    requestUserEmail,
    '12345678AA'
  );

  if (Object.keys(validationErrors).length > 0) {
    return res.render('request-account', {
      validationErrors,
      requestUserFirstName,
      requestUserLastName,
      requestUserEmail,
      requestUserType,
      gradesValues,
    });
  }

  try {
    const userFromDb = await User.findOne({ email: requestUserEmail });
    if (userFromDb) {
      validationErrors.userEmailErrors = [
        'Erro! Este usuário já está cadastrado!',
      ];
      return res.render('request-account', {
        validationErrors,
        requestUserFirstName,
        requestUserLastName,
        requestUserEmail,
        gradesValues,
      });
    }
    const newRequestUser = {
      firstName: requestUserFirstName,
      lastName: requestUserLastName,
      email: requestUserEmail,
      password: 'this-is-a-fake-password',
      grade: requestUserGrade,
      role: requestUserType,
      first_login: true,
      active: false,
    };

    await User.create(newRequestUser)
      .then(() => {
        res.render('request-account-successful', {
          requestUserEmail,
        });
      })
      .catch((e) => {
        console.log(
          'There has been an error attempting to create a new user ===> ',
          e
        );
      });
  } catch (error) {
    console.log(
      'There has been an error trying to request a new account ===> ',
      error
    );
  }
});

module.exports = router;
