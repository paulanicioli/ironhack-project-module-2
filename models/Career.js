const { Schema, model } = require('mongoose');

const careerSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: {
      type: String,
      default:
        'https://res.cloudinary.com/de4qbzjqh/image/upload/v1618887535/iron-pets-images-repo/file_a94r8n.jpg',
    },
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
