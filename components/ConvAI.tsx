"use client"

import {Button} from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Conversation} from "@11labs/client";
import {cn} from "@/lib/utils";

async function requestMicrophonePermission() {
    try {
        await navigator.mediaDevices.getUserMedia({audio: true})
        return true
    } catch {
        console.error('Microphone permission denied')
        return false
    }
}

async function getSignedUrl(): Promise<string> {
    try {
      const response = await fetch(`/api/signed-url`);
  
      if (!response.ok) throw new Error(`Failed to get signed URL: ${response.statusText}`);
  
      const data = await response.json();

      if (!data.signedUrl) {
      throw new Error("Signed URL is missing in the response.");
    }

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
    const domain = searchParams.get("domain") || "General Interview";
    console.log("domain: " + domain)
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)

    async function startConversation() {
        const hasPermission = await requestMicrophonePermission()
        if (!hasPermission) {
            alert("No permission")
            return;
        }
        const signedUrl = await getSignedUrl()
        const prompt = `You are Tars, a highly skilled and professional interview assistant specializing in ${domain}. Your job is to conduct structured, engaging, and insightful mock interviews tailored to the candidate's experience level. Begin with an introduction and an initial question about ${domain}. Adapt the interview dynamically, switching between easy, medium, and hard questions based on the candidate's responses.
Assess their answers in real time, providing constructive feedback and hints when necessary. If the candidate struggles, guide them towards the correct answer while maintaining a professional and encouraging tone. At the end of the session, provide a comprehensive performance evaluation, highlighting strengths and areas for improvement. If the candidate says, 'I'm done' or 'Stop the interview,' conclude the session immediately and summarize their performance`
        const conversation = await Conversation.startSession({
            signedUrl: signedUrl,
            overrides: {
                agent: {
                    language: "en",
                    prompt: {
                        prompt: prompt, 
                    },
                    firstMessage: `Welcome to your mock interview. My name is Tars, and I'll be your professional interview assistant today. This session will be focused on the ${domain} domain. I will ask you a series of technical and behavioral questions, gradually increasing in difficulty. Please try to answer in detail, and feel free to ask for clarification if needed. Let’s begin—tell me a bit about yourself and your experience in ${domain}.`
                },
            },
            onConnect: () => {
                setIsConnected(true)
                setIsSpeaking(true)
            },
            onDisconnect: () => {
                setIsConnected(false)
                setIsSpeaking(false)
            },
            onError: (error) => {
                console.log(error)
                alert('An error occurred during the conversation')
            },
            onModeChange: ({mode}) => {
                setIsSpeaking(mode === 'speaking')
            },
        })
        setConversation(conversation)
    }

    async function endConversation() {
        if (!conversation) {
            return
        }
        await conversation.endSession()
        setConversation(null)
    }

    return (
        <div className={"flex justify-center items-center gap-x-4"}>
            <Card className={'rounded-3xl border-2 border-blue-200 shadow-lg'}>
                <CardContent>
                    <CardHeader>
                        <CardTitle className={'text-center text-2xl text-black-600'}>
                            {isConnected ? (
                                isSpeaking ? `Interview Expert is speaking` : 'Interview Expert is listening'
                            ) : (
                                `Are you ready for ${domain} Mock Interview?`
                            )}
                        </CardTitle>
                    </CardHeader>
                    <div className={'flex flex-col gap-y-4 text-center'}>
                    <div className="flex justify-center items-center">
                        <div className={cn('orb my-16 mx-12',
                            isSpeaking ? 'animate-orb' : (conversation && 'animate-orb-slow'),
                            isConnected ? 'orb-active' : 'orb-inactive')}
                        ></div>
                        </div>


                        <Button
                            variant={'outline'}
                            className={'rounded-full'}
                            size={"lg"}
                            disabled={conversation !== null && isConnected}
                            onClick={startConversation}
                        >
                            Start Your {domain} Mock Interview
                        </Button>
                        <Button
                            variant={'outline'}
                            className={'rounded-full'}
                            size={"lg"}
                            disabled={conversation === null && !isConnected}
                            onClick={endConversation}
                        >
                            End Your {domain} Mock Interview
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}