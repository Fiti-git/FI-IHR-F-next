import { Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MessageInfo from "@/components/dashboard/section/MessageInfo";
import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "IHRHUB | Message",
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading message...</div>}>
      <MobileNavigation2 />
      <DashboardLayout>
        <MessageInfo />
      </DashboardLayout>
    </Suspense>
  );
}
