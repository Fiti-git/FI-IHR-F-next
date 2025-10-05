"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      fetch(`http://localhost:8000/myapi/linkedin-oauth-callback/?code=${code}`)
        .then(async (res) => {
          const data = await res.json();

          if (!res.ok) {
            // Backend returned an error response
            setMessage(`LinkedIn login failed: ${data.error || "Unknown error"}`);
            return;
          }

          if (data.tokens?.access) {
            localStorage.setItem("accessToken", data.tokens.access);
          }
          if (data.tokens?.refresh) {
            localStorage.setItem("refreshToken", data.tokens.refresh);
          }
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }

          setMessage("LinkedIn login successful! Redirecting...");

          setTimeout(() => {
            router.replace("/dashboard");
          }, 800);
        })
        .catch(() => {
          setMessage("Failed to complete LinkedIn login");
        });
    }
  }, [router]);

  return <p style={{ padding: 40 }}>{message}</p>;
}
