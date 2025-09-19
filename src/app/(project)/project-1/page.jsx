import Breadcumb3 from "@/components/breadcumb/Breadcumb3";
import Breadcumb9 from "@/components/breadcumb/Breadcumb9";
import Header20 from "@/components/header/Header20";

import Listing8 from "@/components/section/Listing8";
import TabSection1 from "@/components/section/TabSection1";

export const metadata = {
    title: "IHRHUB | Project 1",
};

export default function page() {
    return (
        <>
            <Header20 />
            <Breadcumb3 path={["Home", "Services", "Design & Creative"]} />
            <Breadcumb9 />
            <Listing8 />
        </>
    );
}
