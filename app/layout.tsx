import type {Metadata} from "next";
import "./globals.css";
import {BackgroundWave} from "@/components/background-wave";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Mock Interview Assistant",
    description: "Your AI powered Mock Interview Assistant"
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={"h-full w-full"}>
        <body className={`antialiased w-full h-full lex flex-col`}>
        <div className="flex flex-col flex-grow w-full items-center justify-center sm:px-4">
            <nav
                className={
                    "sm:fixed w-full top-0 left-0 grid grid-cols-2 py-4 px-8"
                }
            >

<div className="flex">
   <Link href="/" prefetch={true}>
      <div className="flex items-center gap-2">
         <img src="/logo_for_agent_page.png" alt="Spark Logo" className="h-9 w-9" />
         <span className="font-semibold text-black-600 text-1xl">AI Powered Mock Interview Assistant</span>
      </div>
   </Link>
</div>

                {/* <div className={"flex gap-4 justify-end"}>
                    <Link
                        href="https://github.com/jonatanvm/convai-demo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={"py-0.5"}
                        aria-label="View source on GitHub"
                    >
                        <GithubLogo
                            className={"w-5 h-5 hover:text-gray-500 text-[#24292f]"}
                        />
                    </Link>
                </div> */}
            </nav>
            {children}
            <BackgroundWave/>
        </div>
        </body>
        </html>
    );
}
