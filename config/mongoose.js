const mongoose = require("mongoose");

// mongoose.connect(process.env["DB_URI"], {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.connect(
  'mongodb://localhost/socialink',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;

db.on(
  "error",
  console.error.bind("Something went wrong with the Mongodb Server")
);

db.once("open", () => console.log("Connection established with database"));

module.exports = db;
