"use client";
import { dasboardNavigation } from "@/data/dashboard";
import Link from "next/link";
import { useState, Fragment } from "react";
import { usePathname } from "next/navigation";

export default function DashboardNavigation() {
  const [isActive, setActive] = useState(false);
  const path = usePathname();

  // Grouping the navigation by logical sections
  const navSections = {
    "Start": dasboardNavigation.filter((item) => item.id >= 1 && item.id <= 7),
    "Organize and Manage": dasboardNavigation.filter((item) => item.id >= 8 && item.id <= 13),
    "Account": dasboardNavigation.filter((item) => item.id >= 14),
  };

  return (
    <div className="dashboard_navigationbar d-block d-lg-none">
      <div className="dropdown">
        <button onClick={() => setActive(!isActive)} className="dropbtn">
          <i className="fa fa-bars pr10" /> Dashboard Navigation
        </button>
        <ul className={`dropdown-content ${isActive ? "show" : ""}`}>
          {Object.entries(navSections).map(([sectionTitle, items]) => (
            <Fragment key={sectionTitle}>
              <li>
                <p className="fz15 fw400 ff-heading mt30 pl30">{sectionTitle}</p>
              </li>
              {items.map((item) => (
                <li
                  key={item.id}
                  className={path === item.path ? "mobile-dasboard-menu-active" : ""}
                  onClick={() => setActive(false)}
                >
                  <Link href={item.path}>
                    <i className={`${item.icon} mr10`} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
