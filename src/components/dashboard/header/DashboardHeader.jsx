"use client";

import { useEffect, useState } from "react";
import { dasboardNavigation } from "@/data/dashboard";
import toggleStore from "@/store/toggleStore";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardHeader() {
  const toggle = toggleStore((state) => state.dashboardSlidebarToggleHandler);
  const path = usePathname();

  const [role, setRole] = useState(null);
  const [profileImage, setProfileImage] = useState("/images/resource/user.png");
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("user_id");

  // Fetch user role and profile
  useEffect(() => {
    const fetchUserRoleAndProfile = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        // 1️⃣ Get user role
        const roleRes = await fetch(`http://127.0.0.1:8000/api/user/${userId}/roles/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!roleRes.ok) throw new Error("Failed to fetch user role");
        const roleData = await roleRes.json();
        const userRole = roleData.roles?.[0]; // "Employee" or "Employer"
        setRole(userRole);

        // 2️⃣ Get profile based on role
        let profileUrl = "";
        if (userRole === "Employee") {
          profileUrl = "http://127.0.0.1:8000/api/profile/freelancer/";
        } else if (userRole === "Employer") {
          profileUrl = "http://127.0.0.1:8000/api/profile/job-provider/";
        }

        if (profileUrl) {
          const profileRes = await fetch(profileUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.profile_image) {
              const fullImageUrl = profileData.profile_image.startsWith("http")
                ? profileData.profile_image
                : `http://206.189.134.117:8000${profileData.profile_image}`;
              setProfileImage(fullImageUrl);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching role/profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleAndProfile();
  }, []);

  // 3️⃣ Filter dashboard navigation items based on role
  const normalizedRole =
    role === "Employee" ? "freelancer" : role === "Employer" ? "job-provider" : null;

  const filteredNav = dasboardNavigation.filter((item) =>
    item.roles?.includes(normalizedRole)
  );

  return (
    <header className="header-nav nav-innerpage-style menu-home4 dashboard_header main-menu">
      <nav className="posr">
        <div className="container-fluid pr30 pr15-xs pl30 posr menu_bdrt1">
          <div className="row align-items-center justify-content-between">
            <div className="col-6 col-lg-auto">
              <div className="text-center text-lg-start d-flex align-items-center">
                <div className="dashboard_header_logo position-relative me-2 me-xl-5">
                  <Link href="/" className="logo">
                    <Image
                      height={40}
                      width={133}
                      src="/images/header-logo-dark.svg"
                      alt="logo"
                    />
                  </Link>
                </div>
                <div className="fz20 ml90">
                  <a
                    onClick={toggle}
                    className="dashboard_sidebar_toggle_icon vam"
                  >
                    <Image
                      height={18}
                      width={20}
                      src="/images/dashboard-navicon.svg"
                      alt="navicon"
                    />
                  </a>
                </div>
                <a
                  className="login-info d-block d-xl-none ml40 vam"
                  data-bs-toggle="modal"
                  href="#exampleModalToggle"
                >
                  <span className="flaticon-loupe" />
                </a>
                <div className="ml40 d-none d-xl-block">
                  <div className="search_area dashboard-style">
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="What service are you looking for today?"
                    />
                    <label>
                      <span className="flaticon-loupe" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-auto">
              <div className="text-center text-lg-end header_right_widgets">
                <ul className="dashboard_dd_menu_list d-flex align-items-center justify-content-center justify-content-sm-end mb-0 p-0">
                  <li className="user_setting">
                    <div className="dropdown">
                      <a className="btn" data-bs-toggle="dropdown">
                        <Image
                          height={50}
                          width={50}
                          src={profileImage}
                          alt="userprofile"
                          className="rounded-circle"
                        />
                      </a>
                      <div className="dropdown-menu">
                        <div className="user_setting_content">
                          {filteredNav.map((item, i) => {
                            const href = item.pathByRole
                              ? item.pathByRole[normalizedRole]
                              : item.path;

                            return (
                              <Link
                                key={i}
                                className={`dropdown-item ${
                                  path === href ? "active" : ""
                                }`}
                                href={href}
                              >
                                <i className={`${item.icon} mr10`} />
                                {item.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
