const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, minlength: 3, maxlength: 100 },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, min: 8 },
    birthDate: { type: Date },
    profilePicture: { type: String },
    grade: { type: String, enum: ['1EM', '2EM', '3EM'] },
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
  },
  {
    timestamps: true,
  }
);

const User = model('User', userSchema);

module.exports = User;
