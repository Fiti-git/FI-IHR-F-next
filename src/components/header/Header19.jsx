"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
import Navigation from "./Navigation";
import MobileNavigation2 from "./MobileNavigation2";

export default function Header19() {
  // 1. Store the full user object instead of just a boolean
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setUser(null);
        return;
      }

      try {
        const response = await fetch("http://206.189.134.117:8000/api/profile/check-auth/", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // 2. Set the user state with data from the API (which includes roles)
          if (data.isAuthenticated) {
            setUser(data);
          }
        } else {
          setUser(null); // Token is invalid or expired
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setUser(null);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    // Redirect to login page after logout
    router.push("/login");
  };

  return (
    <>
      <header className="header-nav nav-innerpage-style at-home20 main-menu border-0 ">
        <nav className="posr">
          <div className="container-fluid custom-container custom-container2 posr">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto px-0 px-xl-3">
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
              <div className="col-auto px-0 px-xl-3">
                <Navigation />
              </div>
              <div className="col-auto pe-0 ">
                <div className="d-flex align-items-center">
                  {!user ? (
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
                    // 3. Implement role-based rendering if the user IS authenticated
                    <div className="d-flex align-items-center">
                      {user.roles?.includes('freelancer') ? (
                        <Link href="/freelancer-dashboard" className="login-info mr10 home18-sign-btn px30 py-1 bdrs12 ml30 bdr1-dark">
                          Freelancer Dashboard
                        </Link>
                      ) : user.roles?.includes('job-provider') ? (
                        <Link href="/job-provider-dashboard" className="login-info mr10 home18-sign-btn px30 py-1 bdrs12 ml30 bdr1-dark">
                          Employer Dashboard
                        </Link>
                      ) : (
                        // Fallback link if user has no specific role
                        <Link href="/dashboard" className="login-info mr10 home18-sign-btn px30 py-1 bdrs12 ml30 bdr1-dark">
                          My Account
                        </Link>
                      )}

                      <button onClick={handleLogout} className="ud-btn add-joining home20-join-btn bdrs12 text-white">
                        Logout
                      </button>
                    </div>
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