"use client";
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LinkedInCallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [message, setMessage] = useState("Processing your login...");

    useEffect(() => {
        const code = searchParams.get("code");

        if (code) {
            const handleLinkedInLogin = async (authCode) => {
                try {
                    const res = await fetch("http://127.0.0.1:8000/myapi/linkedin-login/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code: authCode }),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        setMessage(data.error || "LinkedIn login failed. Please try again.");
                    } else {
                        localStorage.setItem("accessToken", data.tokens.access);
                        localStorage.setItem("refreshToken", data.tokens.refresh);

                        if (data.user && !data.user.role) {
                            router.push("/select-role");
                        } else {
                            const dashboard = data.user.role === "employer" ? "/job-provider" : "/freelancer";
                            router.push(dashboard);
                        }
                    }
                } catch (error) {
                    setMessage("An error occurred. Please return to the login page and try again.");
                }
            };

            handleLinkedInLogin(code);
        } else {
            setMessage("Could not find authorization code. Please try logging in again.");
        }
    }, [searchParams, router]);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <div>
                <h2>{message}</h2>
            </div>
        </div>
    );
}

export default function LinkedInCallbackPage() {
    return (
        <Suspense fallback={<div>Loading LinkedIn login...</div>}>
            <LinkedInCallbackInner />
        </Suspense>
    );
}
