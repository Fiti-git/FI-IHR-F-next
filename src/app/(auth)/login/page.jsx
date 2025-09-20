"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); // Store Google user info
  const [message, setMessage] = useState(null);

  // Google Client ID for OAuth
  const GOOGLE_CLIENT_ID = "858134682989-mav50sd3csolb7u8tbc1susrhm5uvk49.apps.googleusercontent.com";

  // Handle Google login response
  const handleGoogleResponse = async (response) => {
    const { credential } = response;

    if (!credential) {
      setMessage("Google sign-in failed");
      return;
    }

    try {
      // Send the credential token (id_token) to your backend for verification
      const res = await fetch("http://localhost:8000/myapi/google-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Google login failed");
      } else {
        setMessage("Google login successful!");
        setUser(data.user); // Save user info to state

        // Store your own JWT tokens if backend sends them
        if (data.access) {
          localStorage.setItem("accessToken", data.access);
        }
        if (data.refresh) {
          localStorage.setItem("refreshToken", data.refresh);
        }

        // Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setMessage("Google login error");
    }
  };

  useEffect(() => {
    // Load Google Identity Services script
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
          auto_select: false,
          cancel_on_tap_outside: false,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          {
            theme: "outline",
            size: "large",
            width: "100%",
          }
        );
      }
    };

    return () => {
      // Cleanup script tag when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const handleLogout = () => {
    setUser(null);
    setMessage("Logged out");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  return (
    <div className="bgc-thm4">
      <Header20 />
      <section className="our-register">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 m-auto text-center">
              <div className="main-title">
                <h2 className="title">Login</h2>
                <p className="paragraph">
                   Welcome back! Please enter your credentials to access your account
                </p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-xl-8 mx-auto">
              <div className="log-reg-form form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
                <h4>Welcome Back</h4>
                <p className="text mt20">
        Don't have an account?{" "}
        <Link href="/register" className="text-thm">Create one!</Link>
      </p>




                {/* Form Fields (Email, Password only) */}
                <div className="row">
                  {/* Email */}
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500 dark-color">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="you@example.com"
                    />
                  </div>
                  {/* Password */}
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500 dark-color">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="********"
                    />
                  </div>
                </div>
                                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  — or sign up —
                </div>
                {/* Google Sign-In Button */}
                <div id="google-signin-btn" className="mb25" style={{ width: "100%" }} />

                {/* Submit Button (Disabled, no email/password submit logic) */}
                <div className="d-grid mb20">
                  <button
                    className="ud-btn btn-thm default-box-shadow2"
                    type="button"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Create Account"} <i className="fal fa-arrow-right-long" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
