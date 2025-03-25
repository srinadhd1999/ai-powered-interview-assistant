"use client";
import { useState } from "react";

export default function Home() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState<string>("");
  const [showInterviewGrid, setShowInterviewGrid] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setResume(file);
    } else {
      alert("Please upload a valid PDF file.");
      e.target.value = "";
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const openConvAI = (skill: string) => {
    window.open(`/convai?skill=${encodeURIComponent(skill)}&name=${encodeURIComponent(firstName)}`, "_blank");
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !jobDescription || !resume) {
      alert("Please fill in all fields and upload a resume.");
      return;
    }

    setLoading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("jobDescription", jobDescription);
    formData.append("resume", resume);

    try {
      const response = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Resume upload failed");

      setUploadSuccess(true);
    } catch (error) {
      alert("Error: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <br></br><br></br><br></br>
      <div className="text-center max-w-2xl mb-8">
        <h1 className="text-3xl font-bold text-primary mb-4">
          🚀 Elevate Your Career with AI-Powered Mock Interviews!
        </h1>
        <p className="text-xl text-muted-foreground">
          Our AI Interview Assistant simulates real interview scenarios tailored to your job role, helping you gain confidence and ace your interviews.
          Get personalized, skill-based mock interviews and improve your performance with AI-driven insights!
        </p>
        <br></br><br></br>
        <h1 className="text-3xl font-bold text-primary mb-4">
          🤔 Why Should You Give Mock Interviews?
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Mock interviews help you reduce anxiety, refine your responses, and get comfortable with real-world interview scenarios.
          Practicing with AI ensures that you receive instant feedback and continuous improvement!
        </p>
        <br></br><br></br>
        <h1 className="text-3xl font-bold text-primary mb-4">
         🤖 How Does AI Make Your Interview Practice Better?
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
        Unlike traditional mock interviews, our AI Interview Assistant provides real-time, unbiased feedback, helps identify improvement areas, and adapts questions to your skill level—just like a real interviewer!
         </p>
         <br></br><br></br>
        <h1 className="text-3xl font-bold text-primary mb-4">
        🏆 Are You Ready to Test Your Skills?
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
        Think you're prepared for your next interview? Put yourself to the test with our AI-powered mock interview! Every session gets you one step closer to landing your dream job!
         </p>
      </div>
      <p className="text-2xl font-semibold text-primary mt-4">
        Start practicing today! 🎯
      </p>
      <div className="mt-10"></div>
      <div className="bg-card p-8 rounded-lg shadow-lg text-center w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary">Welcome</h1>
        <p className="text-muted-foreground mb-4">Fill in the details to proceed.</p>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter your first name"
          className="border border-input p-2 rounded-md mb-4 w-full bg-background text-foreground"
        />

        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter your last name"
          className="border border-input p-2 rounded-md mb-4 w-full bg-background text-foreground"
        />

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Enter job description"
          className="border border-input p-2 rounded-md mb-4 w-full bg-background text-foreground"
          rows={3}
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="border border-input p-2 rounded-md mb-4 w-full bg-background text-foreground"
        />

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 w-full"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Resume"}
        </button>

        {uploadSuccess && <p className="text-green-600 mt-2">✅ Resume uploaded successfully!</p>}
      </div>

      {/* Skills Section (Always Visible) */}
      <div className="bg-card p-6 rounded-lg shadow-lg text-center w-full max-w-md mt-6">
        <h2 className="text-xl font-semibold text-primary mb-2">Add the Skills for which you want to give mock interviews</h2>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Enter a skill"
            className="border border-input p-2 rounded-md w-full bg-background text-foreground"
          />
          <button
            onClick={handleAddSkill}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-opacity-80"
          >
            Add
          </button>
        </div>

        {/* Display Added Skills */}
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="bg-muted text-muted-foreground px-3 py-1 rounded-md flex items-center gap-2"
            >
              {skill}
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="text-red-500 text-sm font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Skill-Based Mock Interview Grid */}
      {showInterviewGrid && skills.length > 0 && (
        <div className="mt-6 w-full max-w-2xl">
          <h2 className="text-xl font-semibold text-primary mb-4 text-center">Skill Based Mock Interview Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((skill, index) => (
              <div key={index} className="bg-card p-4 rounded-md shadow-md text-center">
                <p className="text-lg font-medium text-foreground">{skill}</p>
                <button
                  onClick={() => openConvAI(skill)}
                  className="mt-2 px-3 py-1 bg-accent text-accent-foreground rounded-md hover:bg-opacity-80"
                >
                  Start Your Mock Interview
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Copyright Footer */}
      <footer className="mt-12 text-center text-sm text-muted-foreground">© 2025 AIvengers Mock Interview Platform. All rights reserved.</footer>
    </div>
  );
}
