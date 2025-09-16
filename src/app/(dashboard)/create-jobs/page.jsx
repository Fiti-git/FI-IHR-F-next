import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateJobInfo from "@/components/dashboard/section/CreateJobInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title:
    "IHRHUB | Create Jobs",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <CreateJobInfo />
      </DashboardLayout>
    </>
  );
}
