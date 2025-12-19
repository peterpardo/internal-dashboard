import { Container } from "@mui/material";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{
        display: "grid",
        placeItems: "center",
        height: "100vh",
      }}
    >
      {children}
    </Container>
  );
}
