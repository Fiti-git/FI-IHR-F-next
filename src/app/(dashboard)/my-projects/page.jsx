import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FreelancerProjects from "@/components/dashboard/section/FreelancerProjects";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title:
    "IHRHUB | My Project",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <FreelancerProjects />
      </DashboardLayout>
    </>
  );
}
