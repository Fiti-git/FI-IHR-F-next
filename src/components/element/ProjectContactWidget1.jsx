"use client";
import Image from "next/image";
import Link from "next/link";

export default function ProjectContactWidget1({ projectData }) {
  // Get user display name
  const getUserName = () => {
    if (!projectData?.user) return "Anonymous";

    if (projectData.company_name) {
      return projectData.company_name;
    }
    
    if (projectData.company_name) {
      return projectData.company_name;
    }
    
    return projectData.company_name || "Anonymous";
  };

  // // Get user image
  // const getUserImage = () => {
  //   return projectData?.user?.profile_image || "/images/team/default-avatar.png";
  // };

  // Get user email
  const getUserEmail = () => {
    return projectData?.user?.email || "Not available";
  };

  // Calculate user stats (you might want to fetch these from API)
  const getUserStats = () => {
    // These would ideally come from your user profile API
    return {
      projects: projectData?.user?.total_projects || 0,
      rating: projectData?.user?.rating || 0,
      reviews: projectData?.user?.review_count || 0,
      memberSince: projectData?.user?.date_joined || null,
    };
  };

  // Format member since date
  function formatMemberSince(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    }); // Example: "November 2025"
  }

  if (!projectData || !projectData.user) {
    return (
      <div className="freelancer-style1 service-single mb-0 bdrs8">
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0 text-muted">Loading client info...</p>
        </div>
      </div>
    );
  }

  const stats = getUserStats();
  const userName = getUserName();
  // const userImage = getUserImage();

  return (
    <>
      <div className="freelancer-style1 service-single mb-0 bdrs8">
        <h4>About Client</h4>
        
        {/* Client Profile */}
        <div className="wrapper d-flex align-items-center mt20">
          <div className="thumb position-relative mb25">
            {/* <Image
              height={60}
              width={60}
              className="rounded-circle mx-auto"
              src={userImage}
              alt={userName}
              onError={(e) => {
                e.target.src = "/images/team/default-avatar.png";
              }}
            /> */}
            <span className="online-badge2" />
          </div>
          <div className="ml20">
            <h5 className="title mb-1">{userName}</h5>
            <p className="mb-0 fz14 text-muted">
              {projectData.category || "Project Owner"}
            </p>
            {stats.rating > 0 && (
              <div className="review">
                <p className="mb-0">
                  <i className="fas fa-star fz10 review-color pr10" />
                  <span className="dark-color">{stats.rating.toFixed(1)}</span>
                  {stats.reviews > 0 && (
                    <span className="text-muted fz13"> ({stats.reviews} reviews)</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        <hr className="opacity-100" />

        {/* Client Details */}
        <div className="details">
          {/* Username & Email */}




          {/* Stats Grid */}
          <div className="fl-meta d-flex align-items-center justify-content-between flex-wrap">
            <div className="meta fw500 text-start mb-3">
              <span className="text-muted fz13">No Projects</span>
              <br />
              <span className="fz16 fw600 dark-color">
                {projectData?.project_count ?? 0}
              </span>
            </div>
            <div className="meta fw500 text-start mb-3">
              <span className="text-muted fz13">Member Since</span>
              <br />
              <span className="fz14 fw400 dark-color">
                {formatMemberSince(projectData?.join_date)}
              </span>
            </div>
            <div className="meta fw500 text-start mb-3">
              <span className="text-muted fz13">Location</span>
              <br />
              <span className="fz14 fw400 dark-color">
                {projectData.country_name || "Remote"}
              </span>
            </div>
          </div>
        </div>

        <hr className="opacity-100" />

        {/* Project Posted Date */}
        <div className="mb-3">
          <p className="text-muted fz14 mb-1">
            <i className="flaticon-calendar me-2"></i>
            Posted On
          </p>
          <p className="mb-0 fw500">
            {new Date(projectData.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Contact Button */}
        <div className="d-grid mt30">
          <Link 
            href={`mailto:${getUserEmail()}`}
            className="ud-btn btn-thm-border"
          >
            Contact Client
            <i className="fal fa-arrow-right-long" />
          </Link>
        </div>

        {/* View Profile Button (if you have user profile pages) */}
        {projectData.user.id && (
          <div className="d-grid mt-2">
            <Link 
              href={`/employee-single/${projectData.user.id}`}
              className="ud-btn btn-white"
            >
              View Profile
              <i className="fal fa-user" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}