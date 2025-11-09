"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  // State for form inputs and loading/messages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // NOTE: Hardcoded keys as requested for development.
  // In production, these should be stored in environment variables.
  const GOOGLE_CLIENT_ID = "858134682989-mav50sd3csolb7u8tbc1susrhm5uvk49.apps.googleusercontent.com";
  const LINKEDIN_CLIENT_ID = "78hekwwmkag96p";
  const LINKEDIN_REDIRECT_URI = "http://localhost:3000/linkedin-callback"; // You will need to create this page

  // --- Handlers ---

  // 1. Handle Email & Password Registration
  const handleEmailRegister = async () => {
    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setMessage(""); // Clear previous messages

    try {
      // Corrected API endpoint from '/register/' to '/signup/' to match urls.py
      const res = await fetch("http://127.0.0.1:8000/myapi/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show error message from backend
        setMessage(data.error || "Registration failed.");
      } else {
        // On success, show the success message from the backend.
        // Do NOT save tokens or redirect.
        setMessage(data.message); // e.g., "Registration successful. Please check your email..."
      }
    } catch (error) {
      setMessage("An error occurred during registration.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Google Sign-Up Response
  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:8000/myapi/google-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Google sign-up failed.");
      } else {
        localStorage.setItem("accessToken", data.tokens.access);
        localStorage.setItem("refreshToken", data.tokens.refresh);
        // If the user is new (i.e., has no role), redirect to role selection.
        // The backend should tell us if the role is missing.
        if (!data.user.role) {
          router.push("/select-role");
        } else {
          // This handles the case where an existing user signs up again.
          // Send them to the appropriate dashboard.
          const dashboard = data.user.role === 'employer' ? '/job-provider' : '/freelancer';
          router.push(dashboard);
        }
      }
    } catch (error) {
      setMessage("An error occurred with Google Sign-Up.");
      console.error("Google sign-up error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Generate LinkedIn Login URL
  const getLinkedInLoginURL = () => {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: LINKEDIN_CLIENT_ID,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      scope: "openid profile email",
      state: "linkedin_oauth_state_123", // Should be a random string in production
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  };

  // --- Effects ---

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: "100%" }
        );
      }
    };
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="bgc-thm4">
      <Header20 />
      <section className="our-register">
        <div className="container">
          {/* ... (Your existing title and layout HTML) ... */}
          <div className="row">
            <div className="col-xl-8 mx-auto">
              <div className="log-reg-form form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
                <h4>Create Your Account</h4>
                <p className="text mt20">
                  Already have an account?{" "}
                  <Link href="/login" className="text-thm">Log In!</Link>
                </p>

                <div className="row">
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500 dark-color">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500 dark-color">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="d-grid mb20">
                  <button
                    className="ud-btn btn-thm"
                    type="button"
                    disabled={loading}
                    onClick={handleEmailRegister}
                  >
                    {loading ? "Processing..." : "Create Account"}
                    <i className="fal fa-arrow-right-long" />
                  </button>
                </div>

                <div style={{ textAlign: "center", margin: "16px 0" }}>— or sign up with —</div>

                <div id="google-signin-btn" style={{ marginBottom: "15px" }} />

                <div className="d-grid">
                  <button
                    className="ud-btn btn-linkedin" // Assumes you have a CSS class for LinkedIn button
                    type="button"
                    onClick={() => (window.location.href = getLinkedInLoginURL())}
                    disabled={loading}
                  >
                    Sign up with LinkedIn
                  </button>
                </div>

                {message && <div className="alert alert-danger mt-3">{message}</div>}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}