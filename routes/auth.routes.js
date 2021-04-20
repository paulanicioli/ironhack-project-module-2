const express = require('express');

const router = express();

const mongoose = require('mongoose');

const User = require('../models/User');

const bcrypt = require('bcrypt');

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

module.exports = router;
