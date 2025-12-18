"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function PopularServiceCard1({
  data,
  style = "",
  isContentExpanded = false,
}) {
  const [isFavActive, setFavActive] = useState(false);
  const path = usePathname();

  return (
    <>
      <style jsx>{`
        .listing-style1 {
          position: relative;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .listing-style1:hover {
          transform: translateY(-6px);
          box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.12);
        }

        .list-thumb {
          position: relative;
          overflow: hidden;
        }

        .list-thumb img {
          transition: transform 0.4s ease;
        }

        .listing-style1:hover .list-thumb img {
          transform: scale(1.05);
        }

        .list-content {
          padding: 15px;
        }

        .list-title {
          font-size: 1rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .listing-fav {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 34px;
          height: 34px;
          background: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
          z-index: 10;
        }

        .ui-fav-active {
          color: #dc3545;
          animation: favPop 0.3s ease;
        }

        @keyframes favPop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>

      <div
        className={`listing-style1 ${
          path === "/home-2" ||
          path === "/home-9" ||
          path === "/home-16" ||
          path === "/home-14"
            ? "bdrs16"
            : ""
        } ${path === "/home-7" ? "style5" : ""} ${style}`}
        style={path === "/home-20" ? { border: "none", boxShadow: "none" } : {}}
      >
        {/* Image */}
        <div className="list-thumb">
          {data.image && (
            <Image
              height={247}
              width={331}
              className="w-100"
              src={data.image}
              alt={data.name}
            />
          )}

          {/* Favorite */}
          <a
            onClick={() => setFavActive(!isFavActive)}
            className={`listing-fav fz12 ${isFavActive ? "ui-fav-active" : ""}`}
          >
            <span className={`${isFavActive ? "fas" : "far"} fa-heart`} />
          </a>
        </div>

        {/* Content */}
        <div className={`list-content ${isContentExpanded ? "px-0" : ""}`}>
          <p className="list-text body-color fz14 mb-1">{data.category}</p>

          <h5 className="list-title">
            <Link href={`/service-single/${data.id}`}>{data.name}</Link>
          </h5>
        </div>
      </div>
    </>
  );
}
