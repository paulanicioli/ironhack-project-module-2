const express = require('express');
const { format } = require('date-format-parse');

require('dotenv').config();
const {
  orderedGradesValues,
  orderedGenderValues,
} = require('../public/javascripts/dataComponents');

const router = express();

const User = require('../models/User');
const Course = require('../models/Course');

const fileUploader = require('../config/cloudinary.config');

router.get('/', (req, res) => {
  User.find({ role: 'teacher', requires_approval: { $ne: true } })
    .sort({ firstName: 1 })
    .then((teachers) => {
      res.render('./teachers/teachers', {
        teachers,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        isParent: req.session.currentUser.role === 'parent',
        isStudent: req.session.currentUser.role === 'student',
      });
    })
    .catch((error) => {
      console.log('Error in GET /teachers ==> ', error);
    });
});

router.post('/', (req, res) => {
  const { teacherName } = req.body;
  User.find({
    role: 'teacher',
    firstName: new RegExp(teacherName, 'i'),
    requires_approval: { $ne: true },
  })
    .sort({ firstName: 1 })
    .then((teachers) => {
      res.render('./teachers/teachers', {
        teachers,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        isParent: req.session.currentUser.role === 'parent',
        isStudent: req.session.currentUser.role === 'student',
      });
    })
    .catch((error) => {
      console.log('Error in POST /teachers ==> ', error);
    });
});

router.get('/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  User.findOne({ _id: teacherId, role: 'teacher' })
    .then((teacherFromDatabase) => {
      const birthDateFormatted = format(
        teacherFromDatabase.birthDate,
        'YYYY-MM-DD'
      );
      Course.find({
        teacher: teacherId,
        active: true,
      })
        .sort({ name: 1 })
        .then((courses) => {
          res.render('./teachers/teacherDetail', {
            teacher: teacherFromDatabase,
            courses,
            birthDateFormatted,
            currentUser: req.session.currentUser,
            isTeacher: req.session.currentUser.role === 'teacher',
            isStudent: req.session.currentUser.role === 'student',
            isParent: req.session.currentUser.role === 'parent',
          });
        })
        .catch((e) => {
          console.log(
            'Error trying to find courses in GET /:teacherId ===> ',
            e
          );
        });
    })
    .catch((error) => {
      console.log(
        'Error trying to find teacher in GET /:teacherId ===> ',
        error
      );
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        isStudent: req.session.currentUser.role === 'student',
        isParent: req.session.currentUser.role === 'parent',
      });
    });
});

router.post('/:teacherId/edit', (req, res) => {
  const { teacherId } = req.params;
  const {
    teacherFirstName,
    teacherLastName,
    teacherEmail,
    teacherBirthDate,
    teacherActive,
  } = req.body;

  let activeCheck = true;
  if (!teacherActive) {
    activeCheck = false;
  }
  const editedTeacher = {
    firstName: teacherFirstName,
    lastName: teacherLastName,
    email: teacherEmail,
    birthDate: teacherBirthDate,
    active: activeCheck,
  };

  User.findOneAndUpdate({ _id: teacherId, role: 'teacher' }, editedTeacher)
    .then((teacherFromDatabase) => {
      res.redirect('/teachers/' + teacherId);
    })
    .catch((error) => {
      console.log(
        'Error trying to update teacher in POST /:teacherId/edit ===> ',
        error
      );
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        isParent: req.session.currentUser.role === 'parent',
        isStudent: req.session.currentUser.role === 'student',
      });
    });
});

router.post('/:teacherId/delete', async (req, res) => {
  const { teacherId } = req.params;

  User.findOneAndDelete({ _id: teacherId, role: 'teacher' })
    .then((deletedTeacher) => {
      Course.updateMany(
        {
          teacher: deletedTeacher._id,
        },
        {
          teacher: null,
        }
      )
        .then(() => {
          res.redirect('/teachers/');
        })
        .catch((e) => {
          console.log('Error trying to delete teacherId from courses ===> ', e);
        });
    })
    .catch((error) => {
      console.log('Error in POST /:teacherId/delete ===>', error);
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        isParent: req.session.currentUser.role === 'parent',
        isStudent: req.session.currentUser.role === 'student',
      });
    });
});

// router.post('/:teacherId/course', (req, res) => {
//   const { teacherId } = req.params;
//   const { teacherCourse } = req.body;
//   User.findOneAndUpdate(
//     { _id: studentParent, role: 'parent' },
//     { $push: { children: studentId } },
//     { new: true }
//   )
//     .then((editedParent) => {
//       res.redirect('/students/' + studentId);
//     })
//     .catch(() => {
//       res.render('not-found', {
//         currentUser: req.session.currentUser,
//         isTeacher: req.session.currentUser.role === 'teacher',
//       });
//     });
// });

module.exports = router;
