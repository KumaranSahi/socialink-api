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
      public_id: {
        type: String,
      },
      imageUrl: {
        type: String,
      },
    },
    DOB: {
      type: Date,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    bio: {
      type: String,
    },
    privacy: {
      type: Boolean,
    },
    sentRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "Friend",
      },
    ],
    receivedRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "Friend",
      },
    ],
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const User = model("User", userSchema);
module.exports = User;
