import { spawn } from 'child_process';
import path from 'path';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { filePath, jobDescription } = req.body;
    if (!filePath || !jobDescription) {
        return res.status(400).json({ error: "Missing filePath or jobDescription" });
    }

    const scriptPath = path.join(process.cwd(), 'backend', 'jd_accurate.py');
    const pythonProcess = spawn('python', [scriptPath, filePath, jobDescription]);

    let output = "";
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error("Python Error:", data.toString());
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            try {
                const result = JSON.parse(output);
                res.status(200).json(result);
            } catch (error) {
                console.error("JSON Parse Error:", error);
                res.status(500).json({ error: "Failed to parse Python output" });
            }
        } else {
            res.status(500).json({ error: "Python script execution failed" });
        }
    });
}
