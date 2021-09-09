const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    content: {
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
    by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    edited: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const Post = model("Post", postSchema);
module.exports = Post;
