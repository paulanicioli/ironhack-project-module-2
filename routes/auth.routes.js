const express = require('express');

const router = express();

const mongoose = require('mongoose');

const User = require('../models/User');

const bcrypt = require('bcrypt');

const { validateSignup } = require('../validation/validations');

const { gradesValues } = require('../public/javascripts/dataComponents');

router.get('/new/student', (req, res) => {
  res.render('./new/student', {
    gradesValues,
    currentUser: req.session.currentUser,
  });
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

  const gradeIndex = gradesValues.findIndex((option) => {
    return option.value === newUserGrade;
  });

  const foundGradeValue = gradesValues[gradeIndex];

  gradesValues.splice(gradeIndex, 1);

  gradesValues.unshift(foundGradeValue);

  if (Object.keys(validationErrors).length > 0) {
    return res.render('./new/student', {
      validationErrors,
      currentUser: req.session.currentUser,
      newUserFirstName,
      newUserLastName,
      newUserEmail,
      gradesValues,
    });
  }

  try {
    const userFromDb = await User.findOne({ email: newUserEmail });
    if (userFromDb) {
      return res.render('./new/student', {
        uniquenessError: 'Erro! Este usuário já está cadastrado!',
        currentUser: req.session.currentUser,
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
      creator: req.session.currentUser._id,
      first_login: true,
    });
    res.redirect('/students');
  } catch (error) {
    console.log('Erro na rota /signup ===> ', error);
  }
});

router.get('/new/parent', (req, res) => {
  res.render('./new/parent', {
    currentUser: req.session.currentUser,
    studentId: req.query.studentId,
  });
});

router.post('/new/parent', async (req, res) => {
  const {
    newParentFirstName,
    newParentLastName,
    newParentEmail,
    newParentPassword,
    newParentStudent,
  } = req.body;

  console.log('id do estudante ==> ', newParentStudent);

  const validationErrors = validateSignup(
    newParentFirstName,
    newParentLastName,
    newParentEmail,
    newParentPassword
  );

  if (Object.keys(validationErrors).length > 0) {
    return res.render('./new/parent', {
      validationErrors,
      currentUser: req.session.currentUser,
      newParentFirstName,
      newParentLastName,
      newParentEmail,
    });
  }

  try {
    const userFromDb = await User.findOne({ email: newParentEmail });
    if (userFromDb) {
      return res.render('./new/parent', {
        uniquenessError: 'Erro! Este usuário já está cadastrado!',
        currentUser: req.session.currentUser,
      });
    }

    // Finding child in the database

    const child = await User.findOne({
      _id: mongoose.Types.ObjectId(newParentStudent),
      role: 'student',
    })
      .then((child) => {
        console.log('Child has been found!');
        console.log(child);
      })
      .catch((e) => {
        console.log('There has been an error ==> ', e);
      });

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const encryptedPassword = bcrypt.hashSync(newParentPassword, salt);

    await User.create({
      firstName: newParentFirstName,
      lastName: newParentLastName,
      email: newParentEmail,
      password: encryptedPassword,
      children: [child._id],
      role: 'parent',
      creator: req.session.currentUser._id,
      first_login: true,
    });

    res.redirect('/students');
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
