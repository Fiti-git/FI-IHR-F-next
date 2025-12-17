"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";

export default function JobProviderProjects({ providerId }) {
  const [projects, setProjects] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!providerId) return;

      try {
        setLoading(true);
        // 1. Fetch ALL projects
        const response = await api.get("/api/project/projects/");
        
        // 2. Filter projects for this specific provider
        const providerProjects = response.data.filter(
          (project) => String(project.user?.id) === String(providerId)
        );
        
        // Get company name for the header text
        if (providerProjects.length > 0) {
           setCompanyName(providerProjects[0].company_name);
        }

        setProjects(providerProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [providerId]);

  // Helper to format Date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper to capitalize
  const capitalize = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  };

  if (loading) {
    return <div className="text-center py-4">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="row">
      <div className="col-lg-12 mb30">
        <h4 className="mb-2">Posted Projects</h4>
        <p className="text-muted">
  View ongoing and upcoming projects from {companyName || "this company"}.
</p>

      </div>
      
      {projects.map((item) => (
        // CHANGE: col-sm-12 -> col-xl-6. This makes it 2 items per row (reducing width)
        <div className="col-md-6 col-xl-6" key={item.id}>
          <div className="job-list-style1 bdr1 align-items-center mb30">
            
            {/* Project Details */}
            <div className="details flex-grow-1">
              {/* <div className="mb-2">
                 <span className="badge bg-light text-primary">
                   {item.category}
                 </span>
              </div> */}
              
              <h5 className="mb-2">
                <Link href={`/project/${item.id}`}>{item.title}</Link>
              </h5>
              
              <div className="list-meta d-flex align-items-center mb-3">
                <p className="mb-0 dark-color fz14 list-inline-item">
                  <i className="flaticon-place fz12 vam me-2"></i>
                  {item.country_name || "Remote"}
                </p>
                <p className="mb-0 dark-color fz14 list-inline-item ml15">
                  <i className="flaticon-30-days fz12 vam me-2"></i>
                  {formatDate(item.created_at)}
                </p>
              </div>

              {/* Budget & Button moved nicely below for compact view */}
              <div className="d-flex justify-content-between align-items-center border-top pt-3">
                <p className="mb-0 text-dark fw600">
  ${item.budget}
  <span className="fw400 text-muted fz14 text-uppercase ms-2">
    {item.project_type === 'hourly' ? '/hr' : 'fixed'}
  </span>
</p>

                 <Link 
                    href={`/project-single/${item.id}`} 
                    className="ud-btn btn-light-thm btn-sm"
                  >
                    Details <i className="fal fa-arrow-right-long" />
                  </Link>
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}