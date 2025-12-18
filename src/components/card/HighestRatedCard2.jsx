"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function HeighestRetedCard2({ data, itemClass }) {
  const path = usePathname();

  return (
    <div
      className={`${
        itemClass
          ? itemClass
          : "freelancer-style1 text-center bdr1 hover-box-shadow mb60"
      } ${path !== "/home-10" ? "at-home7 bdrs4" : ""}`}
    >
      {/* Profile Image */}
      <div className="thumb w90 mb25 mx-auto position-relative rounded-circle">
        <Image
          height={90}
          width={90}
          className="rounded-circle mx-auto object-fit-cover"
          src={data.img}
          alt={data.companyName}
        />
        <span className="online" />
      </div>

      {/* Details */}
      <div className="details">
        {/* Company Name */}
        <h5 className="title mb-1">{data.companyName}</h5>

        {/* Industry */}
        <p className="mb-0 text-uppercase">{data.industry}</p>

        <hr className="opacity-100 mt20 mb15" />

        {/* Meta Info */}
        <div className="fl-meta d-flex align-items-center justify-content-center">
          <div className="meta fw500 text-center">
            Location
            <br />
            <span className="fz14 fw400 text-uppercaseABC">{data.location}</span>
          </div>
        </div>

        {/* View Profile Button */}
        <div className="d-grid mt15">
          <Link
            href={`/employee-single/${data.userId}`}
            className="ud-btn btn-white2 double-border bdrs4"
          >
            View Profile
            <i className="fal fa-arrow-right-long ms-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
