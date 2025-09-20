"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(null);

  // Google OAuth Client ID
  const GOOGLE_CLIENT_ID =
    "858134682989-mav50sd3csolb7u8tbc1susrhm5uvk49.apps.googleusercontent.com";

  // LinkedIn OAuth config
  const LINKEDIN_CLIENT_ID = "78hekwwmkag96p"; // replace with your LinkedIn client ID
  const LINKEDIN_REDIRECT_URI = "http://localhost:3000/linkedin/callback";

  // Generate LinkedIn login URL
  const getLinkedInLoginURL = () => {
    const baseURL = "https://www.linkedin.com/oauth/v2/authorization";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: LINKEDIN_CLIENT_ID,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      scope: "openid profile email",
      state: "linkedin_oauth_state_123", // replace with random string in prod
    });
    return `${baseURL}?${params.toString()}`;
  };

  // Handle Google login response
  const handleGoogleResponse = async (response) => {
    const { credential } = response;
    if (!credential) {
      setMessage("Google sign-in failed");
      return;
    }

    try {
      setLoading(true);
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
        setUser(data.user);
        if (data.tokens?.access)
          localStorage.setItem("accessToken", data.tokens.access);
        if (data.tokens?.refresh)
          localStorage.setItem("refreshToken", data.tokens.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));

        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setMessage("Google login error");
    } finally {
      setLoading(false);
    }
  };

  // Load Google script on mount
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
      document.body.removeChild(script);
    };
  }, []);

  const handleLogout = () => {
    setUser(null);
    setMessage("Logged out");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/");
  };

return (
  <div className="bgc-thm4">
    <Header20 />
    <section className="our-login">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 m-auto text-center">
            <div className="main-title">
              <h2 className="title">Login</h2>
              <p className="paragraph">
                Welcome back — please log in to your account to continue exploring.
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-8 mx-auto">
            <div className="log-reg-form form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
              <h4>Login to Your Account</h4>
                    <p className="text mt20">
        Don’t have an account?{" "}
        <Link href="/register" className="text-thm">
          Register here!
        </Link>
      </p>

              {/* Email/Password Form */}
              <div className="row">
                <div className="mb25 col-md-6">
                  <label className="form-label fw500 dark-color">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
                <div className="mb25 col-md-6">
                  <label className="form-label fw500 dark-color">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="********"
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={{ textAlign: "center", margin: "16px 0" }}>
                — or sign in with —
              </div>

              {/* Google Button */}
              {/* Google Sign-In Button rendered by Google SDK */}
<div id="google-signin-btn" style={{ width: "100%", marginBottom: "15px" }} />


              {/* LinkedIn Button */}
              <div
                onClick={() => (window.location.href = getLinkedInLoginURL())}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  height: "48px",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                  width: "100%",
                  fontWeight: 500,
                  fontSize: "16px",
                  marginBottom: "20px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow = "none")
                }
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
                  alt="LinkedIn"
                  style={{ width: 20, height: 20, marginRight: 10 }}
                />
                Sign up with LinkedIn
              </div>

              {/* Submit Button */}
              <div className="d-grid mb20">
                <button
                  className="ud-btn btn-thm default-box-shadow2"
                  type="button"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Create Account"}{" "}
                  <i className="fal fa-arrow-right-long" />
                </button>
              </div>

              {message && (
                <div className="alert alert-info mt-3" role="alert">
                  {message}
                </div>
              )}

              {user && (
                <div style={{ marginTop: 20 }}>
                  <p>
                    Logged in as <strong>{user.full_name || user.email}</strong>
                  </p>
                  <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);


}
