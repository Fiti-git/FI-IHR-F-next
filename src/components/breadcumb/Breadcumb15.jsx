"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { API_BASE_URL } from "@/lib/config";

export default function Breadcumb15() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to format text
  const formatText = (text) => {
    if (!text) return "";
    return text
      .split(/[-_ ]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    const fetchProviderDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // FIX: The backend doesn't support /15/, so we fetch the LIST
        // and filter it using JavaScript to find the specific person.
        const response = await api.get("/api/profile/job-providers/");
        
        const allProviders = response.data;
        
        // Find the provider where the User ID matches the URL param
        const foundProvider = allProviders.find(item => {
           // Check User ID (preferred) or Profile ID
           const userId = item.user?.id || item.id;
           return String(userId) === String(id);
        });

        if (foundProvider) {
          setProvider(foundProvider);
        } else {
          console.error("Provider not found in list");
        }

      } catch (err) {
        console.error("Error fetching provider details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [id]);

  // Image Logic
  const getImageUrl = () => {
    if (!provider) return "/images/team/employee-single.png";

    if (provider.profile_image_url) {
      return provider.profile_image_url;
    } else if (provider.profile_image) {
      return provider.profile_image.startsWith("http")
        ? provider.profile_image
        : `${API_BASE_URL}${provider.profile_image}`;
    }
    return "/images/team/employee-single.png";
  };

  // Country/Location Logic
  const getLocation = () => {
    if (!provider || !provider.country) return "Location N/A";
    const countryMap = {
      usa: "United States",
      uk: "United Kingdom",
      uae: "United Arab Emirates",
    };
    return (
      countryMap[provider.country.toLowerCase()] || formatText(provider.country)
    );
  };

  if (loading) {
    return (
      <section className="breadcumb-section pt-0">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center pt50 pb50">
              <span>Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If no data found after loading
  if (!provider) {
    return (
      <section className="breadcumb-section pt-0">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center pt50 pb50">
              <span>Provider not found</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="breadcumb-section pt-0">
        <div className="cta-employee-single freelancer-single-style mx-auto maxw1700 pt120 pt60-sm pb120 pb60-sm bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg px30-lg">
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
                  <div className="list-meta d-sm-flex align-items-center">
                    <a className="position-relative freelancer-single-style">
                      <Image
                        height={120}
                        width={120}
                        className="rounded-circle w-100 wa-sm mb15-sm"
                        src={getImageUrl()}
                        alt={provider.company_name || "Company"}
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = "/images/team/employee-single.png";
                        }}
                      />
                      <span className="online2" />
                    </a>
                    <div className="ml20 ml0-xs">
                      <h5 className="title mb-1">
                        {provider.company_name || "Company Name"}
                      </h5>
                      {/* <p className="text fz14 mb-2">
                        {provider.company_overview
                          ? provider.company_overview.substring(0, 150) +
                            (provider.company_overview.length > 150 ? "..." : "")
                          : formatText(provider.industry) || "Company Overview"}
                      </p> */}

                      {/* Location */}
                      <p className="mb-0 dark-color fz15 fw500 list-inline-item ml15 mb5-sm ml0-xs">
                        <i className="flaticon-place vam fz20 me-2" />
                        {getLocation()}
                      </p>

                      {/* Job Type or Industry as secondary info */}
                      <p className="mb-0 dark-color fz15 fw500 list-inline-item ml15 mb5-sm ml0-xs">
                        <i className="flaticon-30-days vam fz20 me-2" />
                        {formatText(provider.industry) || "Industry"}
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