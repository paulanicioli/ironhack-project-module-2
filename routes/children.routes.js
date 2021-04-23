const express = require('express');
const { format } = require('date-format-parse');

const User = require('../models/User');

const router = express();

router.get('/', (req, res) => {
  if (req.session.currentUser.role !== 'parent') {
    return res.render('not-found', {
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      isStudent: req.session.currentUser.role === 'student',
      isParent: req.session.currentUser.role === 'parent',
    });
  }
  User.find({
    active: true,
    requires_approval: { $ne: true },
    _id: { $in: req.session.currentUser.children },
  })
    .then((children) => {
      res.render('./students/students', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        isStudent: req.session.currentUser.role === 'student',
        isParent: req.session.currentUser.role === 'parent',
        students: children,
      });
    })
    .catch((error) => {
      console.log('Error in GET /children ===> ', error);
    });
});

router.post('/', (req, res) => {
  const { studentName } = req.body;
  User.find({
    role: 'student',
    firstName: new RegExp(studentName, 'i'),
    requires_approval: { $ne: true },
    _id: { $in: req.session.currentUser.children },
  })
    .sort({ firstName: 1 })
    .then((students) => {
      res.render('./students/students', {
        students,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
        isParent: req.session.currentUser.role === 'parent',
      });
    })
    .catch((error) => {
      console.log('Error in POST /children ==> ', error);
    });
});

router.get('/:childId', (req, res) => {
  const { childId } = req.params;
  const isChild = req.session.currentUser.children.findIndex((element) => {
    return element._id === childId;
  });
  if (isChild < 0) {
    return res.render('not-found', {
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
      isStudent: req.session.currentUser.role === 'student',
      isParent: req.session.currentUser.role === 'parent',
    });
  }
  User.findOne({
    _id: childId,
    role: 'student',
    requires_approval: { $ne: true },
    active: true,
  })
    .then((studentFromDatabase) => {
      const birthDateFormatted = format(
        studentFromDatabase.birthDate,
        'YYYY-MM-DD'
      );
      User.find({
        role: 'parent',
        active: true,
        requires_approval: { $ne: true },
        children: { $elemMatch: { $eq: childId } },
      }).then((parents) => {
        res.render('./students/studentDetail', {
          currentUser: req.session.currentUser,
          isTeacher: req.session.currentUser.role === 'teacher',
          isStudent: req.session.currentUser.role === 'student',
          isParent: req.session.currentUser.role === 'parent',
          birthDateFormatted,
          student: studentFromDatabase,
          parents,
        });
      });
    })
    .catch((error) => {
      console.log('Error in GET /children/:childId ==> ', error);
    });
});

module.exports = router;
