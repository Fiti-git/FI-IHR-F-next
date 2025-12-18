"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import Link from "next/link";

import HeighestRetedCard2 from "../card/HighestRatedCard2";
import api from "@/lib/axios";
import { API_BASE_URL } from "@/lib/config";

export default function HighestRated2() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobProviders = async () => {
      try {
        const res = await api.get("/api/profile/job-providers/");
        setProviders(res.data || []);
      } catch (err) {
        console.error("Failed to load job providers", err);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobProviders();
  }, []);

  // 🔥 Transform API → Card props (MATCHES CARD EXACTLY)
  const transformProvider = (provider) => {
    let imageUrl = "/images/team/client-1.png";

    if (provider.profile_image_url) {
      imageUrl = provider.profile_image_url;
    } else if (provider.profile_image) {
      imageUrl = provider.profile_image.startsWith("http")
        ? provider.profile_image
        : `${API_BASE_URL}${provider.profile_image}`;
    }

    return {
      img: imageUrl,
      companyName: provider.company_name || "Confidential Company",
      industry: provider.industry || "General",
      location: provider.country || "N/A",
      userId: provider.user?.id, // ✅ used for /employee-single/{id}
    };
  };

  if (loading) {
    return (
      <section className="py-5 text-center">
        <div className="spinner-border text-primary" />
      </section>
    );
  }

  return (
    <section>
      <div className="container">
        {/* Header */}
        <div className="row align-items-center">
          <div className="col-lg-9">
            <div className="main-title">
              <h2 className="title">Highest Rated Employers</h2>
              <p className="paragraph">
                Top companies actively hiring right now
              </p>
            </div>
          </div>
          <div className="col-lg-3 text-lg-end">
            <Link className="ud-btn2" href="/employee-1">
              Browse All <i className="fal fa-arrow-right-long" />
            </Link>
          </div>
        </div>

        {/* Slider */}
        <div className="row">
          <div className="col-lg-12">
            <Swiper
              spaceBetween={30}
              navigation={{
                prevEl: ".btn__prev__013",
                nextEl: ".btn__next__013",
              }}
              modules={[Navigation, Pagination]}
              loop={true}
              pagination={{
                el: ".swiper__pagination__013",
                clickable: true,
              }}
              breakpoints={{
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                992: { slidesPerView: 3 },
                1200: { slidesPerView: 4 },
              }}
            >
              {providers.map((provider) => (
                <SwiperSlide key={provider.id}>
                  <HeighestRetedCard2
                    data={transformProvider(provider)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Controls */}
            <div className="row justify-content-center mt-3">
              <div className="col-auto">
                <button className="swiper__btn btn__prev__013">
                  <i className="far fa-arrow-left-long" />
                </button>
              </div>
              <div className="col-auto">
                <div className="swiper__pagination swiper__pagination__013" />
              </div>
              <div className="col-auto">
                <button className="swiper__btn btn__next__013">
                  <i className="far fa-arrow-right-long" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
