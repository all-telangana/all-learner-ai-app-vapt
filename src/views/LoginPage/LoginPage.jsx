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

  useEffect(() => {
    const trustedOrigins =
      process.env.REACT_APP_TRUSTED_ORIGINS?.split(",") || [];

    console.log("✅ Learner-ai-app --- Trusted Origins:", trustedOrigins);

    const handleParentMessage = (event) => {
      console.log(
        "📨 Learner-ai-app ---  Received message from origin:",
        event.origin
      );
      console.log("📨 Learner-ai-app ---  Message data:", event.data);

      if (!trustedOrigins.includes(event.origin)) {
        console.warn("❌ Learner-ai-app ---  Untrusted origin:", event.origin);
        return;
      }

      if (event.data?.type === "INIT") {
        const { username, virtualIdToken, grade } = event.data.payload || {};
        console.log("🔐 Learner-ai-app ---  INIT payload received:", {
          username,
          virtualIdToken,
          grade,
        });

        setLoading(true);
        if (username && virtualIdToken && grade) {
          setUsername(username);
          localStorage.setItem("apiToken", virtualIdToken);
          setLocalData("profileName", username);
          console.log(
            "✅ Learner-ai-app ---  Credentials valid, navigating to /discover-start"
          );
          navigate("/discover-start");
        } else {
          console.warn(
            " Learner-ai-app --- Invalid credentials received for auto-login"
          );
          setLoading(false);
        }

        // Respond back to parent confirming message received
        window.parent.postMessage(
          {
            type: "RECEIVED_CONFIRMATION",
            payload: { username, status: "received" },
          },
          event.origin
        );
        console.log(
          "📤 Learner-ai-app ---  Sent RECEIVED_CONFIRMATION to parent:",
          event.origin
        );
      }
    };

    // Listen for message from parent
    window.addEventListener("message", handleParentMessage);

    // Notify parent iframe is ready
    trustedOrigins.forEach((origin) => {
      window.parent.postMessage({ type: "LOADED" }, origin);
      console.log(
        "📤 Learner-ai-app ---  Sent LOADED message to parent origin:",
        origin
      );
    });

    return () => window.removeEventListener("message", handleParentMessage);
  }, []);

  // useEffect(() => {
  //   const trustedOrigins = "https://kalikadeepa.the-axl.ai/";
  //   const GetMessageFromIframe = (event) => {
  //     if (!trustedOrigins.includes(event.origin)) {
  //       console.warn("⚠️ Untrusted origin:", event.origin);
  //       return;
  //     }

  //     const { username, virtualIdToken, grade } = event.data?.message || {};

  //     if (username && virtualIdToken && grade) {
  //       setUsername(username);
  //       localStorage.setItem("apiToken", virtualIdToken);
  //       // localStorage.setItem("discovery_id", decriptKey);
  //       setLocalData("profileName", username);
  //       navigate("/discover-start");
  //     } else {
  //       console.warn("⚠️ Incomplete data received, skipping state update.");
  //     }
  //   };

  //   window.addEventListener("message", GetMessageFromIframe);

  //   trustedOrigins.forEach((origin) => {
  //     window.parent.postMessage({ type: "REQUEST_DATA" }, origin);
  //   });

  //   return () => {
  //     window.removeEventListener("message", GetMessageFromIframe);
  //   };
  // }, []);

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
