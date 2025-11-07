import Image from "next/image";
import Link from "next/link";

export default function FreelancerCard1({ data }) {
  // Use profile_image_url from API or fallback to default
  const imageUrl = data.profile_image_url || data.img || "/images/team/fl-1.png";
  
  // Parse skills if it's a string
  const skillsList = Array.isArray(data.skills_list) 
    ? data.skills_list 
    : (Array.isArray(data.skills) 
      ? data.skills 
      : (typeof data.skills === 'string' 
        ? data.skills.split(',').map(s => s.trim()) 
        : []));

  return (
    <>
      <div className="freelancer-style1 text-center bdr1 hover-box-shadow">
        <div className="thumb w90 mb25 mx-auto position-relative rounded-circle">
          <Image
            height={90}
            width={90}
            className="rounded-circle mx-auto"
            src={imageUrl}
            alt={data.full_name || data.name || "Freelancer"}
            onError={(e) => {
              e.target.src = "/images/team/fl-1.png";
            }}
          />
          <span className="online" />
        </div>
        <div className="details">
          <h5 className="title mb-1">
            {data.full_name || data.name || "Freelancer"}
          </h5>
          <p className="mb-0">
            {data.professional_title || data.profession || "Professional"}
          </p>
          <div className="review">
            <p>
              <i className="fas fa-star fz10 review-color pr10" />
              <span className="dark-color fw500">{data.rating || "5.0"}</span> (
              {data.reviews || "0"} reviews)
            </p>
          </div>
          <div className="skill-tags d-flex align-items-center justify-content-center mb5">
            {skillsList && skillsList.length > 0 ? (
              skillsList.slice(0, 3).map((skill, index) => (
                <span key={index} className={`tag ${index > 0 ? 'mx10' : ''}`}>
                  {skill}
                </span>
              ))
            ) : (
              <>
                <span className="tag">Skill 1</span>
                <span className="tag mx10">Skill 2</span>
                <span className="tag">Skill 3</span>
              </>
            )}
          </div>
          <hr className="opacity-100 mt20 mb15" />
          <div className="fl-meta d-flex align-items-center justify-content-between">
            <a className="meta fw500 text-start">
              Location
              <br />
              <span className="fz14 fw400">
                {data.city && data.country 
                  ? `${data.city}, ${data.country}` 
                  : data.location || "Location"}
              </span>
            </a>
            <a className="meta fw500 text-start">
              Rate
              <br />
              <span className="fz14 fw400">
                {data.hourly_rate ? `$${data.hourly_rate}/hr` : (data.price ? `$${data.price}/hr` : "$0/hr")}
              </span>
            </a>
            <a className="meta fw500 text-start">
              Level
              <br />
              <span className="fz14 fw400">
                {data.experience_level 
                  ? data.experience_level.charAt(0).toUpperCase() + data.experience_level.slice(1) 
                  : (data.level 
                    ? data.level.charAt(0).toUpperCase() + data.level.slice(1) 
                    : "Mid")}
              </span>
            </a>
          </div>
          <div className="d-grid mt15">
            <Link
              href={`/freelancer-single/${data.id}`}
              className="ud-btn btn-light-thm"
            >
              View Profile
              <i className="fal fa-arrow-right-long" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}