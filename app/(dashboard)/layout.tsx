import MainHeader from "@/app/(dashboard)/_components/main-header";
import Sidebar from "@/app/(dashboard)/_components/sidebar";
import { Container } from "@mui/material";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      <MainHeader />
      <Sidebar />
      {children}
    </Container>
  );
}
