import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ManageJobInfo from "@/components/dashboard/section/Managesingeljob";

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
        <ManageJobInfo />
      </DashboardLayout>
    </>
  );
}
