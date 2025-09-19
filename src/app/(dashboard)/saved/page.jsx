import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SavedInfo from "@/components/dashboard/section/SavedInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "IHRHUB | Saved",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <SavedInfo />
      </DashboardLayout>
    </>
  );
}
