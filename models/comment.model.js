const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    content: {
      type: String,
    },
    by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    for: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

const Comment = model("Comment", commentSchema);
module.exports = Comment;
