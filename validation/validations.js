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

const validatePasswords = (currentPassword, newPassword) => {
  const errorsObj = {};

  const currentPasswordError = passwordValidation(currentPassword);
  if (currentPasswordError.length > 0) {
    errorsObj.currentPasswordError = currentPasswordError[0];
  }

  const newPasswordError = passwordValidation(newPassword);
  if (newPasswordError.length > 0) {
    errorsObj.newPasswordError = newPasswordError[0];
  }

  return errorsObj;
};

module.exports = {
  validateSignup,
  validatePasswords,
};

// const userBirthDateErrors = dateValidation(birthDate);
//   if (userBirthDateErrors.length > 0) {
//     errorsObj.userBirthDateErrors = userBirthDateErrors;
//   }
