"use client";
import { useState } from "react";

const locationOptions = ["City, state, or zip", "USA", "Canada", "UK"];

export default function Breadcumb14({ onSearch }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Location handler
  const locationHandler = (select) => {
    setSelectedLocation(select);
  };

  // Search handler
  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        keyword: searchKeyword.trim(),
        location: selectedLocation !== "City, state, or zip" ? selectedLocation : null
      });
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <section className="breadcumb-section pt-0">
        <div className="cta-employee-single cta-banner mx-auto maxw1700 pt120 pt60-sm pb120 pb60-sm bdrs16 position-relative d-flex align-items-center">
          <div className="container">
            <div className="row wow fadeInUp">
              <div className="col-xl-7">
                <div className="position-relative">
                  <h2>Employer List</h2>
                  <p className="text">
                    Search and discover employers from various industries.
                  </p>
                </div>
                <div className="advance-search-tab bgc-white p10 bdrs4 mt30">
                  <div className="row">
                    <div className="col-md-5 col-lg-6 col-xl-6">
                      <div className="advance-search-field bdrr1 bdrn-sm">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by company, industry, job type..."
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          onKeyPress={handleKeyPress}
                          style={{
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            padding: '10px'
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-4 col-lg-4 col-xl-3">
                      <div className="bselect-style1">
                        <div className="dropdown bootstrap-select">
                          <button
                            type="button"
                            className="btn dropdown-toggle btn-light"
                            data-bs-toggle="dropdown"
                          >
                            <div className="filter-option">
                              <div className="filter-option-inner">
                                <div className="filter-option-inner-inner">
                                  {selectedLocation !== null
                                    ? selectedLocation
                                    : "City, state, or zip"}
                                </div>
                              </div>
                            </div>
                          </button>
                          <div className="dropdown-menu ">
                            <div className="inner show">
                              <ul className="dropdown-menu inner show">
                                {locationOptions.map((item, index) => (
                                  <li
                                    onClick={() => locationHandler(item)}
                                    key={index}
                                    className="selected active"
                                  >
                                    <a
                                      className={`dropdown-item selected ${
                                        selectedLocation === item ? "active" : ""
                                      }`}
                                    >
                                      <span className="text">{item}</span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-lg-2 col-xl-3">
                      <div className="text-center text-xl-start">
                        <button 
                          className="ud-btn btn-thm2 w-100 vam"
                          onClick={handleSearch}
                          type="button"
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}