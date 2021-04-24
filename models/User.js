const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, minlength: 3, maxlength: 100 },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, min: 8 },
    birthDate: { type: Date },
    profilePicture: {
      type: String,
      default:
        'https://res.cloudinary.com/de4qbzjqh/image/upload/v1619232825/escola-do-futuro/default-avatar_hef4sh.jpg',
    },
    grade: {
      type: String,
      enum: [
        '1EF',
        '2EF',
        '3EF',
        '4EF',
        '5EF',
        '6EF',
        '7EF',
        '8EF',
        '9EF',
        '1EM',
        '2EM',
        '3EM',
      ],
    },
    active: { type: Boolean, default: true },
    newsletterOptIn: { type: Boolean },
    role: {
      type: String,
      enum: ['student', 'teacher', 'parent'],
      default: 'student',
    },
    courses: { type: [Schema.Types.ObjectId], ref: 'Course' },
    grades: { type: [Schema.Types.Mixed] },
    careers: { type: [Schema.Types.ObjectId], ref: 'Career' },
    children: { type: [Schema.Types.ObjectId], ref: 'User' },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    first_login: { type: Boolean, default: true },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary'],
    },
    requires_approval: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const User = model('User', userSchema);

module.exports = User;
