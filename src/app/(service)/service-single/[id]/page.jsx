import Breadcumb11S from "@/components/breadcumb/Breadcumb11S";
import Header20 from "@/components/header/Header20";
import ServiceDetail1 from "@/components/section/ServiceDetail1";

export const metadata = {
    title: "IHRHUB | Service",
};

export default function page() {
    return (
        <>
            <Header20 />
        

            <Breadcumb11S />
            <ServiceDetail1 />
            
        </>
    );
}
