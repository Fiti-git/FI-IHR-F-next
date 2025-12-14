import Image from "next/image";
import Link from "next/link";

export default function EmployeeCard1({ data }) {
  // Use profile_image_url from API or fallback to default
  const imageUrl = data.profile_image_url || data.img || "/images/team/client-1.png";
  const companyName = data.company_name || data.server || data.companyName || "Company";

  return (
    <>
      <div className="job-list-style1 bdr1 pb10">
        <div className="icon d-flex align-items-center mb20">
          <Image
            height={60}
            width={60}
            className="wa"
            src={imageUrl}
            alt={companyName}
            onError={(e) => {
              e.target.src = "/images/team/client-1.png";
            }}
          />
          <h6 className="mb-0 ml20">
            <Link href={`/employee-single/${data.id}`}>
              {companyName}
            </Link>
          </h6>
          {/* <span className="fav-icon flaticon-star" /> */}
        </div>
        <div className="details">
          {/* <p>
            <i className="fas fa-star fz10 review-color pr10" />
            <span className="dark-color">{data.rating || "5.0"}</span> (
            {data.review || data.reviews || "0"} reviews)
          </p> */}
          <p className="list-inline-item mb-3">
            {data.country || data.location || "Location"}
          </p>
          <p className="list-inline-item mb-3 bdrl1 pl15">
            {data.industry || data.category || "Industry"} • {data.job_type || data.jobs || "Job Type"}
          </p>
        </div>
      </div>
    </>
  );
}