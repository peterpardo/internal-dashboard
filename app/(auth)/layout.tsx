import { Box } from "@mui/material";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="main"
      sx={{
        display: "grid",
        placeItems: "center",
        height: "100vh",
      }}
    >
      {children}
    </Box>
  );
}
