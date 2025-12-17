import { Button, Stack, TextField, Typography } from "@mui/material";

export default function SignInPage() {
  return (
    <Stack component="form" noValidate autoComplete="off" spacing={2} width={320}>
      <Typography
        variant="h5"
        style={{
          textAlign: "center",
        }}
      >
        Sign In
      </Typography>
      <TextField label="Email" type="email" variant="outlined" />
      <TextField label="Password" type="password" variant="outlined" />
      <Button>Sign In</Button>
    </Stack>
  );
}
