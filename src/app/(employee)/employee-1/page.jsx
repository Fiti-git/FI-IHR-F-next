"use client";
import { useState } from "react";
import Breadcumb14 from "@/components/breadcumb/Breadcumb14";
import Breadcumb3 from "@/components/breadcumb/Breadcumb3";
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";
import Listing11 from "@/components/section/Listing11";

export default function Page() {
    const [searchFilters, setSearchFilters] = useState({
        keyword: "",
        location: null
    });

    // Handle search from Breadcumb14
    const handleSearch = (filters) => {
        setSearchFilters(filters);
    };

    return (
        <>
            <Header20 />
            <Breadcumb3 path={["Home", "Services", "Design & Creative"]} />
            <Breadcumb14 onSearch={handleSearch} />
            <Listing11 searchFilters={searchFilters} />
            <Footer />
        </>
    );
}