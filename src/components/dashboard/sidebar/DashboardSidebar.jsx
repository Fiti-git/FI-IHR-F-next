"use client";

import { useState, useEffect } from "react";
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

  if (!role) return null;

  // Filter nav items by role
  const filteredNav = dasboardNavigation.filter((item) =>
    item.roles?.includes(role)
  );

  return (
    <div className="dashboard__sidebar d-none d-lg-block">
      <div className="dashboard_sidebar_list">
        {filteredNav.map((item) => {
          const href = item.pathByRole?.[role] || item.path;

          if (!href) return null; // skip invalid link

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
