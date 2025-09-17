import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Ticket from "@/components/dashboard/section/Ticket";
import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "IHRHUB | Support",
};

export default function SupportPage() {
  return (
    <>
      <MobileNavigation2 />
      <DashboardLayout>
        <Ticket />
      </DashboardLayout>
    </>
  );
}
