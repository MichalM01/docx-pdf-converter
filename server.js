const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("file"), (req, res) => {
  const inputPath = req.file.path;
  const outputDir = path.join(__dirname, "outputs");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  exec(
    `libreoffice --headless --convert-to pdf "${inputPath}" --outdir "${outputDir}"`,
    (error) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Conversion failed");
      }

      const pdfName =
        path.parse(req.file.filename).name + ".pdf";

      const pdfPath = path.join(outputDir, pdfName);

      res.download(pdfPath, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(pdfPath);
      });
    }
  );
});

app.get("/", (_, res) => {
  res.send("DOCX PDF Converter Running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
