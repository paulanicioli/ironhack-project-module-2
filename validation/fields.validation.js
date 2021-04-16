const firstNameValidation = (nameField) => {
  const errors = [];

  if (typeof nameField !== 'string') {
    errors.push('Nome precisa ser um texto');
    return errors;
  }

  if (nameField.trim().length === 0) {
    errors.push('Campo não pode ser vazio');
  }

  if (nameField.trim().length < 3) {
    errors.push('Mínimo de 3 caracteres');
  }

  if (nameField.trim().length > 50) {
    errors.push('Máximo de 50 caracteres');
  }

  if (nameField.replace(/[A-Za-z]/g, '').trim().length !== 0) {
    errors.push('Somente letras são aceitas');
  }

  return errors;
};

const lastNameValidation = (nameField) => {
  const errors = [];

  if (typeof nameField !== 'string') {
    errors.push('Nome precisa ser um texto');
    return errors;
  }

  if (nameField.trim().length === 0) {
    errors.push('Campo não pode ser vazio');
  }

  if (nameField.trim().length < 3) {
    errors.push('Mínimo de 3 caracteres');
  }

  if (nameField.trim().length > 50) {
    errors.push('Máximo de 50 caracteres');
  }

  if (nameField.replace(/[A-Za-z]/g, '').trim().length !== 0) {
    errors.push('Somente letras são aceitas');
  }

  return errors;
};

const passwordValidation = (passwordField) => {
  const errors = [];

  if (typeof passwordField !== 'string') {
    errors.push('Senha precisa ser um texto');
    return errors;
  }

  if (passwordField.trim().length === 0) {
    errors.push('Campo não pode ser vazio');
  }

  if (passwordField.trim().length < 6) {
    errors.push('Mínimo de 6 caracteres');
  }

  if (passwordField.trim().length > 50) {
    errors.push('Máximo de 50 caracteres');
  }

  if (
    passwordField.replace(/[0-9]/g, '').length === passwordField.length ||
    passwordField.replace(/[A-Z]/g, '').length === passwordField.length
  ) {
    errors.push(
      'Sua senha precisa ter pelo menos um número e uma letra maiúscula'
    );
  }

  return errors;
};

const imageValidation = (imageField) => {
  const errors = [];
  const urlRegex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

  if (typeof imageField !== 'string') {
    errors.push('Senha precisa ser um texto');
    return errors;
  }

  if (imageField.trim().length === 0) {
    errors.push('Campo não pode ser vazio');
  }

  if (!urlRegex.test(imageField)) {
    // valida o formato da URL utilizando um regex
    errors.push('Formato inválido');
  }

  return errors;
};

const dateValidation = (dateField) => {
  const errors = [];
  const dateRegex = /(\d{4})[-.\/](\d{2})[-.\/](\d{2})/;

  if (typeof dateField !== 'string') {
    errors.push('Data precisa ser um texto');
    return errors;
  }

  if (dateField.trim().length === 0) {
    errors.push('Campo não pode ser vazio');
  }

  if (!dateRegex.test(dateField)) {
    errors.push('Formato inválido');
  }

  return errors;
};

const emailValidation = (emailField) => {
  const errors = [];
  const emailRegex = /\S+@\S+\.\S+/;

  if (typeof emailField !== 'string') {
    errors.push('Data precisa ser um texto');
    return errors;
  }

  if (emailField.trim().length === 0) {
    errors.push('Campo não pode ser vazio');
  }

  if (!emailRegex.test(emailField)) {
    errors.push('Formato inválido');
  }

  return errors;
};

module.exports = {
  firstNameValidation,
  lastNameValidation,
  passwordValidation,
  imageValidation,
  dateValidation,
  emailValidation,
};
