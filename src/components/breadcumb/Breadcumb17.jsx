// --- START OF FILE Breadcumb17.jsx ---

"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import api from '@/lib/axios';
import { API_BASE_URL } from '@/lib/config';

export default function Breadcumb17() {
  const { id } = useParams(); // Get ID from URL
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        setLoading(true);
        // 1. Fetch all freelancers
        const response = await api.get("/api/profile/freelancers/");
        
        // 2. Find the specific freelancer (matching ID or User ID)
        if (id) {
          const found = response.data.find(item => 
            String(item.id) === String(id) || 
            String(item.user?.id) === String(id)
          );
          setFreelancer(found);
        }
      } catch (err) {
        console.error("Error fetching header info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancer();
  }, [id]);

  // Helper to determine image URL
  const getImageUrl = (item) => {
    if (!item) return "/images/team/fl-1.png"; // Default
    if (item.profile_image_url) return item.profile_image_url;
    if (item.profile_image) {
      return item.profile_image.startsWith('http') 
        ? item.profile_image 
        : `${API_BASE_URL}${item.profile_image}`;
    }
    return "/images/team/fl-1.png";
  };

  // Helper for name
  const getName = (item) => {
    if (!item) return "Freelancer";
    return item.full_name || item.user?.username || "Freelancer";
  };

  // Helper for title
  const getTitle = (item) => {
    return item?.professional_title || "Professional Freelancer";
  };

  if (loading) {
    return (
      <section className="breadcumb-section pt-0">
        <div className="container text-center pt50">Loading...</div>
      </section>
    );
  }

  return (
    <>
      <section className="breadcumb-section pt-0">
        <div className="cta-service-v1 freelancer-single-style mx-auto maxw1700 pt120 pt60-sm pb120 pb60-sm bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg px30-lg">
          <Image
            height={226}
            width={198}
            className="left-top-img wow zoomIn"
            src="/images/vector-img/left-top.png"
            alt="vector-img"
          />
          <Image
            height={181}
            width={255}
            className="right-bottom-img wow zoomIn"
            src="/images/vector-img/right-bottom.png"
            alt="vector-img"
          />
          <div className="container">
            <div className="row wow fadeInUp">
              <div className="col-xl-7">
                <div className="position-relative">
                  {/* Since API doesn't have a 'Gig Title', we display a welcome message or the Professional Title */}
                  <h2>
  {freelancer 
    ? `Work with "${getName(freelancer)}"`
    : "Discover Skilled Professionals"}
</h2>

                  <div className="list-meta d-sm-flex align-items-center mt30">
                    <a className="position-relative freelancer-single-style">
                      {/* <span className="online" /> */}
                      <div
  style={{
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    overflow: "hidden",
    margin: "0 auto"
  }}
>
  <Image
    src={getImageUrl(freelancer)}
    alt={getName(freelancer)}
    fill
    style={{
      objectFit: "cover",
      borderRadius: "50%"
    }}
  />
</div>

                    </a>
                    <div className="ml20 ml0-xs">
                      <h5 className="title mb-1">
                        {getName(freelancer)}
                      </h5>
                      
                      <p className="mb-0">
                        {getTitle(freelancer)}
                      </p>
                      
                      <p className="mb-0 dark-color fz15 fw500 list-inline-item ml15 mb5-sm ml0-xs">
                        <i className="flaticon-30-days vam fz20 me-2" /> 
                        Member since 2024
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}