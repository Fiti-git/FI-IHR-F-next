import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ManageMyJobs from "@/components/dashboard/section/ManageMyJob";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title:
    "IHRHUB | Manage Jobs",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <ManageMyJobs />
      </DashboardLayout>
    </>
  );
}
