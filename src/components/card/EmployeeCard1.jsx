import Image from "next/image";
import Link from "next/link";

export default function EmployeeCard1({ data }) {
  return (
    <>
      <div className="job-list-style1 bdr1 pb10">
        <div className="icon d-flex align-items-center mb20">
          <Image
            height={60}
            width={60}
            className="wa"
            src={data.img || "/images/team/default-company.png"}
            alt={data.server || "Company"}
          />
          <h6 className="mb-0 ml20">
            <Link href={`/employee-single/${data.id}`}>
              {data.server || data.companyName || "Company"}
            </Link>
          </h6>
          <span className="fav-icon flaticon-star" />
        </div>
        <div className="details">
          <p>
            <i className="fas fa-star fz10 review-color pr10" />
            <span className="dark-color">{data.rating || "0.0"}</span> (
            {data.review || "0"} reviews)
          </p>
          <p className="list-inline-item mb-3">
            {data.location || data.country || "Location"}
          </p>
          <p className="list-inline-item mb-3 bdrl1 pl15">
            {data.category || "Industry"} • {data.jobs || "Job Type"}
          </p>
        </div>
      </div>
    </>
  );
}