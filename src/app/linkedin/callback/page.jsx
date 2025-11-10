"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from '@/lib/axios';

export default function LinkedInCallback() {
  const router = useRouter();
  const [message, setMessage] = useState("Processing LinkedIn login...");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      setMessage(`LinkedIn login error: ${error}`);
      return;
    }

    if (code) {
      try {
        const res = api.get(`/myapi/linkedin-oauth-callback/?code=${code}`);
        const data = res.data;

        // Store tokens
        if (data.tokens?.access) {
          localStorage.setItem("access_token", data.tokens.access);
        }
        if (data.tokens?.refresh) {
          localStorage.setItem("refresh_token", data.tokens.refresh);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        document.cookie = `token=${data.tokens.access}; path=/; max-age=${15 * 60}; SameSite=Lax`;

        setMessage("LinkedIn login successful! Redirecting...");

        setTimeout(() => {
          router.replace("/dashboard");
        }, 800);

      } catch (error) {
        console.error('LinkedIn OAuth error:', error);
        const errorMessage = error.response?.data?.error || "Failed to complete LinkedIn login";
        setMessage(`LinkedIn login failed: ${errorMessage}`);
      }
    }
  }, [router]);

  return <p style={{ padding: 40 }}>{message}</p>;
}
