const { Schema, model } = require("mongoose");

const likeSchema = new Schema(
  {
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

const Like = model("Like", likeSchema);
module.exports = Like;
