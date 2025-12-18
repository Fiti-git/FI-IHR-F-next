"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import api from '@/lib/axios';


export default function Breadcumb11() {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/services/${id}`);
        setService(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching service:", err);
        setError("Failed to fetch service");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  return (
    <section className="breadcumb-section pt-0">
      <div className="cta-service-v1 freelancer-single-style mx-auto maxw1700 pt120 pt60-sm pb120 pb60-sm bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg px30-lg">

        {/* Right bottom image */}
        <Image
            height={181}
            width={255}
            className="right-bottom-img wow zoomIn"
            src={"/images/vector-img/right-bottom.png"}
            alt="right-bottom"
          />

        {/* Main vector image */}
        <Image
          height={300}
          width={532}
          className="service-v1-vector bounce-y d-none d-xl-block"
          src={service?.image || "/images/vector-img/vector-service-v1.png"}
          alt={service?.name || "service-image"}
          style={{
    borderRadius: "6px",
  }}
        />

        <div className="container">
          <div className="row wow fadeInUp">
            <div className="col-xl-7">
              <div className="position-relative">

                {/* Loading */}
                {loading && (
                  <div className="d-flex align-items-center">
                    <div className="spinner-border text-dark me-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <h2 className="text-dark">Loading service...</h2>
                  </div>
                )}

                {/* Error */}
                {!loading && error && (
                  <h2 className="text-dark">{error}</h2>
                )}

                {/* Success */}
                {!loading && service && (
                  <>
                    <h2 className="text-black fw-bold">{service.name}</h2>

                    <div className="mt-3 d-flex flex-wrap gap-3">
                      <span
                        className="badge bg-white text-dark d-flex align-items-center"
                        style={{
                          fontSize: "16px",
                          padding: "8px 14px",
                          borderRadius: "5px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        }}
                      >
                        <i
                          className="flaticon-folder me-2"
                          style={{ fontSize: "18px" }}
                        ></i>
                        {service.category}
                      </span>
                    </div>
                  </>
                )}

                {/* Not found */}
                {!loading && !error && !service && (
                  <h2 className="text-dark">Service not found</h2>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
