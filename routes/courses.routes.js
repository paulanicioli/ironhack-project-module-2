const express = require('express');
const { format } = require('date-format-parse');

require('dotenv').config();

const { orderedGradesValues } = require('../public/javascripts/dataComponents');

const router = express();

const Course = require('../models/Course');

const User = require('../models/User');

const fileUploader = require('../config/cloudinary.config');

router.get('/', (req, res) => {
  const { grade, teacher, active } = req.query;
  const userGrade = req.session.currentUser.grade;
  if (req.session.currentUser.role === 'student') {
    Course.find({ grade: userGrade, active: true })
      .populate('teacher')
      .sort({ name: 1 })
      .then((courses) => {
        const teachers = courses.map((element) => {
          return element.teacher;
        });
        const uniqueTeachers = [...new Set(teachers)];
        res.render('./courses/courses', {
          courses,
          currentUser: req.session.currentUser,
          gradesValues: orderedGradesValues,
          teachers: uniqueTeachers,
        });
      })
      .catch((error) => {
        console.log('There has been an error ==> ', error);
      });
  } else if (req.session.currentUser.role === 'teacher') {
    const searchExpression = {};
    if (grade) {
      searchExpression.grade = grade;
    }
    if (teacher) {
      searchExpression.teacher = teacher;
    }
    if (active) {
      searchExpression.active = active;
    }
    Course.find(searchExpression)
      .populate('teacher')
      .sort({ name: 1 })
      .then((courses) => {
        User.find({
          role: 'teacher',
          active: true,
          requires_approval: { $ne: true },
        })
          .sort({ firstName: 1 })
          .then((teachers) => {
            const teachersFullList = [];
            teachers.forEach((element) => {
              teachersFullList.push(element.toJSON());
            });
            let selectedTeacherName;
            const uniqueTeachers = [...teachersFullList];
            for (let i = 0; i < uniqueTeachers.length; i++) {
              uniqueTeachers[i].isSelected = uniqueTeachers[i]._id == teacher;
              if (uniqueTeachers[i].isSelected) {
                selectedTeacherName = uniqueTeachers[i].firstName;
              }
            }
            const gradesValues = [...orderedGradesValues];
            let gradeSelectedName;
            for (let i = 0; i < gradesValues.length; i++) {
              gradesValues[i].isSelected = gradesValues[i].value === grade;
              if (gradesValues[i].isSelected) {
                gradeSelectedName = gradesValues[i].text;
              }
            }
            let statusSelection;
            let statusName;
            let isActive;
            if (typeof active !== 'undefined') {
              statusSelection = true;
              statusName = active === 'true' ? 'Ativos' : 'Desativados';
              isActive = active === 'true' ? true : false;
            }
            res.render('./courses/courses', {
              courses,
              currentUser: req.session.currentUser,
              isTeacher: req.session.currentUser.role === 'teacher',
              gradesValues,
              teachers: uniqueTeachers,
              gradeSelection: grade,
              teacherSelection: selectedTeacherName,
              statusSelection,
              statusName,
              isActive,
            });
          });
      })
      .catch((error) => {
        console.log('There has been an error ==> ', error);
      });
  } else {
    res.render('not-found', {
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
    });
  }
});

router.post('/', (req, res) => {
  const { courseName } = req.body;
  Course.find({ name: new RegExp(courseName, 'i') })
    .populate('teacher')
    .sort({ name: 1 })
    .then((courses) => {
      return res.render('./courses/courses', {
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
    .populate('teacher')
    .then((courseFromDatabase) => {
      const gradesValues = [...orderedGradesValues];
      if (courseFromDatabase.grade) {
        const gradeIndex = gradesValues.findIndex((option) => {
          return option.value === courseFromDatabase.grade;
        });
        const foundGradeValue = gradesValues[gradeIndex];

        gradesValues.splice(gradeIndex, 1);

        gradesValues.unshift(foundGradeValue);
      }
      User.find({
        role: 'teacher',
        active: true,
        requires_approval: { $ne: true },
      })
        .sort({ firstName: 1 })
        .then((teachers) => {
          if (courseFromDatabase.teacher) {
            const teacherIndex = teachers.findIndex((element) => {
              return element.email === courseFromDatabase.teacher.email;
            });
            if (teacherIndex >= 0) {
              const foundTeacher = teachers[teacherIndex];
              teachers.splice(teacherIndex, 1);
              teachers.unshift(foundTeacher);
            }
          }
          res.render('./courses/courseDetail', {
            course: courseFromDatabase,
            teachers,
            gradesValues,
            currentUser: req.session.currentUser,
            isTeacher: req.session.currentUser.role === 'teacher',
          });
        })
        .catch((error) => {
          console.log(
            'There has been an error while finding teachers ===> ',
            error
          );
        });
    })
    .catch((e) => {
      console.log('There has been an error finding the course ===> ', e);
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    });
});

router.post(
  '/:courseId/edit',
  fileUploader.single('courseImage'),
  async (req, res) => {
    const {
      courseCode,
      courseName,
      courseGrade,
      courseDescription,
      courseTeacher,
      courseActive,
    } = req.body;

    let activeCheck = true;
    if (!courseActive) {
      activeCheck = false;
    }

    const { courseId } = req.params;

    try {
      const preExistingCode = await Course.findOne({
        code: courseCode,
        _id: { $ne: courseId },
      });
      if (preExistingCode) {
        return res.redirect('./courses/' + courseId);
      }

      const editedCourse = {
        code: courseCode,
        name: courseName,
        description: courseDescription,
        grade: courseGrade,
        teacher: courseTeacher,
        active: activeCheck,
      };

      if (req.file) {
        editedCourse.image = req.file.path;
      }

      await Course.findOneAndUpdate({ _id: courseId }, editedCourse)
        .then(() => {
          res.redirect('/courses/' + courseId);
        })
        .catch((error) => {
          console.log('Error editing Course information ==>', error);
          res.render('not-found', {
            currentUser: req.session.currentUser,
            isTeacher: req.session.currentUser.role === 'teacher',
          });
        });
    } catch (error) {
      console.log('Error in Course editing flow ===> ', error);
    }
  }
);

router.post('/:courseId/delete', (req, res) => {
  const { courseId } = req.params;

  Course.findByIdAndDelete(courseId)
    .then(() => {
      res.redirect('/courses/');
    })
    .catch((error) => {
      console.log('Error deleting course ==>', error);
      res.render('not-found', {
        currentUser: req.session.currentUser,
        isTeacher: req.session.currentUser.role === 'teacher',
      });
    });
});

module.exports = router;
