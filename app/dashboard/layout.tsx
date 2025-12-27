import MainHeader from "@/app/dashboard/_components/main-header";
import Sidebar from "@/app/dashboard/_components/sidebar";
import { Container } from "@mui/material";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  /**
   * Dashboard layout component
   * 1. Sidebar
   * 2. Header
   * 3. Main content area
   *
   */
  return (
    <Container>
      <MainHeader />
      <Sidebar />
      {children}
    </Container>
  );
}
