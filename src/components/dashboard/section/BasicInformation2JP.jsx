"use client";

import { useState } from "react";
import Link from "next/link";

export default function BasicInformation2() {
  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 pb15 mb25">
        <h5 className="list-title">Post a Job / Project</h5>
      </div>

      <div className="col-xl-8">
        <form className="form-style1">
          <div className="row">
            {/* Project Title */}
            <div className="col-sm-12">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Project Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Build a landing page"
                />
              </div>
            </div>

            {/* Description */}
            <div className="col-sm-12">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Description
                </label>
                <textarea
                  rows={5}
                  className="form-control"
                  placeholder="Describe the project in detail..."
                />
              </div>
            </div>

            {/* Skills */}
            <div className="col-sm-12">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. React, Tailwind, Figma"
                />
              </div>
            </div>

            {/* Budget */}
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Budget ($)
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 500"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Duration
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 2 weeks"
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Deadline
                </label>
                <input type="date" className="form-control" />
              </div>
            </div>

            {/* Attachments */}
            <div className="col-sm-6">
              <div className="mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Attachments
                </label>
                <input type="file" className="form-control" multiple />
              </div>
            </div>

            {/* Submit */}
            <div className="col-md-12">
              <div className="text-start">
                <Link className="ud-btn btn-thm" href="/dashboard/job-provider">
                  Save & Post
                  <i className="fal fa-arrow-right-long ms-2" />
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
