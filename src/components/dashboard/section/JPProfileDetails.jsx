"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from '@/lib/axios';

// ==========================================================================
// 1. CHILD COMPONENT: SelectInput (No changes needed)
// ==========================================================================
function SelectInput({
  label,
  data,
  handler,
  value,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedItem = data.find((item) => item.value === value) || {
    option: label || "Select",
    value: null,
  };

  const handleSelect = (item) => {
    if (!disabled) {
      handler(item.option, item.value);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div
      className={`custom-select w-100 ${isOpen ? "is-open" : ""}`}
      ref={dropdownRef}
    >
      <label className="heading-color ff-heading fw500 mb10">{label}</label>
      <div
        className={`select-custom ${disabled ? "disabled" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="filter-option">
          <div className="filter-option-inner">
            <div className="filter-option-inner-inner">
              {selectedItem.option}
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <ul className="select-options">
          {data.map((item, index) => (
            <li
              key={index}
              className={item.value === value ? "selected" : ""}
              onClick={() => handleSelect(item)}
            >
              {item.option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


// ==========================================================================
// 2. PARENT COMPONENT: JobProviderProfile (Refactored and Corrected)
// ==========================================================================
export default function JobProviderProfile() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    profile_image: null,
    company_name: "",
    email_address: "",
    phone_number: "",
    company_overview: "",
    job_type: "full-time",
    industry: "technology",
    country: "usa",
  });
  const [initialProfileData, setInitialProfileData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/profile/job-provider/");

        // If data is returned, it means a profile exists.
        setProfileData(response.data);
        setInitialProfileData(response.data);
        setHasProfile(true);
        if (response.data.profile_image) {
          // Assuming the API returns a full URL. If not, prefix it.
          const fullImageUrl = response.data.profile_image.startsWith("http")
            ? response.data.profile_image
            : `http://1227.0.0.1:8000${response.data.profile_image}`;
          setSelectedImage(fullImageUrl);
        }
      } catch (error) {
        // A 404 error means the profile doesn't exist yet, which is not a "real" error.
        if (error.response && error.response.status === 404) {
          setIsEditMode(true);
          setHasProfile(false);
          setMessage("Create your company profile to get started.");
        } else {
          // Handle other errors like 401 Unauthorized or 500 Server Error
          setMessage(error.response?.data?.detail || "An error occurred while fetching your profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  // Added the missing handleImageChange function
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a local URL for instant preview
      setSelectedImage(URL.createObjectURL(file));
      // Store the file object in state to be uploaded
      setProfileData({ ...profileData, profile_image: file });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setProfileData({ ...profileData, [name]: value });
  };

  const handleCancel = () => {
    setProfileData(initialProfileData);
    setSelectedImage(initialProfileData.profile_image || null);
    setIsEditMode(false);
    setMessage("");
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    const dataToSend = new FormData();
    // Append all profile data to the FormData object
    Object.keys(profileData).forEach(key => {
      const value = profileData[key];
      if (value !== null && value !== undefined) {
        // Only append the profile_image if it's a new file.
        // Otherwise, the backend will keep the old one.
        if (key === 'profile_image' && !(value instanceof File)) {
          return;
        }
        dataToSend.append(key, value);
      }
    });

    try {
      // Use PUT to update an existing profile, and POST to create a new one.
      const response = hasProfile
        ? await api.put("/api/profile/job-provider/", dataToSend)
        : await api.post("/api/profile/job-provider/", dataToSend);

      setProfileData(response.data);
      setInitialProfileData(response.data);
      setHasProfile(true);
      if (response.data.profile_image) {
        setSelectedImage(response.data.profile_image);
      }
      setIsEditMode(false);
      setMessage("Profile saved successfully!");

    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        // Format and display validation errors from the API
        const errorMessages = Object.entries(errorData)
          .map(([field, errors]) => `${field.replace("_", " ")}: ${Array.isArray(errors) ? errors.join(' ') : errors}`)
          .join(' | ');
        setMessage(errorMessages);
      } else {
        setMessage(error.message || "Failed to save profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title">Company Profile</h5>
        </div>
        {message && <div className={`alert mb-3 ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

        <div className="col-xl-7">
          <div className="profile-box d-sm-flex align-items-center mb30">
            <div className="profile-img mb20-sm">
              <Image
                height={71}
                width={71}
                className="rounded-circle wa-xs"
                src={selectedImage || "/images/team/fl-1.png"}
                style={{ height: "71px", width: "71px", objectFit: "cover" }}
                alt="profile"
              />
            </div>
            {isEditMode && (
              <div className="profile-content ml20 ml0-xs">
                <div className="d-flex align-items-center my-3">
                  <button className="tag-delt text-thm2" onClick={() => {
                    setSelectedImage(null);
                    setProfileData({ ...profileData, profile_image: null });
                  }}>
                    <span className="flaticon-delete text-thm2" />
                  </button>
                  <label>
                    <input
                      type="file"
                      accept=".png, .jpg, .jpeg"
                      className="d-none"
                      onChange={handleImageChange}
                    />
                    <span className="upload-btn ml10" style={{ cursor: 'pointer' }}>Upload Logo</span>
                  </label>
                </div>
                <p className="text mb-0">Max file size is 1MB. JPG or PNG.</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-7">
          <form className="form-style1" onSubmit={(e) => e.preventDefault()}>
            <div className="row">
              <div className="col-sm-6">
                <div className="mb20">
                  <label className="heading-color ff-heading fw500 mb10">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="company_name"
                    value={profileData.company_name || ""}
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="mb20">
                  <label className="heading-color ff-heading fw500 mb10">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email_address"
                    value={profileData.email_address || ""}
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="mb20">
                  <label className="heading-color ff-heading fw500 mb10">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone_number"
                    value={profileData.phone_number || ""}
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="mb20">
                  <SelectInput
                    label="Country"
                    value={profileData.country}
                    data={[
                      { option: "United States", value: "usa" },
                      { option: "Canada", value: "canada" },
                      { option: "United Kingdom", value: "uk" },
                    ]}
                    handler={(option, value) => handleSelectChange("country", value)}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="mb20">
                  <label className="heading-color ff-heading fw500 mb10">Company Overview</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    name="company_overview"
                    value={profileData.company_overview || ""}
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                </div>
              </div>

              <div className="col-sm-6">
                <div className="mb20">
                  <SelectInput
                    label="Primary Job Type Offered"
                    value={profileData.job_type}
                    data={[
                      { option: "Full-time", value: "full-time" },
                      { option: "Part-time", value: "part-time" },
                      { option: "Remote", value: "remote" },
                      { option: "Contract", value: "contract" },
                    ]}
                    handler={(option, value) => handleSelectChange("job_type", value)}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="mb20">
                  <SelectInput
                    label="Industry"
                    value={profileData.industry}
                    data={[
                      { option: "Technology", value: "technology" },
                      { option: "Healthcare", value: "healthcare" },
                      { option: "Finance", value: "finance" },
                      { option: "Education", value: "education" },
                      { option: "Retail", value: "retail" },
                    ]}
                    handler={(option, value) => handleSelectChange("industry", value)}
                    disabled={!isEditMode}
                  />
                </div>
              </div>

              <div className="col-md-12">
                <div className="text-start">
                  {isEditMode ? (
                    <>
                      <button type="button" className="ud-btn btn-thm" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                        <i className="fal fa-arrow-right-long ms-2" />
                      </button>
                      {hasProfile &&
                        <button type="button" className="ud-btn btn-light-gray ms-3" onClick={handleCancel} disabled={loading}>
                          Cancel
                        </button>
                      }
                    </>
                  ) : (
                    <button type="button" className="ud-btn btn-thm" onClick={() => { setIsEditMode(true); setMessage(""); }}>
                      Edit Profile
                      <i className="fal fa-edit ms-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}