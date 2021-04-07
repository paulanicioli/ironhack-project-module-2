const {
  nameValidation,
  passwordValidation,
  emailValidation,
  dateValidation,
} = require('./fields.validation');

const validateSignup = (name, email, password, birthDate) => {
  const errorsObj = {};

  const userNameErrors = nameValidation(name);
  if (userNameErrors.length > 0) {
    errorsObj.userNameErrors = userNameErrors;
  }

  const userEmailErrors = emailValidation(email);
  if (userEmailErrors.length > 0) {
    errorsObj.userEmailErrors = userEmailErrors;
  }

  const userPasswordErrors = passwordValidation(password);
  if (userPasswordErrors.length > 0) {
    errorsObj.userPasswordErrors = userPasswordErrors;
  }

  const userBirthDateErrors = dateValidation(birthDate);
  if (userBirthDateErrors.length > 0) {
    errorsObj.userBirthDateErrors = userBirthDateErrors;
  }

  return errorsObj;
};

module.exports = {
  validateSignup,
};
