const express = require('express');
const { format } = require('date-format-parse');

require('dotenv').config();

const router = express();

const Course = require('../models/Course');

const User = require('../models/User');

const fileUploader = require('../config/cloudinary.config');

router.get('/', (req, res) => {
  if (req.session.currentUser.role === 'student') {
    const userGrade = req.session.currentUser.grade;
    Course.find({ grade: userGrade })
      .sort({ name: 1 })
      .then((courses) => {
        res.render('./courses/courses', {
          courses,
          currentUser: req.session.currentUser,
        });
      })
      .catch((error) => {
        console.log('There has been an error ==> ', error);
      });
  }
});

router.post('/', (req, res) => {
  const { courseName } = req.body;
  Course.find({ name: new RegExp(courseName, 'i') })
    .sort({ name: 1 })
    .then((courses) => {
      res.render('./courses/courses', {
        courses,
        currentUser: req.session.currentUser,
      });
    })
    .catch((error) => {
      console.log('There has been an error ==> ', error);
    });
});

router.get('/new', (req, res) => {
  res.render('newCourse', { currentUser: req.session.currentUser });
});

router.post('/new', fileUploader.single('courseImage'), (req, res) => {
  const { courseName, courseDescription, courseGrade } = req.body;
  const newCourse = {
    name: courseName,
    image: req.file.path,
    grade: courseGrade,
    description: courseDescription,
    creator: req.session.currentUser._id,
  };
  Course.create(newCourse)
    .then(() => {
      res.redirect('/courses');
    })
    .catch((error) => console.log(error));
});

router.get('/:courseId', (req, res) => {
  const { courseId } = req.params;

  Course.findOne({ _id: courseId, owner: req.session.currentUser._id })
    .populate('owner')
    .then((courseFromDatabase) => {
      const mongoDbObject = courseFromDatabase.toJSON();

      const newObject = { ...mongoDbObject, birthDate: birthDateFormatted };

      const speciesValues = [
        { value: 'dog', text: 'Cachorro' },
        { value: 'cat', text: 'Gato' },
        { value: 'parrot', text: 'Papagaio' },
      ];

      const petIndex = speciesValues.findIndex((speciesOption) => {
        return speciesOption.value === newObject.species;
      });

      const foundSpeciesValue = speciesValues[petIndex];

      speciesValues.splice(petIndex, 1);

      speciesValues.unshift(foundSpeciesValue);

      res.render('courseDetail', {
        pet: newObject,
        speciesValues,
        currentUser: req.session.currentUser,
      });
    })
    .catch(() => {
      res.render('not-found');
    });
});

router.post('/edit/:courseId', (req, res) => {
  const { petName, petImage, petSpecies, petBirthDate } = req.body;
  const { petId } = req.params;

  Course.findAndUpdate(
    { _id: petId, owner_id: req.session.currentUser._id },
    {
      name: petName,
      image: petImage,
      species: petSpecies,
      birthDate: new Date(petBirthDate),
    }
  )
    .then(() => {
      res.redirect(`/pets/${petId}`);
    })
    .catch((error) => {
      console.log('Error editing Pet information ==>', error);
      res.render('not-found');
    });
});

module.exports = router;
