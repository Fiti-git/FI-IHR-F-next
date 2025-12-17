"use client";
import { useState } from "react";
import Breadcumb16 from "@/components/breadcumb/Breadcumb16";
import Breadcumb3 from "@/components/breadcumb/Breadcumb3";
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";
import Listing13 from "@/components/section/Listing13";

export default function Page() {
    const [searchFilters, setSearchFilters] = useState({
        keyword: ""
    });

    // Handle search from Breadcumb16
    const handleSearch = (filters) => {
        setSearchFilters(filters);
    };

    return (
        <>
            <Header20 />
            <Breadcumb3 />
            <Breadcumb16 onSearch={handleSearch} />
            <Listing13 searchFilters={searchFilters} />
            <Footer />
        </>
    );
}