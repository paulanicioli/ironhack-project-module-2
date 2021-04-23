const express = require('express');
const { format } = require('date-format-parse');

require('dotenv').config();
const {
  orderedGradesValues,
  orderedGenderValues,
} = require('../public/javascripts/dataComponents');

const router = express();

const User = require('../models/User');

const fileUploader = require('../config/cloudinary.config');

router.get('/', (req, res) => {
  User.find({ role: 'student', requires_approval: { $ne: true } })
    .sort({ firstName: 1 })
    .then((students) => {
      const newStudentArray = [];
      students.forEach((element) => {
        newStudentArray.push(element.toJSON());
      });
      const studentsWithGrade = [...newStudentArray];
      let gradeIndex = -1;
      for (let i = 0; i < studentsWithGrade.length; i++) {
        gradeIndex = orderedGradesValues.findIndex((option) => {
          return option.value === studentsWithGrade[i].grade;
        });
        studentsWithGrade[i].grade_text = orderedGradesValues[gradeIndex].text;
      }
      res.render('./students/students', {
        students: studentsWithGrade,
        gradesValues: orderedGradesValues,
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
  User.find({
    role: 'student',
    firstName: new RegExp(studentName, 'i'),
    requires_approval: { $ne: true },
  })
    .sort({ firstName: 1 })
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

router.get('/:studentId', (req, res) => {
  const { studentId } = req.params;
  User.findOne({ _id: studentId, role: 'student' })
    .then((studentFromDatabase) => {
      const gradesValues = [...orderedGradesValues];
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
        active: true,
        requires_approval: { $ne: true },
      })
        .sort({ firstName: 1 })
        .then((parents) => {
          User.find({
            role: 'parent',
            active: true,
            requires_approval: { $ne: true },
          })
            .sort({ firstName: 1 })
            .then((parentsList) => {
              res.render('./students/studentDetail', {
                student: studentFromDatabase,
                gradesValues,
                parents,
                parentsList,
                birthDateFormatted,
                currentUser: req.session.currentUser,
                isTeacher: req.session.currentUser.role === 'teacher',
              });
            });
        })
        .catch((e) => {
          console.log('Error trying to find parents ===> ', e);
        });
    })
    .catch(() => {
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    });
});

router.post('/:studentId/edit', (req, res) => {
  const { studentId } = req.params;
  const {
    studentFirstName,
    studentLastName,
    studentEmail,
    studentGrade,
    studentBirthDate,
    studentActive,
  } = req.body;

  let activeCheck = true;
  if (!studentActive) {
    activeCheck = false;
  }
  const editedStudent = {
    firstName: studentFirstName,
    lastName: studentLastName,
    email: studentEmail,
    grade: studentGrade,
    birthDate: studentBirthDate,
    active: activeCheck,
  };

  User.findOneAndUpdate({ _id: studentId, role: 'student' }, editedStudent)
    .then((studentFromDatabase) => {
      res.redirect('/students/' + studentId);
    })
    .catch(() => {
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    });
});

router.post('/:studentId/delete', async (req, res) => {
  const { studentId } = req.params;

  User.findOneAndDelete({ _id: studentId, role: 'student' })
    .then((deletedStudent) => {
      User.updateMany(
        {
          role: 'parent',
          children: { $elemMatch: { $eq: studentId } },
        },
        {
          $pull: { children: studentId },
        }
      )
        .then(() => {
          res.redirect('/students/');
        })
        .catch((e) => {
          console.log('Error trying to delete id from parents', e);
        });
    })
    .catch(() => {
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    });
});

router.post('/:studentId/parent', (req, res) => {
  const { studentId } = req.params;
  const { studentParent } = req.body;
  User.findOneAndUpdate(
    { _id: studentParent, role: 'parent' },
    { $push: { children: studentId } },
    { new: true }
  )
    .then((editedParent) => {
      res.redirect('/students/' + studentId);
    })
    .catch(() => {
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    });
});

module.exports = router;
