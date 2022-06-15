express = require("express");
  fs = require("fs");
  say = require("say");
  path = require("path");
  parse = require("pdf-parse");
  multer = require("multer");

const app = express();

// set the view engine to ejs
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./pdf");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

let upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    let ext = path.extname(file.originalname);
    callback(null, true);
  },
}).single("userFile");

app.post("/api/v1/file", upload, async (req, res) => {
  try {
    res.redirect(
      `/api/v1/pdf-to-audio?name=${req.file.originalname.replace(".pdf", "")}`
    );
  } catch (error) {
    res.status(400).json({
      message: "error",
      error: error.message,
    });
  }
});

app.get("/api/v1/pdf-to-audio", (req, res) => {
  toAudio(req.query.name);
});

async function toAudio(name) {
  const buffer = fs.readFileSync(`./pdf/${name}.pdf`);

  parse(buffer)
    .then((data) => {
      say.export(data.text, "Alex", 1, `./audio/${name}.wav`, (err) => {
        if (err) {
          return console.error(err);
        }
        console.log(`Text has been saved to ${name}.wav`);
      });
    })
    .catch((e) => {
      console.info(e);
    });
}

const PORT = process.env.PORT || 1000;

app.listen(PORT, function () {
  console.log("Server is listening on Port " + PORT);
});
