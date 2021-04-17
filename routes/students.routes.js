const express = require('express');
const { format } = require('date-format-parse');

require('dotenv').config();
const { gradesValues } = require('../public/javascripts/dataComponents');

const router = express();

const User = require('../models/User');

const fileUploader = require('../config/cloudinary.config');

router.get('/', (req, res) => {
  User.find({ role: 'student' })
    .sort({ name: 1 })
    .then((students) => {
      res.render('./students/students', {
        students,
        gradesValues,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    })
    .catch((error) => {
      console.log('There has been an error ==> ', error);
    });
});

router.post('/', (req, res) => {
  const { studentName } = req.body;
  User.find({ role: 'student', firstName: new RegExp(studentName, 'i') })
    .sort({ name: 1 })
    .then((students) => {
      res.render('./students/students', {
        students,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    })
    .catch((error) => {
      console.log('There has been an error ==> ', error);
    });
});

router.get('/:studentId', async (req, res) => {
  const { studentId } = req.params;
  await User.findOne({ _id: studentId, role: 'student' })
    .then((studentFromDatabase) => {
      const gradeIndex = gradesValues.findIndex((option) => {
        return option.value === studentFromDatabase.grade;
      });

      const birthDateFormatted = format(
        studentFromDatabase.birthDate,
        'YYYY-MM-DD'
      );

      const foundGradeValue = gradesValues[gradeIndex];

      gradesValues.splice(gradeIndex, 1);

      gradesValues.unshift(foundGradeValue);

      User.find({
        children: { $elemMatch: { $eq: studentId } },
        role: 'parent',
      })
        .then((parents) => {
          res.render('./students/studentDetail', {
            student: studentFromDatabase,
            gradesValues,
            parents,
            birthDateFormatted,
            currentUser: req.session.currentUser,
            isTeacher: req.session.currentUser.role === 'teacher',
          });
        })
        .catch((e) => {
          console.log('Error trying to find parents ===> ', e);
        });
    })
    .catch(() => {
      res.render('not-found');
    });
});

router.post(
  '/:studentId/edit',
  fileUploader.single('studentImage'),
  (req, res) => {
    const { studentId } = req.params;
    const {
      studentFirstName,
      studentLastName,
      studentEmail,
      studentGrade,
      studentBirthDate,
    } = req.body;

    const editedStudent = {
      firstName: studentFirstName,
      lastName: studentLastName,
      email: studentEmail,
      grade: studentGrade,
      birthDate: studentBirthDate,
    };

    if (req.file) {
      editedStudent.profilePicture = req.file.path;
    }

    User.findOneAndUpdate({ _id: studentId, role: 'student' }, editedStudent)
      .then((studentFromDatabase) => {
        res.redirect('/students/' + studentId);
      })
      .catch(() => {
        res.render('not-found');
      });
  }
);

router.post('/:studentId/delete', (req, res) => {
  const { studentId } = req.params;

  User.findOneAndDelete({ _id: studentId, role: 'student' })
    .then(() => {
      res.redirect('/students/');
    })
    .catch(() => {
      res.render('not-found');
    });
});

module.exports = router;
