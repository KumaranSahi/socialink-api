const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./config/mongoose");

const router = require("./routes");

const PORT = 8000;

app.use(cors());
app.use(express.json());

const passportJWT = require("./config/passport");

app.use("/api", router);

app.use("/", (req, res) => {
  return res.status(404).json({
    data: "Requested data doesn't exist",
  });
});

app.listen(process.env.PORT || PORT, () =>
  console.log("Server running on port " + PORT)
);
