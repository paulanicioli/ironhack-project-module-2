const express = require('express');

const router = express();

const User = require('../models/User');

const bcrypt = require('bcrypt');

const { validateSignup } = require('../validation/validations');

router.get('/new', (req, res) => {
  res.render('newUser');
});

router.post('/new', async (req, res) => {
  const { userName, userEmail, userPassword, userBirthDate } = req.body;
  const validationErrors = validateSignup(
    userName,
    userEmail,
    userPassword,
    userBirthDate
  );

  if (Object.keys(validationErrors).length > 0) {
    return res.render('signup', validationErrors);
  }

  try {
    const userFromDb = await User.findOne({ email: userEmail });
    if (userFromDb) {
      return res.render('signup', {
        userNameError: 'Este usuário já está cadastrado!',
      });
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const encryptedPassword = bcrypt.hashSync(userPassword, salt);

    await User.create({
      name: userName,
      email: userEmail,
      password: encryptedPassword,
      birthDate: new Date(userBirthDate),
    });
    res.redirect('/login');
  } catch (error) {
    console.log('Erro na rota /signup ===> ', error);
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    // verificação dos campos
    const userFromDb = await User.findOne({ email: userEmail });

    if (!userFromDb) {
      console.log('Could not find user in db');
      return res.render('login', {
        userEmailError: 'Usuário ou senha incorretos',
        userPasswordError: 'Usuário ou senha incorretos',
      });
    }
    const isPasswordValid = bcrypt.compareSync(
      userPassword,
      userFromDb.password
    );

    if (!isPasswordValid) {
      return res.render('login', {
        userEmailError: 'Usuário ou senha incorretos',
        userPasswordError: 'Usuário ou senha incorretos',
      });
    }

    // Iniciar uma sessão para este usuário
    req.session.currentUser = userFromDb;

    res.redirect('/courses');
  } catch (error) {
    console.log('Error in the login route ===> ', error);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();

  res.redirect('/login');
});

module.exports = router;
