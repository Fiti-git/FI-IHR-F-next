"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ServiceDetailComment1 from "../element/ServiceDetailComment1";
import ServiceDetailFaq1 from "../element/ServiceDetailFaq1";
import ServiceContactWidget1 from "../element/ServiceContactWidget1";

import useScreen from "@/hook/useScreen";
import Sticky from "react-stickynode";
import api from "@/lib/axios";

export default function ServiceDetail1() {
  const { id } = useParams();
  const isMatchedScreen = useScreen(1216);

  const [headerText, setHeaderText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchHeader = async () => {
      try {
        const res = await api.get(`/services/${id}/header/`);
        setHeaderText(res.data.header_text || "");
      } catch (err) {
        console.error("Error fetching service header:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeader();
  }, [id]);

  return (
    <section className="pt10 pb90 pb30-md">
      <div className="container">
        <div className="row wrap">
          <div className="col-lg-8">
            <div className="column">
              <div className="service-about">

                {/* Dynamic Header Text */}
                {!loading && headerText && (
                  <p
                    className="text mb30"
                    style={{
                      fontSize: "17px",
                      lineHeight: "1.8",
                      textAlign: "justify",
                    }}
                  >
                    {headerText}
                  </p>
                )}

                <ServiceDetailFaq1 />
                <hr className="opacity-50 mb60" />
                <ServiceDetailComment1 />
              </div>
            </div>
          </div>

          <div className="col-lg-4" id="stikyContainer">
            <div className="column">
              {isMatchedScreen ? (
                <Sticky bottomBoundary="#stikyContainer">
                  <div className="scrollbalance-inner">
                    <div className="blog-sidebar ms-lg-auto">
                      <ServiceContactWidget1 />
                    </div>
                  </div>
                </Sticky>
              ) : (
                <div className="scrollbalance-inner">
                  <div className="blog-sidebar ms-lg-auto">
                    <ServiceContactWidget1 />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
