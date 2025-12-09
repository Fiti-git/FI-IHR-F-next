"use client";
import { useState } from "react";
import Breadcumb3 from "@/components/breadcumb/Breadcumb3";
import Breadcumb9 from "@/components/breadcumb/Breadcumb9";
import Header20 from "@/components/header/Header20";
import Listing9 from "@/components/section/Listing9";

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
            <Breadcumb9 
                onSearch={handleSearch}
                title="Jobs List"
                description="Search and discover exciting job opportunities across various categories."
            />
            <Listing9 searchFilters={searchFilters} />
        </>
    );
}
