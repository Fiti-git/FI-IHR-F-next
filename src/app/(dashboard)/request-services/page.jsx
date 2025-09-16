import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Requestservicesinfo from "@/components/dashboard/section/Requestservicesinfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title:
    "IHRHUB | Request Services",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <Requestservicesinfo />
      </DashboardLayout>
    </>
  );
}
