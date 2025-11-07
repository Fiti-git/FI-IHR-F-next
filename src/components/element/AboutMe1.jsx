import Link from "next/link";

export default function AboutMe1({ data }) {
  // Default values if no data provided
  const companyData = data || {
    industry: "Software",
    companySize: "501-1,000",
    founded: "April 2022",
    phone: "N/A",
    email: "N/A",
    location: "N/A",
  };

  return (
    <>
      <div className="blog-sidebar ms-lg-auto">
        <div className="price-widget pt25 widget-mt-minus bdrs8">
          <h4 className="widget-title">About {companyData.company || "Company"}</h4>
          <div className="category-list mt20">
            <a className="d-flex align-items-center justify-content-between bdrb1 pb-2">
              <span className="text">
                <i className="flaticon-menu text-thm2 pe-2 vam" />
                Primary industry
              </span>
              <span>{companyData.industry || "N/A"}</span>
            </a>
            <a className="d-flex align-items-center justify-content-between bdrb1 pb-2">
              <span className="text">
                <i className="flaticon-factory text-thm2 pe-2 vam" />
                Job Type
              </span>
              <span>{companyData.jobType || "N/A"}</span>
            </a>
            {companyData.founded && (
              <a className="d-flex align-items-center justify-content-between bdrb1 pb-2">
                <span className="text">
                  <i className="flaticon-calendar text-thm2 pe-2 vam" />
                  Founded in
                </span>
                <span>{companyData.founded}</span>
              </a>
            )}
            <a className="d-flex align-items-center justify-content-between bdrb1 pb-2">
              <span className="text">
                <i className="flaticon-call text-thm2 pe-2 vam" />
                Phone
              </span>
              <span>{companyData.phone || "N/A"}</span>
            </a>
            <a className="d-flex align-items-center justify-content-between bdrb1 pb-2">
              <span className="text">
                <i className="flaticon-mail text-thm2 pe-2 vam" />
                Email
              </span>
              <span>{companyData.email || "N/A"}</span>
            </a>
            <a className="d-flex align-items-center justify-content-between mb-3">
              <span className="text">
                <i className="flaticon-place text-thm2 pe-2 vam" />
                Location
              </span>
              <span>{companyData.location || "N/A"}</span>
            </a>
            {companyData.username && (
              <a className="d-flex align-items-center justify-content-between mb-3">
                <span className="text">
                  <i className="flaticon-user text-thm2 pe-2 vam" />
                  Contact Person
                </span>
                <span>{companyData.name || companyData.username}</span>
              </a>
            )}
          </div>
          <div className="d-grid">
            {companyData.email && companyData.email !== "N/A" ? (
              <a href={`mailto:${companyData.email}`} className="ud-btn btn-thm">
                Contact Me
                <i className="fal fa-arrow-right-long" />
              </a>
            ) : (
              <Link href="/contact" className="ud-btn btn-thm">
                Contact Me
                <i className="fal fa-arrow-right-long" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}