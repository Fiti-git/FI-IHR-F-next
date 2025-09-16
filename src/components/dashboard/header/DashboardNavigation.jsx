"use client";

import { dasboardNavigation } from "@/data/dashboard";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DashboardNavigation() {
  const [isActive, setActive] = useState(false);
  const [role, setRole] = useState(null);
  const path = usePathname();

  // Get role from localStorage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  if (!role) return null; // or loading spinner

  // Filter navigation items by role
  const filteredNavItems = dasboardNavigation.filter(item => item.roles.includes(role));

  return (
    <div className="dashboard_navigationbar d-block d-lg-none">
      <div className="dropdown">
        <button onClick={() => setActive(!isActive)} className="dropbtn">
          <i className="fa fa-bars pr10" /> Dashboard Navigation
        </button>
        <ul className={`dropdown-content ${isActive ? "show" : ""}`}>
          {filteredNavItems.map((item) => {
            const href = item.pathByRole?.[role] || item.path;

            if (!href) return null; // skip invalid item

            return (
              <li
                key={item.id}
                className={path === href ? "mobile-dasboard-menu-active" : ""}
                onClick={() => setActive(false)}
              >
                <Link href={href}>
                  <i className={`${item.icon} mr10`} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
