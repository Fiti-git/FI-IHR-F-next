"use client";
import { useState } from "react";
import Breadcumb3 from "@/components/breadcumb/Breadcumb3";
import Breadcumb9 from "@/components/breadcumb/Breadcumb9";
import Header20 from "@/components/header/Header20";
import Listing8 from "@/components/section/Listing8";

export default function Page() {
    const [searchFilters, setSearchFilters] = useState({
        keyword: ""
    });

    // Handle search from Breadcumb9
    const handleSearch = (filters) => {
        setSearchFilters(filters);
    };

    return (
        <>
            <Header20 />
            <Breadcumb3/>
            <Breadcumb9 onSearch={handleSearch} />
            <Listing8 searchFilters={searchFilters} />
        </>
    );
}