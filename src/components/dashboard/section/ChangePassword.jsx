"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios"; // Import your custom axios instance

export default function ChangePassword() {
  const [hasPassword, setHasPassword] = useState(null); // null | true | false
  const [isEditing, setIsEditing] = useState(false); // State to toggle form visibility
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Check if the user has a password when the component loads
  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        const response = await api.get("/api/profile/password-status/");
        setHasPassword(response.data.has_password);
      } catch (error) {
        console.error("Failed to check password status:", error);
        setMessage({ type: "error", text: "Could not verify account status." });
      }
    };
    checkPasswordStatus();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" }); // Clear message on new input
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ old_password: "", new_password: "", confirm_password: "" });
    setMessage({ type: "", text: "" }); // Clear any error messages
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setLoading(true);

    const payload = { new_password: formData.new_password };
    if (hasPassword) {
      payload.old_password = formData.old_password;
    }

    try {
      await api.put("/api/profile/change-password/", payload);
      setMessage({ type: "success", text: "Password updated successfully!" });
      setFormData({ old_password: "", new_password: "", confirm_password: "" });
      setIsEditing(false); // Hide form on success
    } catch (error) {
      const errors = error.response?.data;
      let errorText = "An unexpected error occurred.";
      if (errors) {
        errorText = Object.values(errors).flat().join(" ");
      }
      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  if (hasPassword === null) {
    return (
      <div className="ps-widget bgc-white bdrs4 p30 mb30">
        <p>Checking account status...</p>
      </div>
    );
  }

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 pb15 mb25 d-flex justify-content-between align-items-center">
        <h5 className="list-title">{hasPassword ? "Change Password" : "Set a New Password"}</h5>
        {!isEditing && (
          <button className="ud-btn btn-thm-border" onClick={() => { setIsEditing(true); setMessage({ type: "", text: "" }) }}>
            Edit<i className="fal fa-edit ms-2" />
          </button>
        )}
      </div>
      <div className="col-lg-7">
        {!hasPassword && !isEditing && (
          <p className="text mb20">
            You are using a social account to log in. You can set a password to enable direct login.
          </p>
        )}

        {message.text && (
          <div className={`alert mb-3 ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {message.text}
          </div>
        )}

        {isEditing && (
          <form className="form-style1" onSubmit={handleSubmit}>
            <div className="row">
              {hasPassword && (
                <div className="col-sm-6">
                  <div className="mb20">
                    <label className="heading-color ff-heading fw500 mb10">Old Password</label>
                    <input
                      type="password"
                      name="old_password"
                      className="form-control"
                      placeholder="********"
                      value={formData.old_password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="row">
              <div className="col-sm-12">
                <div className="mb20">
                  <label className="heading-color ff-heading fw500 mb10">New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    className="form-control"
                    placeholder="********"
                    value={formData.new_password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="mb20">
                  <label className="heading-color ff-heading fw500 mb10">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    className="form-control"
                    placeholder="********"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="text-start">
                  <button type="submit" className="ud-btn btn-thm" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                    <i className="fal fa-arrow-right-long ms-2" />
                  </button>
                  <button type="button" className="ud-btn btn-light-gray ms-3" onClick={handleCancel} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}