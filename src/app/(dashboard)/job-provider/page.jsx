import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardInfo from "@/components/dashboard/section/DashboardInfoJP";
import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "IHRHUB JOB PROVIDER| Dashboard",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <DashboardInfo />
      </DashboardLayout>
    </>
  );
}
