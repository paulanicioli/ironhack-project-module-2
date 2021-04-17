const careersToAdd = [
  {
    name: 'Engenharia',
    description: 'Engenharia é XYZ',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Medicina',
    description: 'Medicina é XYZ',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Direito',
    description: 'Direito é XYZ',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Ciência da Computação',
    description: 'Ciência da Computação é XYZ',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Letras',
    description: 'Letras é XYZ',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
];

const mongoose = require('mongoose');
require('../config/mongodb.config');
require('dotenv').config();
const Career = require('../models/Career');

Career.create(careersToAdd)
  .then((careers) => {
    console.log('Careers have been added to the database');
    mongoose.disconnect();
  })
  .catch((error) => {
    console.log(
      'There has been an error trying to add careers to the database ===> ',
      error
    );
  });
