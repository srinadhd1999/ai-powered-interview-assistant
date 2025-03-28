import { exec } from "child_process";

export default function handler(req, res) {
  const { jobDescp } = req.query;

  if (req.method === "GET") {
    
    exec(`python components/jd_accurate.py "${jobDescp}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        return res.status(500).json({ error: "Python execution failed" });
      }
      try {
        const data = JSON.parse(stdout);
        res.status(200).json(data);
      } catch (err) {
        res.status(500).json({ error: "Invalid JSON output" });
      }
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
