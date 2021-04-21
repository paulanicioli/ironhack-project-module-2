const express = require('express');
const { format } = require('date-format-parse');

require('dotenv').config();
const { gradesValues } = require('../public/javascripts/dataComponents');

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
  const { parentName } = req.body;
  User.find({ role: 'parent', firstName: new RegExp(parentName, 'i') })
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

router.get('/:parentId', async (req, res) => {
  const { parentId } = req.params;
  await User.findOne({ _id: parentId, role: 'parent' })
    .populate('children')
    .then((parentFromDatabase) => {
      let birthDateFormatted = '1900-01-01';
      if (parentFromDatabase.birthDate) {
        birthDateFormatted = format(parentFromDatabase.birthDate, 'YYYY-MM-DD');
      }
      res.render('./parents/parentDetail', {
        parent: parentFromDatabase,
        birthDateFormatted,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    })
    .catch(() => {
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    });
});

router.post(
  '/:parentId/edit',
  fileUploader.single('parentImage'),
  (req, res) => {
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

    if (req.file) {
      editedParent.profilePicture = req.file.path;
    }

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
  }
);

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

module.exports = router;
