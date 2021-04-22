const express = require('express');

const router = express();

const mongoose = require('mongoose');

const User = require('../models/User');

const bcrypt = require('bcrypt');

const { validateSignup } = require('../validation/validations');

const { gradesValues } = require('../public/javascripts/dataComponents');

const fileUploader = require('../config/cloudinary.config');

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
    if (userFromDb.first_login) {
      return res.redirect('/confirm');
    } else {
      switch (userFromDb.role) {
        case 'student':
          res.redirect('/courses/');
          break;
        default:
          res.redirect('/students/');
      }
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
  res.render('.accounts/request', {
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
    return res.render('./accounts/request', {
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
      return res.render('./accounts/request', {
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
        res.render('./accounts/request-successful', {
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

router.get('/confirm/', (req, res) => {
  if (!req.session.currentUser || !req.session.currentUser.first_login) {
    return res.render('not-found', {
      currentUser: req.session.currentUser,
    });
  } else {
    res.render('./accounts/confirm', {
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      userFirstName: req.session.currentUser.firstName,
      userLastName: req.session.currentUser.lastName,
      userEmail: req.session.currentUser.email,
    });
  }
});

router.post(
  '/confirm/:userId',
  fileUploader.single('userProfilePicture'),
  async (req, res) => {
    const { userId } = req.params;

    if (userId !== req.session.currentUser._id) {
      return res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    }

    const {
      userFirstName,
      userLastName,
      userEmail,
      userPassword,
      userBirthDate,
      userGender,
      userNewsletter,
    } = req.body;

    const validationErrors = validateSignup(
      userFirstName,
      userLastName,
      userEmail,
      userPassword
    );

    if (Object.keys(validationErrors).length > 0) {
      return res.render('./accounts/confirm', {
        validationErrors,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        userFirstName,
        userLastName,
        userEmail,
      });
    }
    try {
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const encryptedPassword = bcrypt.hashSync(userPassword, salt);

      const confirmedUser = {
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        password: encryptedPassword,
        gender: userGender,
        birthDate: userBirthDate,
        newsletterOptIn: true,
        first_login: false,
      };

      if (req.file) {
        confirmedUser.profilePicture = req.file.path;
      }

      if (!userNewsletter) {
        confirmedUser.newsletterOptIn = false;
      }

      await User.findByIdAndUpdate(userId, confirmedUser)
        .then(() => {
          switch (req.session.currentUser.role) {
            case 'student':
              res.redirect('/courses/');
              break;
            default:
              res.redirect('/students/');
          }
        })
        .catch((e) => {
          console.log(
            'There has been an error trying to post confirmation page ===> ',
            e
          );
        });
    } catch (error) {
      console.log(
        'There has been an error trying to post confirmation page ===> ',
        error
      );
    }
  }
);

router.get('/my-profile/', (req, res) => {
  if (!req.session.currentUser || !req.session.currentUser.first_login) {
    return res.render('not-found', {
      currentUser: req.session.currentUser,
    });
  } else {
    res.render('./accounts/my-profile', {
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      userFirstName: req.session.currentUser.firstName,
      userLastName: req.session.currentUser.lastName,
      userEmail: req.session.currentUser.email,
    });
  }
});

module.exports = router;
