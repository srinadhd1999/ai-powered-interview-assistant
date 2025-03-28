"use client";
import resumeData from  "@/data/ResumeJd.json"
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Conversation } from "@11labs/client";
import { cn } from "@/lib/utils";
import Webcam from "react-webcam";

async function requestMicrophonePermission() {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;
    } catch {
        console.error("Microphone permission denied");
        return false;
    }
}

async function getSignedUrl(): Promise<string> {
    try {
        const response = await fetch(`/api/signed-url`);

        if (!response.ok) throw new Error(`Failed to get signed URL: ${response.statusText}`);

        const data = await response.json();
        if (!data.signedUrl) throw new Error("Signed URL is missing in the response.");

        console.log("Signed URL fetched successfully:", data.signedUrl);
        return data.signedUrl;
    } catch (error) {
        console.error("Error fetching signed URL:", error);
        alert("Could not fetch signed URL. Please try again.");
        throw error;
    }
}

export function ConvAI() {
    const searchParams = useSearchParams();
    const technology = searchParams?.get("skill") || "Resume Based";
    const name = searchParams?.get("name") 
    const jd = searchParams?.get("jobDescp")
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<string>("00:00");
    const [isCameraOn, setIsCameraOn] = useState(true);

    const webcamRef = useRef<Webcam>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isConnected && startTime !== null) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const diff = Math.floor((now - startTime) / 1000);
                const minutes = String(Math.floor(diff / 60)).padStart(2, "0");
                const seconds = String(diff % 60).padStart(2, "0");
                setElapsedTime(`${minutes}:${seconds}`);
            }, 1000);
        } else {
            clearInterval(timerRef.current!);
        }

        return () => clearInterval(timerRef.current!);
    }, [isConnected, startTime]);

    async function startConversation() {
        var prompt = ""
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
            alert("No permission");
            return;
        }

        const signedUrl = await getSignedUrl();
        if(technology == "Resume Based") {
            const experiences = resumeData.experiences
            const domain = resumeData.domain
            const skills = resumeData.skills
            const projects = resumeData.projects
            prompt = `
            You are Neo, a highly skilled and professional interview assistant specializing in the ${domain} domain.
            Your role is to conduct an engaging and structured mock interview with the candidate named ${name}, based on the following information:
            
            🔹 **Experience:** ${experiences.join(", ")}
            🔹 **Projects:** ${projects.join(", ")}
            🔹 **Skills:** ${skills.join(", ")}
            🔹 **Job Description:** ${jd}
            
            
            Begin the interview with an introduction and an initial question based on their skills and domain expertise.
            Adapt the questions dynamically across easy, medium, and hard levels, depending on the candidate's responses.
            Ask questions specifically related to their past experiences and projects where possible.
            
            **During the interview:**
            - Use the candidate's name (${name}) frequently to make the conversation interactive.
            - If the candidate says 'I'm done' or 'Stop the interview', conclude immediately with a summary.
            - If the candidate struggles, give hints and guide them toward the correct answer.
            - Provide feedback after every answer, mentioning strengths and improvement areas.
            
            **At the end of the session:**
            - Give a detailed performance evaluation mentioning their strong areas and areas to work on.
            -also write the feedback to a file named feedback. 
            Make the interview natural, human-like, and professional.
            `;
        }
        else{
            prompt = `You are Neo, a highly skilled and professional interview assistant specializing in ${technology}. Your job is to conduct structured, engaging, and insightful mock interviews tailored to the candidate's experience level. Begin with an introduction and an initial question about ${technology}. Adapt the interview dynamically, switching between easy, medium, and hard questions based on the candidate's responses.
            Assess their answers in real time, providing constructive feedback and hints when necessary. Use their name ${name} in the middle of conversation to make the conversation more interactive and they will use your name Neo during the conversation. If the candidate struggles, guide them towards the correct answer while maintaining a professional and encouraging tone. At the end of the session, provide a comprehensive performance evaluation, highlighting strengths and areas for improvement. If the candidate says, 'I'm done' or 'Stop the interview,' conclude the session immediately and summarize their performance. also write the feedback to a file named feedback`;
    
        }
        
        const conversation = await Conversation.startSession({
            signedUrl: signedUrl,
            overrides: {
                agent: {
                    language: "en",
                    prompt: {
                        prompt: prompt,
                    },
                    firstMessage: `Welcome to your mock interview, ${name}. My name is Neo, and I'll be your professional interview assistant today. This session will be focused on the ${technology}. I will ask you a series of technical questions, gradually increasing in difficulty. Please try to answer in detail, and feel free to ask for clarification if needed. Let's begin—tell me a bit about yourself and your experience in ${technology}.`
                },
            },
            onConnect: () => {
                setIsConnected(true);
                setIsSpeaking(true);
                setStartTime(Date.now());
                setElapsedTime("00:00");
            },
            onDisconnect: () => {
                setIsConnected(false);
                setIsSpeaking(false);
            },
            onError: (error) => {
                console.log(error);
                alert("An error occurred during the conversation");
            },
            onModeChange: ({ mode }) => {
                setIsSpeaking(mode === "speaking");
            },
        });

        setConversation(conversation);
    }

    async function endConversation() {
        if (!conversation) {
            return;
        }
        await conversation.endSession();
        setConversation(null);
        setIsConnected(false);
        setStartTime(null);
        setElapsedTime("00:00");
    }

    function toggleCamera() {
        setIsCameraOn((prev) => !prev);
    }

    return (
        <div className={"flex justify-center items-center gap-x-4"}>
            <Card className={"rounded-3xl border-2 border-blue-200 shadow-lg"}>
                <CardContent>
                    <CardHeader>
                        <CardTitle className={"text-center text-2xl text-black-600"}>
                            {isConnected ? (
                                isSpeaking ? `Interview Expert is speaking` : "Interview Expert is listening"
                            ) : (
                                `Are you ready for ${technology} Mock Interview?`
                            )}
                        </CardTitle>
                    </CardHeader>

                    <div className="flex flex-col gap-y-4 text-center">
                        {/* Webcam Feed with Toggle */}
                        <div className="flex flex-col justify-center items-center">
                            {isCameraOn ? (
                                <Webcam
                                    ref={webcamRef}
                                    className="rounded-2xl shadow-xl border-2 border-gray-300 w-64 h-48 transition-all duration-300 ease-in-out"
                                    videoConstraints={{ width: 320, height: 240, facingMode: "user" }}
                                />
                            ) : (
                                <div className="w-64 h-48 bg-gray-800 rounded-2xl flex items-center justify-center text-white text-lg font-semibold">
                                    Camera Off
                                </div>
                            )}
                            
                            {/* Camera Toggle Button */}
                            <Button
                                variant={"outline"}
                                className={"rounded-full mt-4"}
                                size={"lg"}
                                onClick={toggleCamera}
                            >
                                {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
                            </Button>
                        </div>

                        {/* Timer Display */}
                        {isConnected && (
                            <p className="text-lg font-semibold text-blue-600">
                                Interview Duration: {elapsedTime}
                            </p>
                        )}

                        <div className="flex justify-center items-center">
                            <div
                                className={cn(
                                    "orb my-16 mx-12",
                                    isSpeaking ? "animate-orb" : conversation && "animate-orb-slow",
                                    isConnected ? "orb-active" : "orb-inactive"
                                )}
                            ></div>
                        </div>

                        <Button
                            variant={"outline"}
                            className={"rounded-full"}
                            size={"lg"}
                            disabled={conversation !== null && isConnected}
                            onClick={startConversation}
                        >
                            Start Your {technology} Mock Interview
                        </Button>
                        <Button
                            variant={"outline"}
                            className={"rounded-full"}
                            size={"lg"}
                            disabled={conversation === null && !isConnected}
                            onClick={endConversation}
                        >
                            End Your {technology} Mock Interview
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
