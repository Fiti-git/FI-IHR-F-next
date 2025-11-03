"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ==========================================================================
// 1. CHILD COMPONENT: SelectInput
// This is the updated, controlled component.
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
      className={`custom-select ${isOpen ? "is-open" : ""}`}
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
// 2. PARENT COMPONENT: JobProviderProfile
// This is the main component for your page.
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
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setMessage("Authentication error. Please log in again.");
        setLoading(false);
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("http://206.189.134.117:8000/api/profile/job-provider/", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            setProfileData(data);
            setInitialProfileData(data);
            setHasProfile(true);
            if (data.profile_image) {
              setSelectedImage(data.profile_image);
            }
          } else {
            setIsEditMode(true);
            setHasProfile(false);
            setMessage("Create your company profile to get started.");
          }
        } else {
          setMessage("Could not load your profile. Please try again.");
        }
      } catch (error) {
        setMessage("An error occurred while fetching your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
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
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/login");
      return;
    }

    const method = hasProfile ? "PUT" : "POST";
    const dataToSend = new FormData();

    for (const key in profileData) {
      const value = profileData[key];
      if (key === 'profile_image' && value instanceof File) {
        dataToSend.append(key, value);
      } else if (key !== 'profile_image' && value !== null && value !== undefined) {
        dataToSend.append(key, value);
      }
    }

    try {
      const res = await fetch("http://206.189.134.117:8000/api/profile/job-provider/", {
        method: method,
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
        body: dataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessages = Object.entries(errorData)
          .map(([field, errors]) => `${field.replace("_", " ")}: ${errors.join(' ')}`)
          .join(' | ');
        throw new Error(errorMessages || "Failed to save profile.");
      }

      const updatedProfile = await res.json();
      setProfileData(updatedProfile);
      setInitialProfileData(updatedProfile);
      setHasProfile(true);
      if (updatedProfile.profile_image) {
        setSelectedImage(updatedProfile.profile_image);
      }
      setIsEditMode(false);
      setMessage("Profile saved successfully!");

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        {message && <div className={`alert mb-3 ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

        <div className="col-xl-7">
          <div className="profile-box d-sm-flex align-items-center mb30">
            <div className="profile-img mb20-sm">
              <Image
                height={71}
                width={71}
                className="rounded-circle wa-xs"
                src={selectedImage ? selectedImage : "/images/team/fl-1.png"}
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
                    <a className="upload-btn ml10">Upload Logo</a>
                  </label>
                </div>
                <p className="text mb-0">Max file size is 1MB. Suitable files are .jpg & .png</p>
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
              <div className="col-sm-12">
                <div className="mb20">
                  <label className="heading-color ff-heading fw500 mb10">Company Overview</label>
                  <textarea
                    className="form-control"
                    rows="4"
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
                    label="Job Type"
                    value={profileData.job_type}
                    data={[
                      { option: "Full-time", value: "full-time" },
                      { option: "Part-time", value: "part-time" },
                      { option: "Remote", value: "remote" },
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
                    ]}
                    handler={(option, value) => handleSelectChange("industry", value)}
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

              <div className="col-md-12">
                <div className="text-start">
                  {isEditMode ? (
                    <>
                      <button type="button" className="ud-btn btn-thm" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                        <i className="fal fa-arrow-right-long" />
                      </button>
                      {hasProfile &&
                        <button type="button" className="ud-btn btn-light-gray ml-3" onClick={handleCancel} disabled={loading}>
                          Cancel
                        </button>
                      }
                    </>
                  ) : (
                    <button type="button" className="ud-btn btn-thm" onClick={() => { setIsEditMode(true); setMessage(""); }}>
                      Edit Profile
                      <i className="fal fa-edit" />
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