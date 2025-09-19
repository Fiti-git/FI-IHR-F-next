"use client";
import { useState } from "react";
import SelectInput from "../option/SelectInput";
import Link from "next/link";

export default function BasicInformation2() {
  const [projectType, setProjectType] = useState({ option: "Select", value: "select" });
  const [visibility, setVisibility] = useState({ option: "Select", value: "select" });
  const [paymentTerms, setPaymentTerms] = useState({ option: "Select", value: "select" });
  const [freelancerCount, setFreelancerCount] = useState({ option: "Select", value: "select" });

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">


      <div className="col-xl-8">
        <form className="form-style1">
          <div className="row">
            {/* Project Title */}
            <div className="col-sm-12 mb20">
              <label className="heading-color ff-heading fw500 mb10">Project Title</label>
              <input type="text" className="form-control" placeholder="e.g. Redesign Company Website" />
            </div>

            {/* Description */}
            <div className="col-sm-12 mb20">
              <label className="heading-color ff-heading fw500 mb10">Description</label>
              <textarea className="form-control" rows={6} placeholder="Project description, requirements, goals..." />
            </div>

            {/* Category */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Category"
                defaultSelect={{ option: "Select", value: "select" }}
                handler={() => {}}
                data={[
                  { option: "Web Development", value: "web" },
                  { option: "Design", value: "design" },
                  { option: "Marketing", value: "marketing" },
                ]}
              />
            </div>

            {/* Skills Required */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Skills Required"
                defaultSelect={{ option: "Select", value: "select" }}
                handler={() => {}}
                data={[
                  { option: "React", value: "react" },
                  { option: "Photoshop", value: "photoshop" },
                  { option: "SEO", value: "seo" },
                ]}
              />
            </div>

            {/* Budget */}
            <div className="col-sm-6 mb20">
              <label className="heading-color ff-heading fw500 mb10">Budget</label>
              <input type="text" className="form-control" placeholder="$1000 - $2000" />
            </div>

            {/* Deadline / Due Date */}
            <div className="col-sm-6 mb20">
              <label className="heading-color ff-heading fw500 mb10">Deadline / Due Date</label>
              <input type="date" className="form-control" />
            </div>

            {/* Project Type */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Project Type"
                defaultSelect={projectType}
                handler={(option, value) => setProjectType({ option, value })}
                data={[
                  { option: "Fixed Price", value: "fixed" },
                  { option: "Hourly", value: "hourly" },
                ]}
              />
            </div>

            {/* Visibility */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Visibility"
                defaultSelect={visibility}
                handler={(option, value) => setVisibility({ option, value })}
                data={[
                  { option: "Public", value: "public" },
                  { option: "Private", value: "private" },
                ]}
              />
            </div>

            {/* Client Instructions */}
            <div className="col-sm-12 mb20">
              <label className="heading-color ff-heading fw500 mb10">Client Instructions</label>
              <textarea className="form-control" rows={4} placeholder="Special notes or expectations..." />
            </div>

            {/* Preferred Freelancer Location */}
            <div className="col-sm-6 mb20">
              <label className="heading-color ff-heading fw500 mb10">Preferred Freelancer Location</label>
              <input type="text" className="form-control" placeholder="e.g. US only" />
            </div>

            {/* Project Duration Estimate */}
            <div className="col-sm-6 mb20">
              <label className="heading-color ff-heading fw500 mb10">Project Duration Estimate</label>
              <input type="text" className="form-control" placeholder="e.g. 2 weeks" />
            </div>

            {/* Tags / Keywords */}
            <div className="col-sm-12 mb20">
              <label className="heading-color ff-heading fw500 mb10">Tags / Keywords</label>
              <input type="text" className="form-control" placeholder="e.g. UI, mobile app, branding" />
            </div>

            {/* Number of Freelancers Needed */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Freelancers Needed"
                defaultSelect={freelancerCount}
                handler={(option, value) => setFreelancerCount({ option, value })}
                data={[
                  { option: "Single Freelancer", value: "single" },
                  { option: "Team / Multiple", value: "team" },
                ]}
              />
            </div>

            {/* Payment Terms */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Payment Terms"
                defaultSelect={paymentTerms}
                handler={(option, value) => setPaymentTerms({ option, value })}
                data={[
                  { option: "Upfront", value: "upfront" },
                  { option: "Milestone-based", value: "milestone" },
                  { option: "After delivery", value: "after" },
                ]}
              />
            </div>

            {/* Submit Button */}
            <div className="col-md-12 mt-3">
             
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
