"use client";
import React, { useState } from "react";
import SelectInput from "../option/SelectInput";
import Link from "next/link";
import Image from "next/image";

export default function JobProviderProfile() {
  const [getIndustry, setIndustry] = useState({
    option: "Select",
    value: null,
  });
  const [getJobType, setJobType] = useState({
    option: "Select",
    value: null,
  });
  const [getCountry, setCountry] = useState({
    option: "Select",
    value: null,
  });
  const [getCity, setCity] = useState({
    option: "Select",
    value: null,
  });
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
  };

  // Handlers for the form fields
  const industryHandler = (option, value) => setIndustry({ option, value });
  const jobTypeHandler = (option, value) => setJobType({ option, value });
  const countryHandler = (option, value) => setCountry({ option, value });
  const cityHandler = (option, value) => setCity({ option, value });

  return (
    <>
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <div className="col-xl-7">
          <div className="profile-box d-sm-flex align-items-center mb30">
            <div className="profile-img mb20-sm">
              <Image
                height={71}
                width={71}
                className="rounded-circle wa-xs"
                src={selectedImage ? selectedImage : "/images/team/fl-1.png"}
                style={{
                  height: "71px",
                  width: "71px",
                  objectFit: "cover",
                }}
                alt="profile"
              />
            </div>
            <div className="profile-content ml20 ml0-xs">
              <div className="d-flex align-items-center my-3">
                <a
                  className="tag-delt text-thm2"
                  onClick={() => setSelectedImage(null)}
                >
                  <span className="flaticon-delete text-thm2" />
                </a>
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
              <p className="text mb-0">
                Max file size is 1MB, Minimum dimension: 330x300. Suitable
                files are .jpg & .png
              </p>
            </div>
          </div>
        </div>

        {/* Job Provider's Profile Details Form */}
        <div className="col-lg-7">
          <form className="form-style1">
            <div className="row">
              {/* Job Provider's Name */}
              <div className="col-sm-6">
                <div className="mb20">
                  <label className="heading-color ff-heading fw500 mb10">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your Company Name or Your Name"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="col-sm-6">
                <div className="mb20">
                  <label className="heading-color ff-heading fw500 mb10">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="company@domain.com"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="col-sm-6">
                <div className="mb20">
                  <label className="heading-color ff-heading fw500 mb10">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              {/* Company/Job Provider Description */}
              <div className="col-sm-12">
                <div className="mb20">
                  <label className="heading-color ff-heading fw500 mb10">
                    Company Overview
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Describe your company and your hiring needs."
                  />
                </div>
              </div>

              {/* Job Type Selection */}
              <div className="col-sm-6">
                <div className="mb20">
                  <SelectInput
                    label="Job Type"
                    defaultSelect={getJobType}
                    data={[
                      { option: "Full-time", value: "full-time" },
                      { option: "Part-time", value: "part-time" },
                      { option: "Remote", value: "remote" },
                    ]}
                    handler={jobTypeHandler}
                  />
                </div>
              </div>

              {/* Industry Selection */}
              <div className="col-sm-6">
                <div className="mb20">
                  <SelectInput
                    label="Industry"
                    defaultSelect={getIndustry}
                    data={[
                      { option: "Technology", value: "technology" },
                      { option: "Healthcare", value: "healthcare" },
                      { option: "Finance", value: "finance" },
                      { option: "Education", value: "education" },
                    ]}
                    handler={industryHandler}
                  />
                </div>
              </div>

              {/* Country and City Selection */}
              <div className="col-sm-6">
                <div className="mb20">
                  <SelectInput
                    label="Country"
                    defaultSelect={getCountry}
                    data={[
                      { option: "United States", value: "usa" },
                      { option: "Canada", value: "canada" },
                      { option: "United Kingdom", value: "uk" },
                    ]}
                    handler={countryHandler}
                  />
                </div>
              </div>

              <div className="col-sm-6">
                <div className="mb20">
                  <SelectInput
                    label="City"
                    defaultSelect={getCity}
                    data={[
                      { option: "New York", value: "new-york" },
                      { option: "Toronto", value: "toronto" },
                      { option: "London", value: "london" },
                    ]}
                    handler={cityHandler}
                  />
                </div>
              </div>
              {/* Save Button */}
              <div className="col-md-12">
                <div className="text-start">
                  <Link className="ud-btn btn-thm" href="/contact">
                    Save Changes
                    <i className="fal fa-arrow-right-long" />
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
