const express = require('express');
const { format } = require('date-format-parse');

require('dotenv').config();

const router = express();

const Course = require('../models/Course');

const User = require('../models/User');

const fileUploader = require('../config/cloudinary.config');

router.get('/', (req, res) => {
  const userGrade = req.session.currentUser.grade;
  if (req.session.currentUser.role === 'student') {
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
  } else if (req.session.currentUser.role === 'teacher') {
    Course.find({})
      .sort({ name: 1 })
      .then((courses) => {
        res.render('./courses/courses', {
          courses,
          currentUser: req.session.currentUser,
          isTeacher: req.session.currentUser.role === 'teacher',
        });
      })
      .catch((error) => {
        console.log('There has been an error ==> ', error);
      });
  } else {
    res.render('not-found');
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
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    })
    .catch((error) => {
      console.log('There has been an error ==> ', error);
    });
});

router.get('/new', (req, res) => {
  res.render('newCourse', {
    currentUser: req.session.currentUser,
    isTeacher: req.session.currentUser.role === 'teacher',
  });
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

  Course.findOne({ _id: courseId })
    .then((courseFromDatabase) => {
      res.render('./courses/courseDetail', {
        course: courseFromDatabase,
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    })
    .catch(() => {
      res.render('not-found');
    });
});

router.post(
  '/:courseId/edit',
  fileUploader.single('courseImage'),
  (req, res) => {
    const {
      courseName,
      courseGrade,
      courseDescription,
      courseTeacher,
    } = req.body;
    const { courseId } = req.params;

    Course.findAndUpdate(
      { _id: courseId },
      {
        name: courseName,
        description: courseDescription,
        image: req.file.path,
        grade: courseGrade,
        teacher: courseTeacher,
      }
    )
      .then(() => {
        res.redirect(`/courses/${courseId}`);
      })
      .catch((error) => {
        console.log('Error editing Course information ==>', error);
        res.render('not-found');
      });
  }
);

module.exports = router;
