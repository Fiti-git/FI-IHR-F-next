"use client";

import React, { useState } from "react";
import SelectInput from "../option/SelectInput";
import Link from "next/link";
import Image from "next/image";

export default function ProfileDetails() {
  const [getHourly, setHourly] = useState({ option: "Select", value: null });
  const [getGender, setGender] = useState({ option: "Select", value: null });
  const [getExperience, setExperience] = useState({ option: "Select", value: null });
  const [getSpecialization, setSpecialization] = useState({ option: "Select", value: null });
  const [getCountry, setCountry] = useState({ option: "Select", value: null });
  const [getCity, setCity] = useState({ option: "Select", value: null });
  const [getLanguage, setLanguage] = useState({ option: "Select", value: null });
  const [getLanLevel, setLanLevel] = useState({ option: "Select", value: null });
  const [selectedImage, setSelectedImage] = useState(null);
  const [skills, setSkills] = useState([]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
  };

  const hourlyHandler = (option, value) => setHourly({ option, value });
  const genderHandler = (option, value) => setGender({ option, value });
  const experienceHandler = (option, value) => setExperience({ option, value });
  const specializationHandler = (option, value) => setSpecialization({ option, value });
  const countryHandler = (option, value) => setCountry({ option, value });
  const cityHandler = (option, value) => setCity({ option, value });
  const languageHandler = (option, value) => setLanguage({ option, value });
  const lanLevelHandler = (option, value) => setLanLevel({ option, value });

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" && e.target.value) {
      e.preventDefault();
      if (!skills.includes(e.target.value)) {
        setSkills([...skills, e.target.value]);
      }
      e.target.value = "";
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 pb15 mb25">
        <h5 className="list-title">Profile Details</h5>
      </div>
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
          <div className="profile-content ml20 ml0-xs">
            <div className="d-flex align-items-center my-3">
              <a className="tag-delt text-thm2" onClick={() => setSelectedImage(null)}>
                <span className="flaticon-delete text-thm2" />
              </a>
              <label>
                <input type="file" accept=".png, .jpg, .jpeg" className="d-none" onChange={handleImageChange} />
                <a className="upload-btn ml10">Upload Image</a>
              </label>
            </div>
            <p className="text mb-0">
              Max file size is 1MB, Minimum dimension: 330x300, Supported: .jpg, .png
            </p>
          </div>
        </div>
      </div>

      <div className="col-lg-7">
        <form className="form-style1">
          <div className="row">

            {/* Full Name */}
            <div className="col-sm-6 mb20">
              <label className="heading-color ff-heading fw500 mb10">Full Name</label>
              <input type="text" className="form-control" placeholder="Jane Doe" />
            </div>

            {/* Email */}
            <div className="col-sm-6 mb20">
              <label className="heading-color ff-heading fw500 mb10">Email Address</label>
              <input type="email" className="form-control" placeholder="jane@example.com" />
            </div>

            {/* Phone */}
            <div className="col-sm-6 mb20">
              <label className="heading-color ff-heading fw500 mb10">Phone Number</label>
              <input type="text" className="form-control" placeholder="+971 50 123 4567" />
            </div>

            {/* Title */}
            <div className="col-sm-6 mb20">
              <label className="heading-color ff-heading fw500 mb10">Professional Title</label>
              <input type="text" className="form-control" placeholder="Full Stack Developer" />
            </div>

            {/* Hourly Rate */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Hourly Rate"
                defaultSelect={getHourly}
                data={[
                  { option: "$30/hr", value: "30" },
                  { option: "$40/hr", value: "40" },
                  { option: "$50/hr", value: "50" },
                  { option: "$60/hr", value: "60" },
                  { option: "$70/hr", value: "70" },
                ]}
                handler={hourlyHandler}
              />
            </div>

            {/* Gender */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Gender"
                defaultSelect={getGender}
                data={[
                  { option: "Male", value: "male" },
                  { option: "Female", value: "female" },
                  { option: "Other", value: "other" },
                ]}
                handler={genderHandler}
              />
            </div>

            {/* Experience Level */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Experience Level"
                defaultSelect={getExperience}
                data={[
                  { option: "Beginner", value: "beginner" },
                  { option: "Mid", value: "mid" },
                  { option: "Senior", value: "senior" },
                ]}
                handler={experienceHandler}
              />
            </div>

            {/* Specialization */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Specialization"
                defaultSelect={getSpecialization}
                data={[
                  { option: "Web Dev", value: "web-dev" },
                  { option: "Design", value: "design" },
                  { option: "Marketing", value: "marketing" },
                ]}
                handler={specializationHandler}
              />
            </div>

            {/* Skills */}
            <div className="col-md-12 mb20">
              <label className="heading-color ff-heading fw500 mb10">Skills (press Enter to add)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Type a skill and press Enter"
                onKeyDown={handleSkillKeyDown}
              />
              <div className="mt-2 d-flex flex-wrap">
                {skills.map((skill, idx) => (
                  <span key={idx} className="badge badge-light me-2 mb-2">
                    {skill}
                    <span
                      className="ms-2 cursor-pointer text-danger"
                      onClick={() => removeSkill(skill)}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Country */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Country"
                defaultSelect={getCountry}
                data={[
                  { option: "UAE", value: "uae" },
                  { option: "UK", value: "uk" },
                  { option: "USA", value: "usa" },
                  { option: "India", value: "india" },
                ]}
                handler={countryHandler}
              />
            </div>

            {/* City */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="City"
                defaultSelect={getCity}
                data={[
                  { option: "Dubai", value: "dubai" },
                  { option: "London", value: "london" },
                
                  { option: "New York", value: "new-york" },
                  { option: "Toronto", value: "toronto" },
                ]}
                handler={cityHandler}
              />
            </div>

            {/* Language */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Language"
                defaultSelect={getLanguage}
                data={[
                  { option: "English", value: "english" },
                  { option: "Arabic", value: "arabic" },
                  { option: "French", value: "french" },
                  { option: "Spanish", value: "spanish" },
                ]}
                handler={languageHandler}
              />
            </div>

            {/* Language Proficiency */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Language Proficiency"
                defaultSelect={getLanLevel}
                data={[
                  { option: "Beginner", value: "beginner" },
                  { option: "Intermediate", value: "intermediate" },
                  { option: "Advanced", value: "advanced" },
                  { option: "Fluent", value: "fluent" },
                ]}
                handler={lanLevelHandler}
              />
            </div>

            {/* LinkedIn/GitHub */}
            <div className="col-md-12 mb20">
              <label className="heading-color ff-heading fw500 mb10">
                LinkedIn / GitHub
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            {/* Short Bio */}
            <div className="col-md-12 mb20">
              <label className="heading-color ff-heading fw500 mb10">
                Short Bio / Summary
              </label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="I'm a React developer with experience in..."
              />
            </div>

            {/* Save Button */}
            <div className="col-md-12">
              <div className="text-start">
                <Link className="ud-btn btn-thm" href="/contact">
                  Save
                  <i className="fal fa-arrow-right-long" />
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
