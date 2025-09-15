"use client";
import { useState } from "react";
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
    country: "",
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    // Submit logic
    console.log(formData);
  };

  return (
    <div className="bgc-thm4">
      <Header20 />

      <section className="our-register">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 m-auto text-center">
              <div className="main-title">
                <h2 className="title">Register</h2>
                <p className="paragraph">
                  Give your visitor a smooth online experience with a solid UX design
                </p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-xl-8 mx-auto">
              <div className="log-reg-form form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
                <h4>Create Your Account</h4>
                <p className="text mt20">
                  Already have an account?{" "}
                  <Link href="/login" className="text-thm">Log In!</Link>
                </p>

                {/* FORM GRID */}
                <div className="row">

                  {/* Full Name */}
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500 dark-color">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-control"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Email */}
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500 dark-color">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
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
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500 dark-color">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="********"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>


                  {/* Country */}
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500 dark-color">Country / Location</label>
                    <input
                      type="text"
                      name="country"
                      className="form-control"
                      placeholder="United States"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Phone (optional) */}
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500 dark-color">Phone Number (optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="+1234567890"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

{/* Role */}
<div className="mb25 col-12">
  <label className="form-label fw500 dark-color">Select Role</label>
  <select
    name="role"
    className="form-control"
    value={formData.role}
    onChange={handleChange}
  >
    <option value="">-- Choose Role --</option>
    <option value="freelancer">Freelancer</option>
    <option value="jobProvider">Job Provider</option>
  </select>
</div>


                  {/* Terms & Conditions */}
                  <div className="mb25 col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="agree"
                        name="agree"
                        checked={formData.agree}
                        onChange={handleChange}
                      />
                      <label className="form-check-label ms-2" htmlFor="agree">
                        I agree to the{" "}
                        <Link href="/terms" className="text-thm">Terms & Conditions</Link>
                      </label>
                    </div>
                  </div>

                </div>

                {/* Submit */}
                <div className="d-grid mb20">
                  <button
                    className="ud-btn btn-thm default-box-shadow2"
                    type="button"
                    onClick={handleSubmit}
                    disabled={!formData.agree}
                  >
                    Create Account <i className="fal fa-arrow-right-long" />
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
