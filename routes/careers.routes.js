const express = require('express');
const { format } = require('date-format-parse');

require('dotenv').config();

const router = express();

const Career = require('../models/Career');

const User = require('../models/User');

const fileUploader = require('../config/cloudinary.config');

router.get('/', (req, res) => {
  Career.find()
    .sort({ name: 1 })
    .then((careers) => {
      res.render('./careers/careers', {
        careers,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    })
    .catch((error) => {
      console.log('There has been an error ==> ', error);
    });
});

router.post('/', (req, res) => {
  const { careerName } = req.body;
  Career.find({ name: new RegExp(careerName, 'i') })
    .sort({ name: 1 })
    .then((careers) => {
      res.render('./careers/careers', {
        careers,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    })
    .catch((error) => {
      console.log('There has been an error ==> ', error);
    });
});

router.get('/new', (req, res) => {
  res.render('new/career', {
    currentUser: req.session.currentUser,
    isTeacher: req.session.currentUser.role === 'teacher',
  });
});

router.post('/new', fileUploader.single('careerImage'), async (req, res) => {
  const { careerName, careerDescription } = req.body;
  const newCareer = {
    name: careerName,
    description: careerDescription,
    creator: req.session.currentUser._id,
  };
  if (req.file) {
    newCareer.image = req.file.path;
  }
  await Career.create(newCareer)
    .then(() => {
      res.redirect('/careers');
    })
    .catch((error) => console.log(error));
});

router.get('/:careerId', (req, res) => {
  const { careerId } = req.params;

  Career.findOne({ _id: careerId })
    .then((career) => {
      res.render('careers/careerDetail', {
        career,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    })
    .catch(() => {
      res.render('not-found');
    });
});

router.post(
  '/:careerId/edit',
  fileUploader.single('careerImage'),
  (req, res) => {
    const { careerName, careerDescription } = req.body;
    const { careerId } = req.params;

    const editedCareer = {
      name: careerName,
      description: careerDescription,
    };

    if (req.file) {
      editedCareer.image = req.file.path;
    }

    Career.findOneAndUpdate({ _id: careerId }, editedCareer)
      .then(() => {
        res.redirect(`/careers/${careerId}`);
      })
      .catch((error) => {
        res.render('not-found');
      });
  }
);

router.post('/:careerId/delete', (req, res) => {
  const { careerId } = req.params;

  Career.findByIdAndDelete(careerId)
    .then(() => {
      res.redirect('/careers/');
    })
    .catch((error) => {
      console.log('Error deleting career ==>', error);
      res.render('not-found');
    });
});

module.exports = router;
