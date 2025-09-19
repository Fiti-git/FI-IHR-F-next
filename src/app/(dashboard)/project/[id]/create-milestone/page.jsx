import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CretaeMilestone from "@/components/dashboard/section/CretaeMilestone";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title:
    "IHRHUB | Cretae Milestone",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <CretaeMilestone />
      </DashboardLayout>
    </>
  );
}
