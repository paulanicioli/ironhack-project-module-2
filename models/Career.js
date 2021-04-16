const { Schema, model } = require('mongoose');

const careerSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    students: { type: [Schema.Types.ObjectId], ref: 'Student' },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Career = model('Career', careerSchema);

module.exports = Career;
