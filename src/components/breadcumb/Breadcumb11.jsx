"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import api from '@/lib/axios';

export default function Breadcumb11() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await api.get(`/api/project/projects/${id}/`);
        setProject(response.data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err.response?.data?.message || err.message || `Failed to fetch project`);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return (
    <>
      <section className="breadcumb-section pt-0">
        <div className="cta-service-v1 freelancer-single-style mx-auto maxw1700 pt120 pt60-sm pb120 pb60-sm bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg px30-lg">
          <Image
            height={181}
            width={255}
            className="right-bottom-img wow zoomIn"
            src={project?.img || project?.imgUrl || "/images/vector-img/right-bottom.png"}
            alt="right-bottom"
          />
          {/* <Image
            height={300}
            width={532}
            className="service-v1-vector bounce-y d-none d-xl-block"
            src={project?.img || project?.imgUrl || "/images/vector-img/vector-service-v1.png"}
            alt="project-image"
          /> */}
          <div className="container">
            <div className="row wow fadeInUp">
              <div className="col-xl-7">
                <div className="position-relative">
                  {loading ? (
                    <div className="d-flex align-items-center">
                      <div className="spinner-border text-white me-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <h2 className="text-white">Loading project...</h2>
                    </div>
                  ) : error ? (
                    <h2 className="text-white">Error loading project</h2>
                  ) : project ? (
                    <>
                      <h2 className="text-black">{project.title}</h2>
                      <div className="mt-3 d-flex flex-wrap gap-3">
                        <span className="badge bg-white text-dark px-3 py-2">
                          <i className="flaticon-folder me-2"></i>
                          {project.category}
                        </span>
                        <span className="badge bg-white text-dark px-3 py-2">
                          <i className="flaticon-dollar me-2"></i>
                          ${project.budget}
                        </span>
                        <span className="badge bg-white text-dark px-3 py-2">
                          <i className="flaticon-calendar me-2"></i>
                          {project.project_type === "fixed_price" ? "Fixed Price" : "Hourly"}
                        </span>
                        <span className={`badge px-3 py-2 ${project.status === 'open' ? 'bg-success' :
                          project.status === 'in_progress' ? 'bg-warning' :
                            project.status === 'completed' ? 'bg-info' : 'bg-secondary'
                          }`}>
                          <i className="flaticon-tick me-2"></i>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <h2 className="text-white">Project not found</h2>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}