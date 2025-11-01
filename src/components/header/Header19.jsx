"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "./Navigation";
import MobileNavigation2 from "./MobileNavigation2";

export default function Header19() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Get the access token from local storage
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        // If there's no token, the user is not authenticated
        setIsAuthenticated(false);
        return;
      }

      // If a token exists, verify it with the backend API
      try {
        const response = await fetch("http://127.0.0.1:8000/api/profile/check-auth/", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Set authentication status based on the API response
          if (data.isAuthenticated) {
            setIsAuthenticated(true);
          }
        } else {
          // If response is not ok (e.g., 401 Unauthorized), the token is invalid
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []); // The empty dependency array ensures this effect runs only once on component mount

  return (
    <>
      <header className="header-nav nav-innerpage-style at-home20 main-menu border-0 ">
        <nav className="posr">
          <div className="container-fluid custom-container custom-container2 posr">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto px-0 px-xl-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="logos">
                    <Link className="header-logo logo1" href="/home-20">
                      <Image
                        width={133}
                        height={40}
                        src="/images/header-logo-dark2.svg"
                        alt="Header Logo"
                      />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-auto px-0 px-xl-3">
                <Navigation />
              </div>
              <div className="col-auto pe-0 ">
                <div className="d-flex align-items-center">
                  {!isAuthenticated ? (
                    // Show these links if the user is NOT authenticated
                    <>
                      <Link
                        className="login-info mr10 home18-sign-btn px30 py-1 bdrs12 ml30 bdr1-dark"
                        href="/login"
                      >
                        Sign in
                      </Link>
                      <Link
                        className="ud-btn add-joining home20-join-btn bdrs12 text-white"
                        href="/register"
                      >
                        Join Now
                      </Link>
                    </>
                  ) : (
                    // Show this content if the user IS authenticated
                    <>
                      {user.roles?.includes('employee') ? (
                        <Link href="/freelancer" className="login-info mr10 home18-sign-btn px30 py-1 bdrs12 ml30 bdr1-dark">
                          Freelancer Dashboard
                        </Link>
                      ) : user.roles?.includes('employer') ? (
                        <Link href="/job-provider" className="login-info mr10 home18-sign-btn px30 py-1 bdrs12 ml30 bdr1-dark">
                          Employer Dashboard
                        </Link>
                      ) : (
                        // Fallback link if user has no specific role
                        <Link href="/dashboard" className="login-info mr10 home18-sign-btn px30 py-1 bdrs12 ml30 bdr1-dark">
                          My Account
                        </Link>
                      )}
                      {/* You can also add a Logout button here */}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <div className="search-modal">
        <div
          className="modal fade"
          id="exampleModalToggle"
          aria-hidden="true"
          aria-labelledby="exampleModalToggleLabel"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalToggleLabel"></h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="fal fa-xmark"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="popup-search-field search_area">
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="What service are you looking for today?"
                  />
                  <label>
                    <span className="far fa-magnifying-glass"></span>
                  </label>
                  <button className="ud-btn btn-thm" type="submit">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileNavigation2 />
    </>
  );
}