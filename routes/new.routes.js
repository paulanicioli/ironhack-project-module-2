const express = require('express');

const router = express();

const mongoose = require('mongoose');

const User = require('../models/User');
const Course = require('../models/Course');
const Career = require('../models/Career');

const bcrypt = require('bcrypt');

const { validateSignup } = require('../validation/validations');

const { orderedGradesValues } = require('../public/javascripts/dataComponents');

const fileUploader = require('../config/cloudinary.config');

router.get('/student', (req, res) => {
  const { parentId } = req.query;
  res.render('./students/new', {
    gradesValues: orderedGradesValues,
    newStudentParent: parentId,
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
    newUserActive,
    newUserParent,
  } = req.body;

  const validationErrors = validateSignup(
    newUserFirstName,
    newUserLastName,
    newUserEmail,
    newUserPassword
  );

  const gradesValues = [...orderedGradesValues];
  const gradeIndex = gradesValues.findIndex((option) => {
    return option.value === newUserGrade;
  });

  const foundGradeValue = gradesValues[gradeIndex];

  gradesValues.splice(gradeIndex, 1);

  gradesValues.unshift(foundGradeValue);

  let activeCheck = true;

  if (!newUserActive) {
    activeCheck = false;
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.render('./students/new', {
      validationErrors,
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      newUserFirstName,
      newUserLastName,
      newUserEmail,
      newUserParent,
      gradesValues,
    });
  }

  try {
    const userFromDb = await User.findOne({ email: newUserEmail });
    if (userFromDb) {
      validationErrors.userEmailErrors = [
        'Erro! Este usuário já está cadastrado!',
      ];
      return res.render('./students/new', {
        validationErrors,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        newUserFirstName,
        newUserLastName,
        newUserEmail,
        newUserParent,
        gradesValues,
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
      active: activeCheck,
    }).then((userFromDb) => {
      User.findOneAndUpdate(
        {
          _id: newUserParent,
          role: 'parent',
        },
        { $push: { children: userFromDb._id } },
        { new: true }
      )
        .then((parentFromDb) => {
          if (parentFromDb) {
            return res.redirect('/parents/' + parentFromDb._id);
          } else {
            return res.redirect('/students');
          }
        })
        .catch((error) => console.log(error));
    });
  } catch (error) {
    console.log('Erro em POST new/student ===> ', error);
  }
});

router.get('/teacher', (req, res) => {
  res.render('./teachers/new', {
    currentUser: req.session.currentUser,
    isTeacher: req.session.currentUser.role === 'teacher',
    isParent: req.session.currentUser.role === 'parent',
  });
});

router.post('/teacher', async (req, res) => {
  const {
    newUserFirstName,
    newUserLastName,
    newUserEmail,
    newUserPassword,
    newUserActive,
  } = req.body;

  const validationErrors = validateSignup(
    newUserFirstName,
    newUserLastName,
    newUserEmail,
    newUserPassword
  );

  let activeCheck = true;

  if (!newUserActive) {
    activeCheck = false;
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.render('./teachers/new', {
      validationErrors,
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      isParent: req.session.currentUser.role === 'parent',
      newUserFirstName,
      newUserLastName,
      newUserEmail,
    });
  }

  try {
    const userFromDb = await User.findOne({ email: newUserEmail });
    if (userFromDb) {
      validationErrors.userEmailErrors = [
        'Erro! Este usuário já está cadastrado!',
      ];
      return res.render('./teachers/new', {
        validationErrors,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        isParent: req.session.currentUser.role === 'parent',
        newUserFirstName,
        newUserLastName,
        newUserEmail,
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
      role: 'teacher',
      creator: req.session.currentUser._id,
      first_login: true,
      active: activeCheck,
    }).then((userFromDb) => {
      return res.redirect('/teachers');
    });
  } catch (error) {
    console.log('Erro em POST new/teacher ===> ', error);
  }
});

router.get('/parent', (req, res) => {
  User.find({ role: 'student', active: true })
    .then((students) => {
      const mongoDbObject = [];
      students.forEach((element) => {
        mongoDbObject.push(element.toJSON());
      });
      const studentsFromDB = [...mongoDbObject];
      let gradeIndex = 0;
      const gradesValues = [...orderedGradesValues];
      for (let i = 0; i < studentsFromDB.length; i++) {
        gradeIndex = gradesValues.findIndex((option) => {
          return option.value === studentsFromDB[i].grade;
        });
        studentsFromDB[i].grade_text = gradesValues[gradeIndex].text;
        studentsFromDB[i].grade_order = gradesValues[gradeIndex].order;
      }
      const sortedStudentList = studentsFromDB.sort(
        (a, b) => a.grade_order - b.grade_order
      );
      res.render('./parents/new', {
        currentUser: req.session.currentUser,
        studentId: req.query.studentId,
        isTeacher: req.session.currentUser.role === 'teacher',
        students: sortedStudentList,
      });
    })
    .catch((e) => {
      console.log('Erro em GET new/parent ===> ', e);
    });
});

router.post('/parent', async (req, res) => {
  const {
    newParentFirstName,
    newParentLastName,
    newParentEmail,
    newParentPassword,
    newParentStudent,
    newParentActive,
  } = req.body;

  let activeCheck = true;

  if (!newParentActive) {
    activeCheck = false;
  }

  const validationErrors = validateSignup(
    newParentFirstName,
    newParentLastName,
    newParentEmail,
    newParentPassword
  );

  if (Object.keys(validationErrors).length > 0) {
    return res.render('./parents/new', {
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
      validationErrors.userEmailErrors = [
        'Erro! Este usuário já está cadastrado!',
      ];
      return res.render('./parents/new', {
        validationErrors,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        newParentFirstName,
        newParentLastName,
        newParentEmail,
        newParentStudent,
      });
    }

    // Finding child in the database

    const child = await User.findOne({
      _id: newParentStudent,
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
      active: activeCheck,
      first_login: true,
    });
    if (child) {
      return res.redirect('/students/' + child._id);
    } else {
      return res.redirect('/parents');
    }
  } catch (error) {
    console.log('Erro em POST new/parent ===> ', error);
  }
});

router.get('/course', (req, res) => {
  User.find({ role: 'teacher' })
    .sort({ firstName: 1 })
    .then((teachers) => {
      res.render('./courses/new', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        teachers,
        gradesValues: orderedGradesValues,
      });
    })
    .catch((e) => {
      console.log('Erro em GET new/course ===> ', e);
    });
});

router.post('/course', fileUploader.single('courseImage'), async (req, res) => {
  const {
    newCourseCode,
    newCourseName,
    newCourseDescription,
    newCourseGrade,
    newCourseTeacher,
    newCourseActive,
  } = req.body;

  let activeCheck = true;
  if (!newCourseActive) {
    activeCheck = false;
  }
  const teachers = await User.find({ role: 'teacher' })
    .sort({ firstName: 1 })
    .then()
    .catch((e) => {
      console.log('There has been an error while finding teachers ===> ', e);
    });
  if (!newCourseName || !newCourseDescription || !newCourseCode) {
    return res.render('./courses/new', {
      codeError: newCourseCode
        ? null
        : 'Campo obrigatório! Escolha um campo único',
      nameError: newCourseName ? null : 'Campo obrigatório!',
      descriptionError: newCourseDescription ? null : 'Campo obrigatório!',
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      teachers,
      gradesValues: orderedGradesValues,
      newCourseName,
      newCourseCode,
      newCourseDescription,
    });
  }
  try {
    const courseFromDb = await Course.findOne({ code: newCourseCode });
    if (courseFromDb) {
      return res.render('./courses/new', {
        codeError: 'Erro! Este código já existe!',
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        teachers,
        gradesValues: orderedGradesValues,
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
      active: activeCheck,
    };

    if (req.file) {
      newCourse.image = req.file.path;
    }
    await Course.create(newCourse);

    res.redirect('/courses');
  } catch (error) {
    console.log('Erro em POST new/course ===> ', error);
  }
});

router.get('/career', (req, res) => {
  res.render('./careers/new', {
    currentUser: req.session.currentUser,
    isTeacher: req.session.currentUser.role === 'teacher',
  });
});

router.post('/career', fileUploader.single('careerImage'), async (req, res) => {
  const { newCareerName, newCareerDescription } = req.body;

  if (!newCareerName || !newCareerDescription) {
    return res.render('./careers/new', {
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
    console.log('Erro em POST new/career ===> ', error);
  }
});

module.exports = router;
