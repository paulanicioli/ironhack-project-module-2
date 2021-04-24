const express = require('express');
const { format } = require('date-format-parse');
require('dotenv').config();

const router = express();

const nodemailer = require('nodemailer');

const mongoose = require('mongoose');

const User = require('../models/User');

const bcrypt = require('bcrypt');

const generator = require('generate-password');

const {
  validateSignup,
  validatePasswords,
} = require('../validation/validations');

const {
  orderedGradesValues,
  orderedGenderValues,
} = require('../public/javascripts/dataComponents');

const fileUploader = require('../config/cloudinary.config');

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    // verificação dos campos
    const userFromDb = await User.findOne({
      email: userEmail,
      active: true,
      requires_approval: { $ne: true },
    });

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
        case 'parent':
          res.redirect('/children');
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
  res.render('./accounts/request', {
    gradesValues: orderedGradesValues,
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
      gradesValues: orderedGradesValues,
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
        gradesValues: orderedGradesValues,
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
      requires_approval: true,
    };

    await User.create(newRequestUser)
      .then(() => {
        res.render('./accounts/success', {
          requestUserEmail,
          isNewAccount: true,
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
  if (!req.session.currentUser) {
    return res.render('login');
  } else if (!req.session.currentUser.first_login) {
    return res.render('not-found', {
      currentUser: req.session.currentUser,
    });
  } else {
    res.render('./accounts/confirm', {
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      isParent: req.session.currentUser.role === 'parent',
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

      await User.findByIdAndUpdate(userId, confirmedUser, { new: true })
        .then((updatedUser) => {
          req.session.currentUser = updatedUser;
          switch (req.session.currentUser.role) {
            case 'student':
              return res.redirect('/courses/');
              break;
            case 'parent':
              return res.redirect('/children/');
              break;
            default:
              return res.redirect('/students/');
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

router.get('/my-profile/', async (req, res) => {
  if (!req.session.currentUser) {
    return res.render('login');
  } else {
    const genderValues = [...orderedGenderValues];
    if (req.session.currentUser.gender) {
      const genderIndex = genderValues.findIndex((element) => {
        return element.value === req.session.currentUser.gender;
      });
      const foundGenderValue = genderValues[genderIndex];

      genderValues.splice(genderIndex, 1);

      genderValues.unshift(foundGenderValue);
    }
    const gradesValues = [...orderedGradesValues];

    if (req.session.currentUser.role === 'student') {
      const gradeIndex = gradesValues.findIndex((element) => {
        return element.value === req.session.currentUser.grade;
      });
      const foundGradeValue = gradesValues[gradeIndex];

      gradesValues.splice(gradeIndex, 1);

      gradesValues.unshift(foundGradeValue);
    }

    const parents = await User.find({
      role: 'parent',
      children: { $elemMatch: { $eq: req.session.currentUser._id } },
    });

    if (req.session.currentUser.role === 'parent') {
      await User.findById(req.session.currentUser._id)
        .populate('children')
        .then((parentFromDb) => {
          req.session.currentUser = parentFromDb;
        })
        .catch((e) => {
          console.log('Error finding parent information ===> ', e);
        });
    }

    const birthDateFormatted = format(
      req.session.currentUser.birthDate,
      'YYYY-MM-DD'
    );

    res.render('./accounts/my-profile', {
      currentUser: req.session.currentUser,
      gradesValues,
      genderValues,
      parents,
      birthDateFormatted,
      userFirstName: req.session.currentUser.firstName,
      userLastName: req.session.currentUser.lastName,
      userEmail: req.session.currentUser.email,
      isTeacher: req.session.currentUser.role === 'teacher',
      isStudent: req.session.currentUser.role === 'student',
      isParent: req.session.currentUser.role === 'parent',
    });
  }
});

router.post('/my-profile', (req, res) => {
  const {
    userFirstName,
    userLastName,
    userEmail,
    userBirthDate,
    userGender,
    userGrade,
    userNewsletter,
  } = req.body;
  const validationErrors = {};
  if (!userFirstName) {
    validationErrors.userFirstNameErrors = ['Campo obrigatório!'];
  }

  if (!userLastName) {
    validationErrors.userLastNameErrors = ['Campo obrigatório!'];
  }

  if (Object.keys(validationErrors).length > 0) {
    const genderValues = [...orderedGenderValues];
    if (userGender) {
      const genderIndex = genderValues.findIndex((element) => {
        return element.value === userGender;
      });
      const foundGenderValue = genderValues[genderIndex];

      genderValues.splice(genderIndex, 1);

      genderValues.unshift(foundGenderValue);
    }
    const gradesValues = [...orderedGradesValues];
    if (userGrade) {
      const gradeIndex = gradesValues.findIndex((element) => {
        return element.value === userGrade;
      });
      const foundGradeValue = gradesValues[gradeIndex];

      gradesValues.splice(gradeIndex, 1);

      gradesValues.unshift(foundGradeValue);
    }

    const birthDateFormatted = format(userBirthDate, 'YYYY-MM-DD');

    return res.render('./accounts/my-profile', {
      validationErrors,
      birthDateFormatted,
      gradesValues,
      genderValues,
      userFirstName,
      userLastName,
      userEmail,
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      isStudent: req.session.currentUser.role === 'student',
      isParent: req.session.currentUser.role === 'parent',
    });
  }
  const editedUser = {
    firstName: userFirstName,
    lastName: userLastName,
    email: userEmail,
    gender: userGender,
    birthDate: userBirthDate,
    newsletterOptIn: true,
  };

  if (!userNewsletter) {
    editedUser.newsletterOptIn = false;
  }

  User.findByIdAndUpdate(req.session.currentUser._id, editedUser, { new: true })
    .then((updatedUser) => {
      req.session.currentUser = updatedUser;
      res.redirect('/my-profile/');
    })
    .catch((e) => {
      console.log('There has been an error in the My Profile page ===> ', e);
    });
});

router.get('/reset-password/', (req, res) => {
  if (!req.session.currentUser) {
    return res.render('login');
  } else {
    return res.render('./accounts/reset-password', {
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      isParent: req.session.currentUser.role === 'parent',
      isStudent: req.session.currentUser.role === 'student',
    });
  }
});

router.post('/reset-password/', async (req, res) => {
  if (!req.session.currentUser) {
    return res.render('login');
  }
  const { currentPassword, newPassword1, newPassword2 } = req.body;

  const validationErrors = validatePasswords(currentPassword, newPassword1);

  if (Object.keys(validationErrors).length > 0) {
    return res.render('./accounts/reset-password', {
      validationErrors,
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      isParent: req.session.currentUser.role === 'parent',
      isStudent: req.session.currentUser.role === 'student',
    });
  }

  if (newPassword1 !== newPassword2) {
    validationErrors.newPasswordError =
      'Senhas não são iguais! Tente novamente.';
    return res.render('./accounts/reset-password', {
      validationErrors,
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      isParent: req.session.currentUser.role === 'parent',
      isStudent: req.session.currentUser.role === 'student',
    });
  }

  try {
    const userFromDb = await User.findById(req.session.currentUser._id);

    const isPasswordValid = bcrypt.compareSync(
      currentPassword,
      userFromDb.password
    );

    if (!isPasswordValid) {
      validationErrors.currentPasswordError =
        'Senha incorreta! Tente novamente.';
      return res.render('./accounts/reset-password', {
        validationErrors,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        isParent: req.session.currentUser.role === 'parent',
        isStudent: req.session.currentUser.role === 'student',
      });
    } else {
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const newEncryptedPassword = bcrypt.hashSync(newPassword1, salt);
      const editedUser = await User.findByIdAndUpdate(
        req.session.currentUser._id,
        {
          password: newEncryptedPassword,
        },
        { new: true }
      );
      req.session.currentUser = editedUser;
      return res.redirect('/my-profile');
    }
  } catch (error) {
    console.log('Error in POST /reset-password ===> ', error);
  }
});

router.get('/forgot-password', (req, res) => {
  if (req.session.currentUser) {
    return res.redirect('/reset-password');
  }
  res.render('./accounts/forgot-password');
});

router.post('/forgot-password', async (req, res) => {
  const { currentEmail } = req.body;
  try {
    const userFromDb = await User.findOne({ email: currentEmail });
    const validationErrors = {};
    if (!userFromDb) {
      validationErrors.userEmailError =
        'Este email não está cadastrado na plataforma! Tente novamente.';
      return res.render('./accounts/forgot-password', {
        validationErrors,
        currentEmail,
      });
    } else if (!userFromDb.active) {
      validationErrors.userEmailError =
        'Seu usuário foi desativado ou tem aprovação pendente! Por favor entre em contato com nosso time de suporte em escoladofuturo.success@gmail.com.';
      return res.render('./accounts/forgot-password', {
        validationErrors,
        currentEmail,
      });
    }

    const temporaryPassword = generator.generate({
      length: 12,
      numbers: true,
    });

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const newEncryptedPassword = bcrypt.hashSync(temporaryPassword, salt);

    await User.findByIdAndUpdate(userFromDb._id, {
      password: newEncryptedPassword,
    })
      .then(() => {
        console.log('Senha alterada com sucesso!');
      })
      .catch((e) => {
        console.log('Não foi possível alterar a senha do usuário', e);
      });
    const bodyHtml = `<b>Você solicitou uma nova senha para acessar a Escola do Futuro</b>
    <p>Email: ${currentEmail}</p>
    <p>Sua senha temporária é: ${temporaryPassword}</p>
    <p>Faça login na <a href="https://escola-do-futuro.herokuapp.com/login">Escola do Futuro</a> e altere sua senha.</p>
    <hr>
    <small>Esta senha é valida por 48h. Faça uma nova solicitação após este prazo.</small> `;

    const smtpConfig = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD,
      },
    };

    let transporter = nodemailer.createTransport(smtpConfig);

    let info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: process.env.DESTINATION_EMAIL,
      subject: 'Sua nova senha temporária',
      text: 'Este é um email automático da Escola do Futuro.',
      html: bodyHtml,
    });

    return res.render('./accounts/success', {
      currentEmail,
      isNewAccount: false,
    });
  } catch (error) {
    console.log('Error in POST /forgot-password ===> ', error);
  }
});

module.exports = router;
