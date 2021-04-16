const {
  firstNameValidation,
  lastNameValidation,
  passwordValidation,
  emailValidation,
  dateValidation,
} = require('./fields.validation');

const validateSignup = (firstName, lastName, email, password) => {
  const errorsObj = {};

  const userFirstNameErrors = firstNameValidation(firstName);
  if (userFirstNameErrors.length > 0) {
    errorsObj.userFirstNameErrors = userFirstNameErrors;
  }

  const userLastNameErrors = lastNameValidation(lastName);
  if (userLastNameErrors.length > 0) {
    errorsObj.userLastNameErrors = userLastNameErrors;
  }

  const userEmailErrors = emailValidation(email);
  if (userEmailErrors.length > 0) {
    errorsObj.userEmailErrors = userEmailErrors;
  }

  const userPasswordErrors = passwordValidation(password);
  if (userPasswordErrors.length > 0) {
    errorsObj.userPasswordErrors = userPasswordErrors;
  }
  return errorsObj;
};

module.exports = {
  validateSignup,
};

// const userBirthDateErrors = dateValidation(birthDate);
//   if (userBirthDateErrors.length > 0) {
//     errorsObj.userBirthDateErrors = userBirthDateErrors;
//   }
