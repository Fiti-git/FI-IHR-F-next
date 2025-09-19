import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Help from "@/components/dashboard/section/help";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title:
    "IHRHUB | Support",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <Help />
      </DashboardLayout>
    </>
  );
}
