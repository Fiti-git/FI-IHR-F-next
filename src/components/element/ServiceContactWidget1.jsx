"use client";

export default function CompanyCard() {
  const company = {
    logo: "https://jobdaddy.lk/storage/company_profiles/1f85ad375dc4f25e207f74e9a09d0b71.jpeg",
    name: "IHR HUB",
    services: [
      "Outsourcing Services",
      "Recruitment Services",
      "IT Technical Support & Maintenance",
      "Website & System Development",
      "3D Design & Architectural Drawing",
    ],
  };

  return (
    <div
      className="freelancer-style1 service-single mb-0 p-3"
      style={{
        borderRadius: "12px",
        border: "1px solid #e0e0e0",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)")
      }
    >
      {/* Top: Logo + Name */}
      <div className="d-flex align-items-center mb-3">
        <img
          src={company.logo}
          alt={`${company.name} logo`}
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            objectFit: "cover",
            marginRight: "15px",
          }}
        />
        <h5 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>
          {company.name}
        </h5>
      </div>

      {/* Services */}
      <div>
        <p
          style={{
            fontSize: "16px",
            fontWeight: "500",
            marginBottom: "8px",
          }}
        >
          Service Categories
        </p>
        <div className="d-flex flex-column gap-2">
          {company.services.map((service, index) => (
            <span
              key={index}
              style={{
                backgroundColor: "#f0f0f0",
                padding: "8px 10px",
                borderRadius: "8px",
                fontSize: "14px",
                textAlign: "center",
                display: "block",
                width: "100%", // Full width inside the container
              }}
            >
              {service}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
