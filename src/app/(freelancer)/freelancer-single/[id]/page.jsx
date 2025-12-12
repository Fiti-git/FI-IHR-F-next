// --- START OF FILE page.jsx ---
import Breadcumb10 from "@/components/breadcumb/Breadcumb10";
import Breadcumb17 from "@/components/breadcumb/Breadcumb17";
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";
import FreelancerDetail1 from "@/components/section/FreelancerDetail1";

export const metadata = {
    title: "IHRHUB | Freelancer Single",
};

export default function Page({ params }) {
    // In Next.js App Router, params.id will contain the ID from the URL (e.g., freelancer/1 -> id: 1)
    // If you are not using dynamic routing yet, you can hardcode id={1} temporarily.
    const id = params?.id || 1; 

    return (
        <>
            <Header20 />
            <Breadcumb10 path={["Home", "Services", "Design & Creative"]} />
            {/* We can pass the ID to Breadcumb17 if it needs to fetch basic header info */}
            <Breadcumb17 />
            {/* Pass the ID to the detail component to fetch full data */}
            <FreelancerDetail1 id={id} />
            <Footer />
        </>
    );
}