"use client";
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from '@/lib/axios';

function LinkedInCallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [message, setMessage] = useState("Processing your login...");

    useEffect(() => {
        const code = searchParams.get("code");

        if (code) {
            const handleLinkedInLogin = async (authCode) => {
                try {
                    const res = await api.post("/myapi/linkedin-login/", {
                        code: authCode
                    });

                    const data = res.data;

                    // Store tokens (use consistent key names with axios interceptor)
                    localStorage.setItem("access_token", data.tokens.access);
                    localStorage.setItem("refresh_token", data.tokens.refresh);
                    document.cookie = `token=${data.tokens.access}; path=/; max-age=${15 * 60}; SameSite=Lax`;

                    // Route based on user role
                    if (data.user && !data.user.role) {
                        router.push("/select-role");
                    } else {
                        const dashboard = data.user.role === "Job Provider" ? "/job-provider" : "/freelancer";
                        router.push(dashboard);
                    }

                } catch (error) {
                    console.error('LinkedIn login error:', error);
                    const errorMessage = error.response?.data?.error || "An error occurred. Please return to the login page and try again.";
                    setMessage(errorMessage);
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
