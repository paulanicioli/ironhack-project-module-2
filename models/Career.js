const { Schema, model } = require('mongoose');

const careerSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    students: { type: [Schema.Types.ObjectId], ref: 'Student' },
  },
  {
    timestamps: true,
  }
);

const Career = model('Career', careerSchema);

module.exports = Career;
