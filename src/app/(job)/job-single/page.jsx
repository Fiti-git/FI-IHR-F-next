"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";

import Breadcumb10 from "@/components/breadcumb/Breadcumb10";
import Breadcumb13 from "@/components/breadcumb/Breadcumb13";
import Header20 from "@/components/header/Header20";
import JobDetail1 from "@/components/section/JobDetail1";
import TabSection1 from "@/components/section/TabSection1";

export default function JobSinglePage() {
  return (
    <>
      <Header20 />

      {/* Wrap dynamic parts in Suspense */}
      <Suspense fallback={<div className="text-center py-5">Loading job details...</div>}>
        <TabSection1 />
        <JobDetail1 />
      </Suspense>

      <Breadcumb10 path={["Home", "Services", "Design & Creative"]} />
      <Breadcumb13 />
    </>
  );
}
