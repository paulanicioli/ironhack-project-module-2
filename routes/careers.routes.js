const express = require('express');
const { format } = require('date-format-parse');

require('dotenv').config();

const router = express();

const Career = require('../models/Career');

const User = require('../models/User');

const fileUploader = require('../config/cloudinary.config');

router.get('/', (req, res) => {
  if (req.session.currentUser.role === 'student') {
    Career.find()
      .sort({ name: 1 })
      .then((careers) => {
        res.render('./careers/careers', {
          careers,
          currentUser: req.session.currentUser,
        });
      })
      .catch((error) => {
        console.log('There has been an error ==> ', error);
      });
  }
});

router.post('/', (req, res) => {
  const { careerName } = req.body;
  Career.find({ name: new RegExp(careerName, 'i') })
    .sort({ name: 1 })
    .then((careers) => {
      res.render('./careers/careers', {
        careers,
        currentUser: req.session.currentUser,
      });
    })
    .catch((error) => {
      console.log('There has been an error ==> ', error);
    });
});

router.get('/new', (req, res) => {
  res.render('newCareer', { currentUser: req.session.currentUser });
});

router.post('/new', fileUploader.single('careerImage'), (req, res) => {
  const { careerName, careerDescription } = req.body;
  const newCareer = {
    name: careerName,
    image: req.file.path,
    description: careerDescription,
    creator: req.session.currentUser._id,
  };
  Career.create(newCareer)
    .then(() => {
      res.redirect('/careers');
    })
    .catch((error) => console.log(error));
});

router.get('/:careerId', (req, res) => {
  const { careerId } = req.params;

  Career.findOne({ _id: careerId, owner: req.session.currentUser._id })
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
