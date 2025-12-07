"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";
import Link from "next/link";
import api from '@/lib/axios';

export default function RegisterPage() {
  const router = useRouter();

  // State for form inputs and loading/messages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle Email & Password Registration
  const handleEmailRegister = async () => {
    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post('/myapi/signup/', {
        email,
        password
      });

      const data = res.data;

      if (res.status !== 200) {
        setMessage(data.error || "Registration failed.");
      } else {
        setMessage(data.message || "Registration successful!");
      }
    } catch (error) {
      setMessage("An error occurred during registration.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bgc-thm4">
      <Header20 />
      <section className="our-register">
        <div className="container">
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

                {message && (
                  <div className="alert alert-info mt-3">
                    {message}
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
