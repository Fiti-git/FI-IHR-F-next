import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ManageFreelancerSingle from "@/components/dashboard/section/ManageFreelancerSingle";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title:
    "IHRHUB | Project",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <ManageFreelancerSingle />
      </DashboardLayout>
    </>
  );
}
