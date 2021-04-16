const { Schema, model } = require('mongoose');

const courseSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    grade: { type: String, enum: ['1EM', '2EM', '3EM'] },
    image: { type: String },
    active: { type: Boolean, default: true },
    students: { type: [Schema.Types.ObjectId], ref: 'Student' },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

const Course = model('Course', courseSchema);

module.exports = Course;
