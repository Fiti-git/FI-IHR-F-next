import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MyProfileInfo from "@/components/dashboard/section/JPProfileInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "IHRHUB | My Profile",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <MyProfileInfo />
      </DashboardLayout>
    </>
  );
}
