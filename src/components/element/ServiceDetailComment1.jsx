"use client";

import { useState } from "react";

export default function ServiceContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      setSuccess("Your message has been sent successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bsp_contact_wrt mb20">
      <h6 className="fz18 fw600 mb-2">Contact</h6>
      <p className="text fz16">
        Please provide your contact details and message below.
      </p>

      <form className="contact_form mt30 mb30-md" onSubmit={handleSubmit}>
        <div className="row">
          {/* Name */}
          <div className="col-md-6 mb-3">
            <label className="fw600 ff-heading dark-color mb-2 fz15">
              Name
            </label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="col-md-6 mb-3">
            <label className="fw600 ff-heading dark-color mb-2 fz15">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="col-md-6 mb-3">
            <label className="fw600 ff-heading dark-color mb-2 fz15">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Message */}
          <div className="col-md-6 mb-3">
            <label className="fw600 ff-heading dark-color mb-2 fz15">
              Message
            </label>
            <textarea
              name="message"
              className="form-control pt15"
              rows={5}
              placeholder="Write your message here..."
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          {/* Success / Error */}
          {success && (
            <div className="col-md-12 text-success mb-2">
              {success}
            </div>
          )}
          {error && (
            <div className="col-md-12 text-danger mb-2">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="col-md-12 mt-2">
            <button
              type="submit"
              className="ud-btn btn-thm"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
              <i
                className="fal fa-arrow-right-long"
                style={{ marginLeft: "8px" }}
              />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
