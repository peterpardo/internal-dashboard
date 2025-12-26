"use client";

import { createTheme } from "@mui/material";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "class",
  },
  typography: {
    fontFamily: ["var(--font-geist-sans)", "var(--font-geist-mono)"].join(","),
  },
});

export default theme;
