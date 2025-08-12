
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { execFile } from "child_process";
import cors from "cors";

const app = express();
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    // filename with original extension
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const PORT = 7000;
const pythonExe = "C:\\Users\\~Akash~\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";

app.post("/convert", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const inputPdfPath = path.resolve(req.file.path);
  const outputDocxDir = path.resolve("converted");
  if (!fs.existsSync(outputDocxDir)) fs.mkdirSync(outputDocxDir, { recursive: true });

  // Output filename based on original name without extension
  const outputDocxPath = path.join(outputDocxDir, `${path.parse(req.file.originalname).name}.docx`);

  console.log("Converting:", inputPdfPath, "to", outputDocxPath);
  console.log("Input file exists?", fs.existsSync(inputPdfPath));

  execFile(
    pythonExe,
    ["convert.py", inputPdfPath, outputDocxPath],
    (error, stdout, stderr) => {
      if (error) {
        console.error("Conversion error:", error);
        console.error("stdout:", stdout);
        console.error("stderr:", stderr);
        return res.status(500).json({ error: "Conversion failed" });
      }
      console.log("Conversion stdout:", stdout);
      console.log("Output file exists?", fs.existsSync(outputDocxPath));

      res.download(outputDocxPath, (err) => {
        if (err) console.error("Download error:", err);

        // Delay cleanup to ensure download finishes
        setTimeout(() => {
          try {
            fs.unlinkSync(inputPdfPath);
            fs.unlinkSync(outputDocxPath);
            console.log("Cleanup done");
          } catch (cleanupErr) {
            console.error("Cleanup error:", cleanupErr);
          }
        }, 5000);
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
