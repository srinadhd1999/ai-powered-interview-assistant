"use client";
import { useState } from "react";
import { motion } from "framer-motion";


export default function Home() {
  const [name, setName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState<string>("");
  const [showInterviewGrid, setShowInterviewGrid] = useState<boolean>(false);
  const [response, setResponse] = useState(null);
  const skillsList = ["Java", "Python", "Scala", "Big Data", "Machine Learning", "System Design", "Data Engineering", "AWS", "Spark", "Kafka"];
  const [selectedSkill, setSelectedSkill] = useState("");


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
    if (selectedSkill && !skills.includes(selectedSkill)) {
      setSkills([...skills, selectedSkill]);
      setSkillInput("");
      setShowInterviewGrid(true);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const openConvAIV2 = (jd:string) => {
    const displayName = firstName || name; 
    window.open(`/convai?jobDescp=${jd}&name=${encodeURIComponent(displayName)}`, "_blank");
  };

  const openConvAI = (skill: string) => {
    const displayName = firstName || name; 
    window.open(`/convai?skill=${encodeURIComponent(skill)}&name=${encodeURIComponent(displayName)}`, "_blank");
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !jobDescription || !resume) {
      alert("Please fill in all fields and upload a resume.");
      return;
    }
    console.log("inside the handleSubmit")

    setLoading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("jobDescription", jobDescription);
    formData.append("resume", resume);
    console.log("Got the form dataaaa")
    console.log(jobDescription)
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
    
    try {
      const res = await fetch(`/api/executePy?jobDescp=${jobDescription}`);
      const data = await res.json();
      console.log(data)
      setResponse(data); 
    } catch (err) {
      console.error("Error fetching:", err);
    }
    console.log("End of the code block")
    console.log(JSON.stringify(response,null,2))
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <br></br><br></br><br></br>
      <div className="text-center max-w-2xl mb-8 mx-auto">
        {[
          { 
            title: "🚀 Elevate Your Career with AI-Powered Mock Interviews!", 
            text: "Our AI Interview Assistant simulates real interview scenarios tailored to your job role, helping you gain confidence and ace your interviews. Get personalized, skill-based mock interviews and improve your performance with AI-driven insights!" 
          },
          { 
            title: "🤔 Why Should You Give Mock Interviews?", 
            text: "Mock interviews help you reduce anxiety, refine your responses, and get comfortable with real-world interview scenarios. Practicing with AI ensures that you receive instant feedback and continuous improvement!" 
          },
          { 
            title: "🤖 How Does AI Make Your Interview Practice Better?", 
            text: "Unlike traditional mock interviews, our AI Interview Assistant provides real-time, unbiased feedback, helps identify improvement areas, and adapts questions to your skill level—just like a real interviewer!" 
          },
          { 
            title: "🏆 Are You Ready to Test Your Skills?", 
            text: "Think you are prepared for your next interview? Put yourself to the test with our AI-powered mock interview! Every session gets you one step closer to landing your dream job!" 
          }
        ].map((section, index) => (
          <motion.div
            key={index}
            initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: index * 0.3 }}
          >
            <h1 className="text-2xl font-bold text-primary mb-4">{section.title}</h1>
            <p className="text-xl text-muted-foreground">{section.text}</p>
            <br></br>
          </motion.div>
        ))}

        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-xl font-semibold text-primary mt-8"
        >
          Start practicing today! 🎯
        </motion.p>
      </div>

      <motion.div
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
      <div>
        <p className="text-2xl font-semibold text-primary mt-4">
          Fill in the below form to give Domain based Mock Interview!!!
        </p>
      </div>
      </motion.div>

      <div className="mt-10"></div>
      <motion.div
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
      <div className="bg-card p-8 rounded-lg shadow-lg text-center w-full max-w-md">
        <h1 className="text-2l text-primary">Fill in the following details to proceed.</h1>
        <br></br>
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

        {uploadSuccess && (
            <>
            <p className="text-green-600 mt-2">✅ Resume uploaded successfully!</p>
            <button
              onClick={() => openConvAIV2(jobDescription)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full mt-4">
                Start Your Mock Interview
          </button>
        </>)}
      </div>
      </motion.div>

      <motion.div
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
      <div>
        <br></br>
        <p className="text-2xl font-semibold text-primary mt-4">
          Fill in the below form to give Skill based Mock Interviews!!!
        </p>
      </div>
      </motion.div>

      <motion.div
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
      {/* Skills Section (Always Visible) */}
      <div className="bg-card p-6 rounded-lg shadow-lg text-center w-full max-w-md mt-6">
        <h2 className="text-xl font- text-primary mb-2">Add the Skills for which you want to give mock interviews</h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="border border-input p-2 rounded-md mb-4 w-full bg-background text-foreground"
        />

        <div className="flex items-center gap-2 mb-4">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="border border-input p-2 rounded-md w-full bg-background text-foreground"
          >
            <option value="" disabled>Select a skill</option>
            {skillsList.map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
          
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
      </motion.div>

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
