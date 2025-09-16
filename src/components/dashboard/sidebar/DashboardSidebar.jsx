"use client";

import { useState, useEffect, Fragment } from "react";
import { dasboardNavigation } from "@/data/dashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSidebar() {
  const path = usePathname();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  if (!role) {
    return null; // or show a loading spinner here if you want
  }

  // Filter navigation based on role
  const filteredNav = dasboardNavigation.filter((item) =>
    item.roles?.includes(role)
  );

  const navSections = {
    Start: filteredNav.filter((item) => item.id >= 1 && item.id <= 7),
    "Organize and Manage": filteredNav.filter((item) => item.id >= 8 && item.id <= 13),
    Account: filteredNav.filter((item) => item.id >= 14),
  };

  return (
    <div className="dashboard__sidebar d-none d-lg-block">
      <div className="dashboard_sidebar_list">
        {Object.entries(navSections).map(([sectionTitle, items]) => (
          <Fragment key={sectionTitle}>
            {items.length > 0 && (
              <p className="fz15 fw400 ff-heading pl30 mt30">{sectionTitle}</p>
            )}
            {items.map((item) => (
              <div key={item.id} className="sidebar_list_item mb-1">
                <Link
                  href={item.path}
                  className={`items-center ${path === item.path ? "-is-active" : ""}`}
                >
                  <i className={`${item.icon} mr15`} />
                  {item.name}
                </Link>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
