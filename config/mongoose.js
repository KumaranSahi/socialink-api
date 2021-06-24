const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://Kumaran:d4vVpjtTjvYUezrq@socialink.qhrra.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
);

const db = mongoose.connection;

db.on(
  "error",
  console.error.bind("Something went wrong with the Mongodb Server")
);

db.once("open", () => console.log("Connection established with database"));

module.exports = db;
