const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Post = model("Post", postSchema);
module.exports = Post;
