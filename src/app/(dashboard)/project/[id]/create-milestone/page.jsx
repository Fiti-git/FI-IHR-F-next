import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateMilestone from "@/components/dashboard/section/CreateMilestone";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title:
    "IHRHUB | Create Milestone",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <CreateMilestone />
      </DashboardLayout>
    </>
  );
}
