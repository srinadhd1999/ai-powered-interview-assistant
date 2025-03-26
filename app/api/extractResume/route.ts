import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Extract resume file path from the request body
    const { resumePath } = req.body;

    if (!resumePath) {
      return res.status(400).json({ error: "Resume path is required" });
    }

    // Ensure the file is inside the 'public' folder or an accessible directory
    const pdfPath = path.join(process.cwd(), "public", "resume.pdf");

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: "Resume file not found" });
    }

    // Read and parse the PDF
    const pdfBuffer = fs.readFileSync(pdfPath);
    const resumeText = (await pdfParse(pdfBuffer)).text;

    res.status(200).json({ resumeText });
  } catch (error) {
    console.error("Error reading the resume:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
