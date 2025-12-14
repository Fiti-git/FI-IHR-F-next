// app/employee-single/[id]/page.jsx

import Breadcumb15 from "@/components/breadcumb/Breadcumb15";
import JobProviderProjects from "@/components/element/JobProviderProjects"; 
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";
import EmplyeeDetail1 from "@/components/section/EmplyeeDetail1";

export const metadata = {
    title: "IHRHUB | Employee Profile",
};

// 1. Add { params } to the function arguments to access the URL ID
export default function Page({ params }) {
    
    return (
        <>
            <Header20 />
            
            {/* Breadcumb15 handles fetching data internally using useParams */}
            <Breadcumb15 />
            
            {/* Main Details Section */}
            <EmplyeeDetail1 />
            
            {/* 2. New "Posted Projects" Section replacing JobInvision1 */}
            <section className="pb90 pt-0">
                <div className="container">
                    {/* 3. Pass the ID from URL to the component */}
                    <JobProviderProjects providerId={params.id} />
                </div>
            </section>
            
            <Footer />
        </>
    );
}