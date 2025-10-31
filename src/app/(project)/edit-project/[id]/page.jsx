import Breadcumb10 from "@/components/breadcumb/Breadcumb10";
import Breadcumb11 from "@/components/breadcumb/Breadcumb11";
import Header20 from "@/components/header/Header20";

import ProjectDetails2 from "@/components/section/ProjectDetails2";
import TabSection1 from "@/components/section/TabSection1";

export const metadata = {
    title: "IHRHUB | Project Single",
};

export default function page() {
    return (
        <>
            <Header20 />
        
            <Breadcumb10 path={["Home", "Services", "Design & Creative"]} />
            <Breadcumb11 />
            <ProjectDetails2 />
        </>
    );
}
