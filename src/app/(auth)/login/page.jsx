"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";
import Link from "next/link";
import api from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Helper: Redirect based on role
  const handleRedirect = (user) => {
    const role = user?.role?.toLowerCase();

    if (role === "employer") {
      router.push("/job-provider");
    } else if (role === "employee") {
      router.push("/freelancer");
    } else {
      router.push("/select-role");
    }
  };

  // Helper: Decode JWT to get User ID
  const decodeJwt = (token) => {
    try {
      const parts = token.split(".");
      const payload = JSON.parse(atob(parts[1]));
      return payload.user_id;
    } catch (e) {
      return null;
    }
  };

  // Login Handler
  const handleEmailLogin = async () => {
    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/myapi/login/", {
        email,
        password,
      });

      const data = res.data;

      // Axios throws on 4xx/5xx usually, but if structure is different:
      if (res.status !== 200) {
        setMessage(data.error || "Login failed.");
      } else {
        // Store Tokens
        localStorage.setItem("access_token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
        
        // Store Cookie
        document.cookie = `token=${data.tokens.access}; path=/; max-age=${15 * 60}; SameSite=Lax`;

        // Store User ID
        const decodedUserId = decodeJwt(data.tokens.access);
        if (decodedUserId) {
            localStorage.setItem("user_id", decodedUserId);
        }

        handleRedirect(data.user);
      }
    } catch (error) {
      // Handle backend errors
      setMessage(error.response?.data?.error || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bgc-thm4">
      <Header20 />

      <section className="our-register">
        <div className="container">
          {/* Title */}
          <div className="row">
            <div className="col-lg-6 m-auto text-center">
              <h2 className="title">Login</h2>
              <p>Welcome back! Please enter your credentials.</p>
            </div>
          </div>

          {/* Form */}
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

                {/* Email + Password */}
                <div className="row">
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                      placeholder="example@gmail.com"
                    />
                  </div>

                  <div className="mb25 col-md-6">
                    <label className="form-label fw500">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-control"
                      placeholder="********"
                    />
                  </div>
                </div>

                {/* Login Button */}
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

                {/* Error message */}
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