const express = require('express');

const router = express();

const User = require('../models/User');

const bcrypt = require('bcrypt');

const { validateSignup } = require('../validation/validations');

router.get('/new/student', (req, res) => {
  res.render('./new/student', { validationErrors: {} });
});

router.post('/new/student', async (req, res) => {
  const {
    newUserFirstName,
    newUserLastName,
    newUserEmail,
    newUserPassword,
    newUserGrade,
  } = req.body;
  const validationErrors = validateSignup(
    newUserFirstName,
    newUserLastName,
    newUserEmail,
    newUserPassword
  );

  if (Object.keys(validationErrors).length > 0) {
    return res.render('./new/student', validationErrors);
  }

  try {
    const userFromDb = await User.findOne({ email: newUserEmail });
    if (userFromDb) {
      return res.render('./new/student', {
        uniquenessError: 'Erro! Este usuário já está cadastrado!',
      });
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const encryptedPassword = bcrypt.hashSync(newUserPassword, salt);

    await User.create({
      firstName: newUserFirstName,
      lastName: newUserLastName,
      email: newUserEmail,
      password: encryptedPassword,
      grade: newUserGrade,
      role: 'student',
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
        loginError: 'Usuário ou senha incorretos',
      });
    }
    const isPasswordValid = bcrypt.compareSync(
      userPassword,
      userFromDb.password
    );

    if (!isPasswordValid) {
      return res.render('login', {
        loginError: 'Usuário ou senha incorretos',
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

module.exports = router;
