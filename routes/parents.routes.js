const express = require('express');
const { format } = require('date-format-parse');

require('dotenv').config();
const { orderedGradesValues } = require('../public/javascripts/dataComponents');

const router = express();

const User = require('../models/User');

const fileUploader = require('../config/cloudinary.config');

router.get('/', (req, res) => {
  User.find({ role: 'parent' })
    .sort({ name: 1 })
    .populate('children')
    .then((parents) => {
      res.render('./parents/parents', {
        parents,
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
  const { parentName } = req.body;
  User.find({ role: 'parent', firstName: new RegExp(parentName, 'i') })
    .populate('children')
    .sort({ name: 1 })
    .then((parents) => {
      res.render('./parents/parents', {
        parents,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    })
    .catch((error) => {
      console.log('There has been an error ==> ', error);
    });
});

router.get('/:parentId', (req, res) => {
  const { parentId } = req.params;
  User.findOne({ _id: parentId, role: 'parent' })
    .populate('children')
    .then((parentFromDatabase) => {
      let birthDateFormatted;
      if (parentFromDatabase.birthDate) {
        birthDateFormatted = format(parentFromDatabase.birthDate, 'YYYY-MM-DD');
      }
      User.find({
        role: 'student',
        active: true,
        requires_approval: { $ne: true },
      })
        .sort({ grade: 1, firstName: 1 })
        .then((studentsList) => {
          res.render('./parents/parentDetail', {
            parent: parentFromDatabase,
            birthDateFormatted,
            studentsList,
            currentUser: req.session.currentUser,
            isTeacher: req.session.currentUser.role === 'teacher',
          });
        })
        .catch((e) => {
          console.log(e);
        });
    })
    .catch(() => {
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    });
});

router.post('/:parentId/edit', (req, res) => {
  const { parentId } = req.params;
  const {
    parentFirstName,
    parentLastName,
    parentEmail,
    parentBirthDate,
  } = req.body;

  const editedParent = {
    firstName: parentFirstName,
    lastName: parentLastName,
    email: parentEmail,
    birthDate: parentBirthDate,
  };

  User.findOneAndUpdate({ _id: parentId, role: 'parent' }, editedParent)
    .then((parentFromDatabase) => {
      res.redirect('/parents/' + parentId);
    })
    .catch(() => {
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    });
});

router.post('/:parentId/delete', (req, res) => {
  const { parentId } = req.params;

  User.findOneAndDelete({ _id: parentId, role: 'parent' })
    .then(() => {
      res.redirect('/parents/');
    })
    .catch(() => {
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    });
});

router.post('/:parentId/child', (req, res) => {
  const { parentId } = req.params;
  const { parentChild } = req.body;

  User.findOneAndUpdate(
    { _id: parentId, role: 'parent' },
    { $push: { children: parentChild } }
  )
    .then(() => {
      res.redirect('/parents/' + parentId);
    })
    .catch(() => {
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    });
});

module.exports = router;
