const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    DOB: {
      type: Date,
    },
    post: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    bio:{
      type:String
    },
    privacy:{
      type:Boolean
    }
  },
  { timestamps: true }
);

const User = model("User", userSchema);
module.exports = User;
