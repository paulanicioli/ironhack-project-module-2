const express = require('express');

const hbs = require('hbs');

const homeRoutes = require('./routes/home.routes');
const coursesRoutes = require('./routes/courses.routes');
const authRoutes = require('./routes/auth.routes');

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
hbs.registerPartials(__dirname + '/views/partials');

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

// catch 404 and render a not-found.hbs template
app.use((req, res, next) => {
  res.status(404);
  res.render('not-found', { layout: false });
});

app.use((err, req, res, next) => {
  console.error('ERROR', req.method, req.path, err);

  if (!res.headersSent) {
    res.status(500);
    res.render('error', { layout: false });
  }
});

app.listen(process.env.PORT, () => {
  console.log('App rodando na porta ', process.env.PORT);
});
