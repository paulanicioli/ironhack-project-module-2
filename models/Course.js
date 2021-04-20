const { Schema, model } = require('mongoose');

const courseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
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
    image: {
      type: String,
      default:
        'https://res.cloudinary.com/de4qbzjqh/image/upload/v1618882210/iron-pets-images-repo/file_qd26ef.jpg',
    },
    active: { type: Boolean, default: true },
    students: { type: [Schema.Types.ObjectId], ref: 'User' },
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

const Course = model('Course', courseSchema);

module.exports = Course;
