// --- START OF FILE FreelancerAbout1.jsx ---

import Link from "next/link";

export default function FreelancerAbout1({ freelancer }) {
  // If data hasn't loaded yet, show a placeholder or nothing
  if (!freelancer) {
    return <div className="price-widget pt25 bdrs8">Loading info...</div>;
  }

  // Helper to capitalize first letter (e.g., "male" -> "Male")
  const capitalize = (str) => {
    if (!str) return "N/A";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <>
      <div className="price-widget pt25 bdrs8">
        <h3 className="widget-title">
          ${freelancer.hourly_rate || '0'}
          <small className="fz15 fw500">/per hour</small>
        </h3>
        
        <div className="category-list mt20">
          {/* Location */}
          <a className="d-flex align-items-center justify-content-between bdrb1 pb-2">
            <span className="text">
              <i className="flaticon-place text-thm2 pe-2 vam" />
              Location
            </span>
            <span className="text-capitalize">
              {freelancer.city && freelancer.country 
                ? `${freelancer.city}, ${freelancer.country}` 
                : freelancer.city || freelancer.country || "Not specified"}
            </span>
          </a>

          {/* Member Since - (Note: The API snippet didn't have a date_joined field, 
             so this is static or you can add it if your API updates) */}
          <a className="d-flex align-items-center justify-content-between bdrb1 pb-2">
            <span className="text">
              <i className="flaticon-30-days text-thm2 pe-2 vam" />
              Member since
            </span>
            <span>2024</span> 
          </a>

          {/* Gender */}
          <a className="d-flex align-items-center justify-content-between bdrb1 pb-2">
            <span className="text">
              <i className="flaticon-mars text-thm2 pe-2 vam" />
              Gender
            </span>
            <span>{capitalize(freelancer.gender)}</span>
          </a>

          {/* Languages */}
          <a className="d-flex align-items-center justify-content-between bdrb1 pb-2">
            <span className="text">
              <i className="flaticon-translator text-thm2 pe-2 vam" />
              Languages
            </span>
            <span>{capitalize(freelancer.language)}</span>
          </a>

          {/* Proficiency */}
          <a className="d-flex align-items-center justify-content-between mb-3">
            <span className="text">
              <i className="flaticon-sliders text-thm2 pe-2 vam" />
              Proficiency
            </span>
            <span>{capitalize(freelancer.language_proficiency)}</span>
          </a>
        </div>

        <div className="d-grid">
          <Link href="/contact" className="ud-btn btn-thm">
            Contact Me
            <i className="fal fa-arrow-right-long" />
          </Link>
        </div>
      </div>
    </>
  );
}