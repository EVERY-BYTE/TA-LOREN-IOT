import { useState } from "react";
import {
  Button,
  Card,
  Typography,
  Container,
  Box,
  TextField,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { firebaseAuth } from "../../firebase/auth";

const SignUpView = () => {
  const navigate = useNavigate();

  const [userEmail, setuserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const handleSubmit = async () => {
    try {
      await firebaseAuth.signUp(userEmail, userPassword);
      console.log("Signup successful");
      navigate("/");
    } catch (error: unknown) {
      console.log(error);
    }
  };

  return (
    <Container maxWidth="xs">
      <Card
        sx={{
          mt: 5,
          p: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          marginBottom={5}
          color="primary"
          fontWeight={"bold"}
        >
          Sign Up
        </Typography>
        <Box
          component="form"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <TextField
            label="E-mail"
            id="signup-email"
            sx={{ m: 1, width: "36ch" }}
            value={userEmail}
            type="email"
            onChange={(e) => setuserEmail(e.target.value)}
          />

          <TextField
            label="Password"
            id="signup-password"
            sx={{ m: 1, width: "36ch" }}
            value={userPassword}
            type="password"
            onChange={(e) => setUserPassword(e.target.value)}
          />

          <Button
            sx={{
              m: 1,
              backgroundColor: "dodgerblue",
              color: "#FFF",
              fontWeight: "bold",
            }}
            variant="contained"
            onClick={handleSubmit}
          >
            Sign Up
          </Button>
          <Typography sx={{ mt: 2, textAlign: "center" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "primary.main",
                fontWeight: "bold",
                textDecoration: "underline",
              }}
            >
              Login here
            </Link>
          </Typography>
        </Box>
      </Card>
    </Container>
  );
};

export default SignUpView;
