const { Schema, model } = require("mongoose");

const friendSchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Friend = model("Friend", friendSchema);
module.exports = Friend;
