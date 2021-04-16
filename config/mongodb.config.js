const mongoose = require('mongoose');
require('dotenv').config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado com o banco de dados'))
  .catch((error) => {
    console.log(
      'There has been an error trying to connect to the database ===> ',
      error
    );
  });

module.exports;
