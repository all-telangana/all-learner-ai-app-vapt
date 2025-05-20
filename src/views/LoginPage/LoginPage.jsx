import React, { useEffect, useState } from "react";
// import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Box,
} from "@mui/material";
// import config from "../../utils/urlConstants.json";
import { useMediaQuery } from "@mui/material";
import { fetchVirtualId } from "../../services/userservice/userService";
// import { jwtDecode } from "jwt-decode";
import "./LoginPage.css";
import { setLocalData } from "../../utils/constants";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // const trustedOrigin = "http://localhost:5000";
    const trustedOrigin = process.env.REACT_APP_TRUSTED_ORIGIN;
    const handleMessageFromParent = (event) => {
      // console.log(event.origin, "child origin");
      if (event.origin !== trustedOrigin) return;

      const { type, payload } = event.data;

      if (type === "DATA_FROM_PARENT") {
        setMessage(payload);
        const { username, virtualIdToken, grade } = payload || {};
        if (username && virtualIdToken && grade) {
          setUsername(username);
          localStorage.setItem("apiToken", virtualIdToken);
          setLocalData("profileName", username);
          navigate("/discover-start");
        } else {
          console.warn("⚠️ Incomplete data received, skipping state update.");
        }
      }
    };
    window.addEventListener("message", handleMessageFromParent);
    // Notify parent iframe is ready
    window.parent.postMessage({ type: "DATA_FROM_PARENT" }, trustedOrigin);
    // console.log("📤 Child sent READY_FOR_DATA");

    return () => window.removeEventListener("message", handleMessageFromParent);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("apiToken") !== null) {
      navigate("/discover-start");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Please fill in all fields");
      return;
    }
    localStorage.clear();
    setLoading(true);
    try {
      const usernameDetails = await fetchVirtualId(username);
      let token = usernameDetails?.result?.token;

      localStorage.setItem("apiToken", token);
      // const tokenDetails = jwtDecode(token);
      if (token) {
        setLocalData("profileName", username);
        navigate("/discover-start");
      } else {
        alert("Enter correct username and password");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  // ✅ Show loader if logging in via message or manual login
  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(240,240,240,0.6)",
        }}
      >
        <CircularProgress size="3rem" sx={{ color: "#E15404" }} />
      </Box>
    );
  }

  return (
    <div className={`login-container ${isMobile ? "mobile-view" : ""}`}>
      <div className="loginBox">
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                className="textField"
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                className="textField"
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Login
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
