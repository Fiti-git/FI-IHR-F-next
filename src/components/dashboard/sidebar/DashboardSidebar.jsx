"use client";

import { useState, useEffect } from "react";
import { dasboardNavigation } from "@/data/dashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSidebar() {
  const path = usePathname();
  const [role, setRole] = useState(null); // Initialize role as null
  const [loading, setLoading] = useState(true); // To handle loading state

  useEffect(() => {
    const userId = localStorage.getItem("user_id"); // Get the user_id from localStorage

    if (userId) {
      // Fetch role based on the user_id
      const fetchRole = async () => {
        try {
          // Make an API call to fetch roles
          const response = await fetch(`http://127.0.0.1:8000/api/user/${userId}/roles/`);
          const data = await response.json();
          
          if (response.ok) {
            // If the response is OK, set the first role from the returned data
            setRole(data.roles?.[0] || "freelancer"); // Default to 'freelancer' if no role is found
          } else {
            setRole("freelancer"); // Fallback role in case of error
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setRole("freelancer"); // Fallback in case of error
        } finally {
          setLoading(false); // Stop loading once the data is fetched
        }
      };

      fetchRole();
    } else {
      setLoading(false); // If no user_id is found in localStorage, stop loading
    }
  }, []);

  // If the role is still being loaded, display a loading state or a spinner
  if (loading) {
    return <div>Loading...</div>;
  }

  // If role is not set, fallback to 'freelancer'
  if (!role) {
    setRole("freelancer");
  }

  // Filter navigation items by the user's role
  const filteredNav = dasboardNavigation.filter((item) =>
    item.roles?.includes(role)
  );

  return (
    <div className="dashboard__sidebar d-none d-lg-block">
      <div className="dashboard_sidebar_list">
        {filteredNav.map((item) => {
          const href = item.pathByRole?.[role] || item.path;

          if (!href) return null; // Skip invalid link

          return (
            <div key={item.id} className="sidebar_list_item mb-1">
              <Link
                href={href}
                className={`items-center ${path === href ? "-is-active" : ""}`}
              >
                <i className={`${item.icon} mr15`} />
                {item.name}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
