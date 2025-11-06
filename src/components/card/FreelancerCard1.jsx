import Image from "next/image";
import Link from "next/link";

export default function FreelancerCard1({ data }) {
  return (
    <>
      <div className="freelancer-style1 text-center bdr1 hover-box-shadow">
        <div className="thumb w90 mb25 mx-auto position-relative rounded-circle">
          <Image
            height={90}
            width={90}
            className="rounded-circle mx-auto"
            src={data.img || "/images/team/fl-1.png"}
            alt={data.name || "Freelancer"}
          />
          <span className="online" />
        </div>
        <div className="details">
          <h5 className="title mb-1">{data.name || "Freelancer"}</h5>
          <p className="mb-0">{data.profession || "Professional"}</p>
          <div className="review">
            <p>
              <i className="fas fa-star fz10 review-color pr10" />
              <span className="dark-color fw500">{data.rating || "0.0"}</span> (
              {data.reviews || "0"} reviews)
            </p>
          </div>
          <div className="skill-tags d-flex align-items-center justify-content-center mb5">
            {data.skills && data.skills.length > 0 ? (
              data.skills.map((skill, index) => (
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
              <span className="fz14 fw400">{data.location || "Location"}</span>
            </a>
            <a className="meta fw500 text-start">
              Rate
              <br />
              <span className="fz14 fw400">
                {data.hourlyRate || `$${data.price || 0} / hr`}
              </span>
            </a>
            <a className="meta fw500 text-start">
              Level
              <br />
              <span className="fz14 fw400">
                {data.level ? data.level.charAt(0).toUpperCase() + data.level.slice(1) : "Mid"}
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