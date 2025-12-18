"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import PopularServiceCard1 from "../card/PopularServiceCard1";
import { usePathname } from "next/navigation";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function TrendingService14() {
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("All");
  const [services, setServices] = useState([]);
  const path = usePathname();

  // Fetch categories and services from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, serviceRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/services/`),
        ]);

        setCategories(catRes.data); // [{id, name}]
        setServices(serviceRes.data); // [{id, name, category, image, ...}]
      } catch (err) {
        console.error("Error fetching services or categories", err);
      }
    };

    fetchData();
  }, []);

  // Filter services based on selected category
  const filteredServices =
    currentCategory === "All"
      ? services
      : services.filter((item) => item.category === currentCategory);

  return (
    <section className={`pt-0 ${path === "/home-9" ? "pb0" : "pb100"}`}>
      <div className="container">
        {/* Header */}
        <div className="row align-items-center wow fadeInUp">
          <div className="col-xl-3">
            <div className="main-title mb30-lg">
              <h2 className="title fw-bold" style={{ lineHeight: "1.2" }}>
                Tailored Services
              </h2>
              <p className="paragraph mt-2">
                Proven strategies to support your growth goals.
              </p>
            </div>
          </div>

          <div className="col-xl-9">
            <div className="navpill-style2 at-home9 mb50-lg">
              <ul className="nav nav-pills mb20 justify-content-xl-end">
                {/* "All" Tab */}
                <li className="nav-item">
                  <button
                    onClick={() => setCurrentCategory("All")}
                    className={`nav-link fw500 dark-color ${
                      currentCategory === "All" ? "active" : ""
                    }`}
                  >
                    All
                  </button>
                </li>

                {/* Dynamic Categories */}
                {categories.map((cat) => (
                  <li key={cat.id} className="nav-item">
                    <button
                      onClick={() => setCurrentCategory(cat.name)}
                      className={`nav-link fw500 dark-color ${
                        currentCategory === cat.name ? "active" : ""
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Services Slider */}
        <div className="row">
          <div className="col-lg-12">
            <Swiper
              modules={[Autoplay]}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              spaceBetween={30}
              slidesPerView={4}
              breakpoints={{
                0: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                992: { slidesPerView: 3 },
                1200: { slidesPerView: 4 },
              }}
            >
              {filteredServices.slice(0, 8).map((item) => (
                <SwiperSlide key={item.id}>
                  <PopularServiceCard1 data={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
