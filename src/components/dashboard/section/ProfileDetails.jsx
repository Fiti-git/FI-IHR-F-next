"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from '@/lib/axios';
import { API_BASE_URL } from '@/lib/config';

// ==========================================================================
// 1. CHILD COMPONENT: SelectInput (No changes needed here)
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
    option: "Select",
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
    <div className={`custom-select w-100 ${isOpen ? "is-open" : ""}`} ref={dropdownRef}>
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
// 2. PARENT COMPONENT: Freelancer Profile Details (Updated with Axios)
// ==========================================================================
export default function ProfileDetails() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const EXCLUDED_FIELDS = ["education", "work_experience", "user"];
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    full_name: "",
    phone_number: "",
    professional_title: "",
    hourly_rate: "",
    gender: "",
    experience_level: "",
    specialization: "",
    skills: [],
    country: "",
    city: "",
    language: "",
    language_proficiency: "",
    linkedin_or_github: "",
    bio: "",
    profile_image: null,
    resume: null,
  });
  const [initialProfileData, setInitialProfileData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedResumeName, setSelectedResumeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      // The Axios interceptor handles the token. If no token, it may redirect.
      try {
        const response = await api.get("/api/profile/freelancer/");
        const data = response.data; // Axios wraps the response in a `data` object

        if (data && Object.keys(data).length > 0) {
          const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()) : [];
          // Use first_name and last_name from top-level response (backend handles the nested user update)
          const fullProfileData = { 
            ...data, 
            skills: skillsArray,
            first_name: data.first_name || "",
            last_name: data.last_name || ""
          };

          setProfileData(fullProfileData);
          setInitialProfileData(fullProfileData);
          setHasProfile(true);

          if (data.profile_image) {
            const fullImageUrl = data.profile_image.startsWith("http")
              ? data.profile_image
              : `${API_BASE_URL}${data.profile_image}`;
            setSelectedImage(fullImageUrl);
          }

          if (data.resume) {
            const fullResumeUrl = data.resume.startsWith("http")
              ? data.resume
              : `${API_BASE_URL}${data.resume}`;
            setSelectedResumeName(fullResumeUrl.split('/').pop());
            setProfileData((prev) => ({ ...prev, resume: fullResumeUrl }));
          }
        } else {
          // This case handles a 200 OK with an empty object, indicating a new profile
          setIsEditMode(true);
          setHasProfile(false);
          setMessage("Welcome! Please complete your profile to get started.");
        }
      } catch (error) {
        // Handle cases where the profile doesn't exist (e.g., 404 Not Found)
        if (error.response && error.response.status === 404) {
          setIsEditMode(true);
          setHasProfile(false);
          setMessage("Welcome! Please complete your profile to get started.");
        } else {
          console.error("Error fetching profile:", error);
          setMessage(error.response?.data?.detail || "An error occurred while fetching your profile.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [router]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setProfileData({ ...profileData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setProfileData({ ...profileData, profile_image: file });
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedResumeName(file.name);
      setProfileData({ ...profileData, resume: file });
    }
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      const newSkill = e.target.value.trim();
      if (!profileData.skills.includes(newSkill)) {
        setProfileData({ ...profileData, skills: [...profileData.skills, newSkill] });
      }
      e.target.value = "";
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleCancel = () => {
    setProfileData(initialProfileData);
    setSelectedImage(initialProfileData.profile_image || null);
    setSelectedResumeName(initialProfileData.resume ? initialProfileData.resume.split('/').pop() : "");
    setIsEditMode(false);
    setMessage("");
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    // No need to get the token; the interceptor handles it.

    const dataToSend = new FormData();

    for (const key in profileData) {
      if (EXCLUDED_FIELDS.includes(key)) continue;

      const value = profileData[key];
      if (value === null || value === undefined || value === "") continue;

      if (key === "skills") {
        dataToSend.append(key, Array.isArray(value) ? value.join(",") : "");
      } else if (value instanceof File) {
        dataToSend.append(key, value);
      } else {
        dataToSend.append(key, value);
      }
    }

    try {
      const response = hasProfile
        ? await api.put("/api/profile/freelancer/", dataToSend)
        : await api.post("/api/profile/freelancer/", dataToSend);

      const updatedProfile = response.data; // Get data from Axios response
      const skillsArray = updatedProfile.skills ? updatedProfile.skills.split(',').map(s => s.trim()) : [];
      // Use first_name and last_name from top-level response (backend returns them after updating)
      const fullProfileData = { 
        ...updatedProfile, 
        skills: skillsArray,
        first_name: updatedProfile.first_name || "",
        last_name: updatedProfile.last_name || ""
      };

      setProfileData(fullProfileData);
      setInitialProfileData(fullProfileData);
      setHasProfile(true);

      if (updatedProfile.profile_image) {
        // The API returns a full URL, so we can use it directly
        setSelectedImage(updatedProfile.profile_image);
      }
      if (updatedProfile.resume) {
        setSelectedResumeName(updatedProfile.resume.split('/').pop());
      }


      setIsEditMode(false);
      setMessage("Profile saved successfully!");

    } catch (error) {
      console.error("Failed to save profile:", error.response);
      const errorData = error.response?.data;
      let errorMessage = "Failed to save profile. Please check your inputs.";

      if (typeof errorData === 'object' && errorData !== null) {
        // Format detailed error messages from the backend
        errorMessage = Object.entries(errorData)
          .map(([field, errors]) => `${field.replace(/_/g, " ")}: ${Array.isArray(errors) ? errors.join(' ') : errors}`)
          .join(' | ');
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 pb15 mb25">
        <h5 className="list-title">Profile Details</h5>
      </div>
      {message && <div className={`alert mb-3 ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

      <div className="col-xl-7">
        <div className="profile-box d-sm-flex align-items-center mb30">
          <div className="profile-img mb20-sm">
            {selectedImage ? (
              <Image
                height={71}
                width={71}
                className="rounded-circle wa-xs"
                src={selectedImage}
                style={{ height: "71px", width: "71px", objectFit: "cover" }}
                alt="profile"
              />
            ) : (
              <Image
                height={71}
                width={71}
                className="rounded-circle wa-xs"
                src="/images/team/fl-1.png"
                style={{ height: "71px", width: "71px", objectFit: "cover" }}
                alt="default-profile"
              />
            )}
          </div>
          {isEditMode &&
            <div className="profile-content ml20 ml0-xs">
              <div className="d-flex align-items-center my-3">
                <button className="tag-delt text-thm2" onClick={() => { setSelectedImage(null); setProfileData({ ...profileData, profile_image: null }); }}>
                  <span className="flaticon-delete text-thm2" />
                </button>
                <label>
                  <input type="file" accept=".png, .jpg, .jpeg" className="d-none" onChange={handleImageChange} />
                  <a className="upload-btn ml10">Upload Image</a>
                </label>
              </div>
              <p className="text mb-0">Max file size 1MB, .jpg, .png</p>
            </div>
          }
        </div>
      </div>

      <div className="col-lg-7">
        <form className="form-style1" onSubmit={(e) => e.preventDefault()}>
          <div className="row">
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">First Name</label>
                <input type="text" className="form-control" name="first_name" value={profileData.first_name || ""} onChange={handleChange} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">Last Name</label>
                <input type="text" className="form-control" name="last_name" value={profileData.last_name || ""} onChange={handleChange} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">Full Name</label>
                <input type="text" className="form-control" name="full_name" value={profileData.full_name || ""} onChange={handleChange} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">Phone Number</label>
                <input type="text" className="form-control" name="phone_number" value={profileData.phone_number || ""} onChange={handleChange} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">Professional Title</label>
                <input type="text" className="form-control" name="professional_title" value={profileData.professional_title || ""} onChange={handleChange} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <SelectInput label="Hourly Rate" value={profileData.hourly_rate} data={[{ option: "$30/hr", value: "30" }, { option: "$40/hr", value: "40" }, { option: "$50/hr", value: "50" }, { option: "$60/hr", value: "60" }, { option: "$70/hr", value: "70" }]} handler={(o, v) => handleSelectChange("hourly_rate", v)} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <SelectInput label="Gender" value={profileData.gender} data={[{ option: "Male", value: "male" }, { option: "Female", value: "female" }, { option: "Other", value: "other" }]} handler={(o, v) => handleSelectChange("gender", v)} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <SelectInput label="Experience Level" value={profileData.experience_level} data={[{ option: "Beginner", value: "beginner" }, { option: "Mid", value: "mid" }, { option: "Senior", value: "senior" }]} handler={(o, v) => handleSelectChange("experience_level", v)} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <SelectInput label="Specialization" value={profileData.specialization} data={[{ option: "Web Dev", value: "web-dev" }, { option: "Design", value: "design" }, { option: "Marketing", value: "marketing" }]} handler={(o, v) => handleSelectChange("specialization", v)} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <SelectInput label="Country" value={profileData.country} data={[{ option: "UAE", value: "uae" }, { option: "UK", value: "uk" }, { option: "USA", value: "usa" }, { option: "India", value: "india" }]} handler={(o, v) => handleSelectChange("country", v)} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <SelectInput label="City" value={profileData.city} data={[{ option: "Dubai", value: "dubai" }, { option: "London", value: "london" }, { option: "New York", value: "new-york" }, { option: "Toronto", value: "toronto" }]} handler={(o, v) => handleSelectChange("city", v)} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <SelectInput label="Language" value={profileData.language} data={[{ option: "English", value: "english" }, { option: "Arabic", value: "arabic" }, { option: "French", value: "french" }, { option: "Spanish", value: "spanish" }]} handler={(o, v) => handleSelectChange("language", v)} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <SelectInput label="Language Proficiency" value={profileData.language_proficiency} data={[{ option: "Beginner", value: "beginner" }, { option: "Intermediate", value: "intermediate" }, { option: "Advanced", value: "advanced" }, { option: "Fluent", value: "fluent" }]} handler={(o, v) => handleSelectChange("language_proficiency", v)} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">Skills</label>
                <input type="text" className="form-control" onKeyDown={handleSkillKeyDown} disabled={!isEditMode} placeholder={isEditMode ? "Type skill and press Enter" : ""} />
                <div className="mt-2 d-flex flex-wrap" style={{ gap: '10px' }}>
                  {profileData.skills.map((skill) => (
                    <span key={skill} className="badge bg-light text-dark">
                      {skill}
                      {isEditMode && <span className="ms-2 cursor-pointer text-danger" onClick={() => removeSkill(skill)}>×</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">Resume (PDF, DOCX)</label>
                <div className="d-flex align-items-center">
                  {isEditMode && (
                    <label className="upload-btn-style2 me-3">
                      <input type="file" accept=".pdf,.doc,.docx" className="d-none" onChange={handleResumeChange} />
                      <span className="ud-btn btn-white">Choose File<i className="fal fa-arrow-right-long ms-2"></i></span>
                    </label>
                  )}
                  {profileData.resume && !(profileData.resume instanceof File) ? (
                    <p className="mb-0 text-muted">
                      Current:{" "}
                      <a
                        href={profileData.resume} // It's already a full URL
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-thm"
                      >
                        {selectedResumeName || "View Resume"}
                      </a>
                    </p>
                  ) : selectedResumeName && (
                    <p className="mb-0 text-muted">New: {selectedResumeName}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">LinkedIn / GitHub URL</label>
                <input type="text" className="form-control" name="linkedin_or_github" value={profileData.linkedin_or_github || ""} onChange={handleChange} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">Bio</label>
                <textarea className="form-control" rows={5} name="bio" value={profileData.bio || ""} onChange={handleChange} disabled={!isEditMode} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="text-start">
                {isEditMode ? (
                  <>
                    <button type="button" className="ud-btn btn-thm" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Changes"}<i className="fal fa-arrow-right-long ms-2" /></button>
                    {hasProfile && <button type="button" className="ud-btn btn-light-gray ms-3" onClick={handleCancel} disabled={loading}>Cancel</button>}
                  </>
                ) : (
                  <button type="button" className="ud-btn btn-thm" onClick={() => { setIsEditMode(true); setMessage(""); }}>Edit Profile<i className="fal fa-edit ms-2" /></button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}