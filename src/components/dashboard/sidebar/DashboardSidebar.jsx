"use client";

import { useState, useEffect } from "react";
import { dasboardNavigation } from "@/data/dashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import api from '@/lib/axios';

export default function DashboardSidebar() {
  const path = usePathname();
  const [role, setRole] = useState(null); // Initialize role as null
  const [loading, setLoading] = useState(true); // To handle loading state

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    if (userId) {
      const fetchRole = async () => {
        try {
          const response = await api.get(`/api/user/${userId}/roles/`);

          // Set the first role from the returned data
          setRole(response.data.roles?.[0] || "freelancer");
        } catch (error) {
          console.error("Error fetching role:", error);
          setRole("freelancer"); // Fallback in case of error
        } finally {
          setLoading(false);
        }
      };

      fetchRole();
    } else {
      setLoading(false);
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
