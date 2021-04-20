const express = require('express');

const router = express();

const mongoose = require('mongoose');

const User = require('../models/User');
const Course = require('../models/Course');
const Career = require('../models/Career');

const bcrypt = require('bcrypt');

const { validateSignup } = require('../validation/validations');

const { gradesValues } = require('../public/javascripts/dataComponents');

const fileUploader = require('../config/cloudinary.config');

router.get('/student', (req, res) => {
  res.render('./new/student', {
    gradesValues,
    currentUser: req.session.currentUser,
    isTeacher: req.session.currentUser.role === 'teacher',
  });
});

router.post('/student', async (req, res) => {
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
      isTeacher: req.session.currentUser.role === 'teacher',
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
        isTeacher: req.session.currentUser.role === 'teacher',
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

router.get('/parent', (req, res) => {
  res.render('./new/parent', {
    currentUser: req.session.currentUser,
    studentId: req.query.studentId,
    isTeacher: req.session.currentUser.role === 'teacher',
  });
});

router.post('/parent', async (req, res) => {
  const {
    newParentFirstName,
    newParentLastName,
    newParentEmail,
    newParentPassword,
    newParentStudent,
  } = req.body;

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
      isTeacher: req.session.currentUser.role === 'teacher',
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
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    }

    // Finding child in the database

    const child = await User.findOne({
      _id: mongoose.Types.ObjectId(newParentStudent),
      role: 'student',
    })
      .then()
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

router.get('/course', (req, res) => {
  User.find({ role: 'teacher' })
    .sort({ firstName: 1 })
    .then((teachers) => {
      res.render('./new/course', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        teachers,
        gradesValues,
      });
    })
    .catch((e) => {
      console.log('There has been an error while finding teachers ===> ', e);
    });
});

router.post('/course', fileUploader.single('courseImage'), async (req, res) => {
  const {
    newCourseCode,
    newCourseName,
    newCourseDescription,
    newCourseGrade,
    newCourseTeacher,
  } = req.body;

  const teachers = await User.find({ role: 'teacher' })
    .sort({ firstName: 1 })
    .then()
    .catch((e) => {
      console.log('There has been an error while finding teachers ===> ', e);
    });
  if (!newCourseName || !newCourseDescription || !newCourseCode) {
    return res.render('./new/course', {
      codeError: newCourseCode
        ? null
        : 'Campo obrigatório! Escola um campo único',
      nameError: newCourseName ? null : 'Campo obrigatório!',
      descriptionError: newCourseDescription ? null : 'Campo obrigatório!',
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      teachers,
      gradesValues,
      newCourseName,
      newCourseCode,
      newCourseDescription,
    });
  }
  try {
    const courseFromDb = await Course.findOne({ code: newCourseCode });
    if (courseFromDb) {
      return res.render('./new/course', {
        uniquenessError: 'Erro! Este código já existe!',
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        teachers,
        gradesValues,
        newCourseName,
        newCourseCode,
        newCourseDescription,
      });
    }
    const newCourse = {
      name: newCourseName,
      code: newCourseCode,
      description: newCourseDescription,
      teacher: newCourseTeacher,
      grade: newCourseGrade,
      active: true,
    };

    if (req.file) {
      newCourse.image = req.file.path;
    }
    await Course.create(newCourse);

    res.redirect('/courses');
  } catch (error) {
    console.log('Erro na rota /signup ===> ', error);
  }
});

router.get('/career', (req, res) => {
  res.render('./new/career', {
    currentUser: req.session.currentUser,
    isTeacher: req.session.currentUser.role === 'teacher',
  });
});

router.post('/career', fileUploader.single('careerImage'), async (req, res) => {
  const { newCareerName, newCareerDescription } = req.body;

  if (!newCareerName || !newCareerDescription) {
    return res.render('./new/career', {
      nameError: newCareerName ? null : 'Campo obrigatório!',
      descriptionError: newCareerDescription ? null : 'Campo obrigatório!',
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      newCareerName,
      newCareerDescription,
    });
  }
  try {
    const newCareer = {
      name: newCareerName,
      description: newCareerDescription,
      owner: req.session.currentUser._id,
      active: true,
    };
    if (req.file) {
      newCareer.image = req.file.path;
    }
    await Career.create(newCareer);

    res.redirect('/careers');
  } catch (error) {
    console.log('Erro ===> ', error);
  }
});

module.exports = router;
