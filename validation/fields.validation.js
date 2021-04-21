const firstNameValidation = (nameField) => {
  const errors = [];

  if (typeof nameField !== 'string') {
    errors.push('Nome precisa ser um texto.');
    return errors;
  }

  if (nameField.trim().length === 0) {
    errors.push('Campo obrigatório!');
  }

  if (nameField.trim().length < 3) {
    errors.push('Mínimo de 3 caracteres.');
  }

  if (nameField.trim().length > 50) {
    errors.push('Máximo de 50 caracteres.');
  }

  if (nameField.replace(/[A-zÀ-ú]/g, '').trim().length !== 0) {
    errors.push('Somente letras são aceitas.');
  }

  return errors;
};

const lastNameValidation = (nameField) => {
  const errors = [];

  if (typeof nameField !== 'string') {
    errors.push('Nome precisa ser um texto.');
    return errors;
  }

  if (nameField.trim().length === 0) {
    errors.push('Campo obrigatório!');
  }

  if (nameField.trim().length < 3) {
    errors.push('Mínimo de 3 caracteres.');
  }

  if (nameField.trim().length > 50) {
    errors.push('Máximo de 50 caracteres.');
  }

  if (nameField.replace(/[A-zÀ-ú]/g, '').trim().length !== 0) {
    errors.push('Somente letras são aceitas.');
  }

  return errors;
};

const passwordValidation = (passwordField) => {
  const errors = [];

  if (typeof passwordField !== 'string') {
    errors.push('Senha precisa ser um texto.');
    return errors;
  }

  if (passwordField.trim().length === 0) {
    errors.push('Campo obrigatório!');
  }

  if (passwordField.trim().length < 6) {
    errors.push('Mínimo de 6 caracteres.');
  }

  if (passwordField.trim().length > 50) {
    errors.push('Máximo de 50 caracteres.');
  }

  if (
    passwordField.replace(/[0-9]/g, '').length === passwordField.length ||
    passwordField.replace(/[A-Z]/g, '').length === passwordField.length
  ) {
    errors.push(
      'A senha precisa conter pelo menos um número e uma letra maiúscula.'
    );
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
    errors.push('Campo obrigatório!');
  }

  if (!dateRegex.test(dateField)) {
    errors.push('Formato inválido!');
  }

  return errors;
};

const emailValidation = (emailField) => {
  const errors = [];
  const emailRegex = /\S+@\S+\.\S+/;

  if (typeof emailField !== 'string') {
    errors.push('Formato deve ser um texto.');
    return errors;
  }

  if (emailField.trim().length === 0) {
    errors.push('Campo obrigatório!');
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
  dateValidation,
  emailValidation,
};
