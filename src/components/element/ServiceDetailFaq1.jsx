"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";

export default function ServiceDetailFaq1() {
  const { id } = useParams();
  const [subHeadings, setSubHeadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchContent = async () => {
      try {
        const res = await api.get(`/api/services/${id}/content/`);
        const sorted = res.data.sub_headings.sort((a, b) => a.order - b.order);
        setSubHeadings(sorted);
      } catch (err) {
        console.error("Error fetching service content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  if (loading) return <p>Loading content...</p>;
  if (!subHeadings.length) return <p>No content available.</p>;

  return (
    <div className="accordion-style1 faq-page mb-4 mb-lg-5 mt30">
      <div className="accordion" id="accordionExample">
        {subHeadings.map((item, index) => (
          <div
            key={item.id}
            className={`accordion-item ${index === 0 ? "active" : ""}`}
          >
            <h2 className="accordion-header" id={`heading${item.id}`}>
              <button
                className={`accordion-button ${index !== 0 ? "collapsed" : ""}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${item.id}`}
                aria-expanded={index === 0 ? "true" : "false"}
                aria-controls={`collapse${item.id}`}
              >
                {index + 1}. {item.title}
              </button>
            </h2>
            <div
              id={`collapse${item.id}`}
              className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
              aria-labelledby={`heading${item.id}`}
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body">
                <ul>
                  {item.content.split("\r\n").map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
