const express = require('express');

const hbs = require('hbs');

const homeRoutes = require('./routes/home.routes');
const studentRoutes = require('./routes/students.routes');
const parentRoutes = require('./routes/parents.routes');
const coursesRoutes = require('./routes/courses.routes');
const careerRoutes = require('./routes/careers.routes');
const childrenRoutes = require('./routes/children.routes');
const authRoutes = require('./routes/auth.routes');
const newRoutes = require('./routes/new.routes');

const cookieParser = require('cookie-parser');

const app = express();

require('./config/mongodb.config');

require('dotenv').config();

app.use(express.static('public'));

app.use(cookieParser());
const sessionConfig = require('./config/session.config');

sessionConfig(app);

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// ROTAS PÚBLICAS

app.use('/', homeRoutes);
app.use('/', authRoutes);

app.use((req, res, next) => {
  if (req.session.currentUser) {
    return next();
  }
  res.redirect('/login');
});

// ROTAS PROTEGIDAS

app.use('/courses', coursesRoutes);

app.use('/careers', careerRoutes);

app.use('/children', childrenRoutes);

// ROTAS PERMITIDAS APENAS PARA PROFESSORES

app.use((req, res, next) => {
  if (req.session.currentUser.role === 'teacher') {
    return next();
  }
  res.render('not-found', {
    currentUser: req.session.currentUser,
    isTeacher: req.session.currentUser.role === 'teacher',
  });
});

app.use('/students', studentRoutes);

app.use('/parents', parentRoutes);

app.use('/new', newRoutes);

// catch 404 and render a not-found.hbs template
app.use((req, res, next) => {
  res.status(404);
  res.render('not-found', {
    currentUser: req.session.currentUser,
    isTeacher: req.session.currentUser.role === 'teacher',
  });
});

app.use((err, req, res, next) => {
  console.error('ERROR', req.method, req.path, err);

  if (!res.headersSent) {
    res.status(500);
    res.render('error', {
      currentUser: req.session.currentUser,
      isTeacher: req.session.currentUser.role === 'teacher',
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log('App rodando na porta ', process.env.PORT);
});
