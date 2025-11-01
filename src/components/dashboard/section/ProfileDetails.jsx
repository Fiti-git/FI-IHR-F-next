"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ==========================================================================
// 1. CHILD COMPONENT: SelectInput
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
// 2. PARENT COMPONENT: Freelancer Profile Details
// ==========================================================================
export default function ProfileDetails() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState({
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
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("http://206.189.134.117:8000/api/profile/freelancer/", {
          headers: { "Authorization": `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()) : [];
            const fullProfileData = { ...data, skills: skillsArray };

            setProfileData(fullProfileData);
            setInitialProfileData(fullProfileData);
            setHasProfile(true);

            if (data.profile_image) setSelectedImage(data.profile_image);
            if (data.resume) setSelectedResumeName(data.resume.split('/').pop());
          } else {
            setIsEditMode(true);
            setHasProfile(false);
            setMessage("Welcome! Please complete your profile to get started.");
          }
        } else {
          setMessage("Could not load profile. Please try again.");
        }
      } catch (error) {
        setMessage("An error occurred while fetching your profile.");
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
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/login");
      return;
    }

    const method = hasProfile ? "PUT" : "POST";
    const dataToSend = new FormData();

    for (const key in profileData) {
      const value = profileData[key];

      // Skip null or undefined values
      if (value === null || value === undefined) {
        continue;
      }

      if (key === 'skills') {
        const skillsString = Array.isArray(value) ? value.join(',') : '';
        dataToSend.append(key, skillsString);
      } else if (value instanceof File) {
        dataToSend.append(key, value);
      } else if (key !== 'profile_image' && key !== 'resume') {
        dataToSend.append(key, value);
      }
    }

    try {
      const res = await fetch("http://206.189.134.117:8000/api/profile/freelancer/", {
        method: method,
        headers: { "Authorization": `Bearer ${accessToken}` },
        body: dataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessages = Object.entries(errorData)
          .map(([field, errors]) => `${field.replace(/_/g, " ")}: ${errors.join(' ')}`)
          .join(' | ');
        throw new Error(errorMessages || "Failed to save profile.");
      }

      const updatedProfile = await res.json();
      const skillsArray = updatedProfile.skills ? updatedProfile.skills.split(',').map(s => s.trim()) : [];
      const fullProfileData = { ...updatedProfile, skills: skillsArray };

      setProfileData(fullProfileData);
      setInitialProfileData(fullProfileData);
      setHasProfile(true);
      if (updatedProfile.profile_image) setSelectedImage(updatedProfile.profile_image);
      if (updatedProfile.resume) setSelectedResumeName(updatedProfile.resume.split('/').pop());

      setIsEditMode(false);
      setMessage("Profile saved successfully!");

    } catch (error) {
      setMessage(error.message);
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
        {/* ... (The rest of your JSX remains exactly the same) ... */}
        <div className="profile-box d-sm-flex align-items-center mb30">
          <div className="profile-img mb20-sm">
            <Image height={71} width={71} className="rounded-circle wa-xs" src={selectedImage || "/images/team/fl-1.png"} style={{ height: "71px", width: "71px", objectFit: "cover" }} alt="profile" />
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
            {/* ... (All your input fields and JSX) ... */}
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
                  {selectedResumeName && <p className="mb-0 text-muted">Current: {selectedResumeName}</p>}
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