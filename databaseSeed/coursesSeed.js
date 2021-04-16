const coursesToAdd = [
  {
    name: 'Língua Portuguesa',
    description: 'O ensino da língua portuguesa é chave para xyz',
    grade: '1EM',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Matemática',
    description: 'O ensino da matemática é chave para xyz',
    grade: '1EM',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Biologia',
    description: 'O ensino da biologia é chave para xyz',
    grade: '1EM',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Física',
    description: 'O ensino da física é chave para xyz',
    grade: '1EM',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Química',
    description: 'O ensino da química é chave para xyz',
    grade: '1EM',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Filosofia',
    description: 'O ensino da filosofia é chave para xyz',
    grade: '1EM',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Inglês',
    description: 'O ensino do inglês é chave para xyz',
    grade: '1EM',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Geografia',
    description: 'O ensino da geografia é chave para xyz',
    grade: '1EM',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'História',
    description: 'O ensino da história é chave para xyz',
    grade: '1EM',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Sociologia',
    description: 'O ensino da história é chave para xyz',
    grade: '1EM',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Educação Física',
    description: 'O ensino da educação física é chave para xyz',
    grade: '1EM',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Educação Artística',
    description: 'O ensino da educação artística é chave para xyz',
    grade: '1EM',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
  {
    name: 'Literatura',
    description: 'O ensino da literatura é chave para xyz',
    grade: '1EM',
    image:
      'https://image.freepik.com/free-photo/school-boy-yellow-shirt-taking-virtual-classes-raising-hand_23-2148766714.jpg',
    active: true,
  },
];

const mongoose = require('mongoose');
require('../config/mongodb.config');
const Course = require('../models/Course');

Course.create(coursesToAdd)
  .then((courses) => {
    console.log('Courses have been added to the database');
  })
  .catch((error) => {
    console.log(
      'There has been an error trying to add courses to the database ===> ',
      error
    );
  });
