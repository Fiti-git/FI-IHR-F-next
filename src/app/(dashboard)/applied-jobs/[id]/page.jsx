import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ManageappliedJobInfo from "@/components/dashboard/section/ManageappliedJobInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title:
    "IHRHUB | Single Job",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <ManageappliedJobInfo />
      </DashboardLayout>
    </>
  );
}
