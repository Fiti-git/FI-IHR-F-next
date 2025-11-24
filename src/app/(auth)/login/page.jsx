"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";
import Link from "next/link";
import api from '@/lib/axios';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const GOOGLE_CLIENT_ID =
    "858134682989-mav50sd3csolb7u8tbc1susrhm5uvk49.apps.googleusercontent.com";

  // Redirect based on user role from backend
  const handleRedirect = (user) => {
    if (user.role === "Employer") {
      router.push("/job-provider");
    } else if (user.role === "Employee") {
      router.push("/Employee");
    } else {
      router.push("/select-role");
    }
  };

  // Check for ?verified=true param
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setMessage("Email verified successfully! Please log in to continue.");
    }
  }, [searchParams]);

  // Handle email login
  const handleEmailLogin = async () => {
    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post('/myapi/login/', {
        email,
        password
      });
      const data = await res.data;

      if (res.statusText != "OK") {
        setMessage(
          data.error || "Login failed. Please check your credentials."
        );
      } else {
        localStorage.setItem("access_token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        document.cookie = `token=${data.tokens.access}; path=/; max-age=${15 * 60}; SameSite=Lax`;

        const decodedUserId = decodeJwt(data.tokens.access);
        localStorage.setItem("user_id", decodedUserId);

        handleRedirect(data.user);
      }
    } catch (error) {
      setMessage("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleResponse = async (response) => {
    setLoading(true);
    try {
      const res = await api.post('/myapi/google-login/', {
        token: response.credential
      });
      const data = await res.data;

      if (res.statusText != "OK") {
        setMessage(data.error || "Google login failed.");
      } else {
        localStorage.setItem("access_token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        document.cookie = `token=${data.tokens.access}; path=/; max-age=${15 * 60}; SameSite=Lax`;

        const decodedUserId = decodeJwt(data.tokens.access);
        localStorage.setItem("user_id", decodedUserId);

        handleRedirect(data.user);
      }
    } catch (error) {
      setMessage("An error occurred with Google Login.");
    } finally {
      setLoading(false);
    }
  };

  // Decode JWT manually
  const decodeJwt = (token) => {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid token");
    const payload = parts[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.user_id;
  };

  // Load Google script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-login-btn"),
        { theme: "outline", size: "large", width: "100%" }
      );
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
          <div className="row">
            <div className="col-lg-6 m-auto text-center">
              <div className="main-title">
                <h2 className="title">Login</h2>
                <p className="paragraph">
                  Welcome back! Please enter your credentials.
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
                  <Link href="/register" className="text-thm">
                    Create one!
                  </Link>
                </p>

                <div className="row">
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500 dark-color">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500 dark-color">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="d-grid mb20">
                  <button
                    className="ud-btn btn-thm"
                    type="button"
                    onClick={handleEmailLogin}
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}{" "}
                    <i className="fal fa-arrow-right-long" />
                  </button>
                </div>

                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  — or sign in with —
                </div>

                <div id="google-login-btn" />

                {message && (
                  <div className="alert alert-danger mt-3">{message}</div>
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

// ✅ Wrap the component with Suspense to fix the build error
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading login page...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
