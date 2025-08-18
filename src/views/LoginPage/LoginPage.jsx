/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Box,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fetchVirtualId } from "../../services/userservice/userService";
import "./LoginPage.css";
import { setLocalData } from "../../utils/constants";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { initialize } from "../../services/telementryService";
import { startEvent } from "../../services/callTelemetryIntract";
import LanguageModalNew from "../../utils/LanguageModal";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const ranonce = useRef(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleWordClick = () => {
    setShowModal(true);
  };

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
      if (token) {
        setLocalData("profileName", username);

        const initService = async (visitorId) => {
          await initialize({
            context: {
              mode: process.env.REACT_APP_MODE,
              authToken: token,
              did: localStorage.getItem("deviceId") || visitorId,
              uid: username || "anonymous",
              channel: process.env.REACT_APP_CHANNEL,
              env: process.env.REACT_APP_ENV,
              pdata: {
                id: process.env.REACT_APP_ID,
                ver: process.env.REACT_APP_VER,
                pid: process.env.REACT_APP_PID,
              },
              tags: [""],
              timeDiff: 0,
              host: process.env.REACT_APP_HOST,
              endpoint: process.env.REACT_APP_ENDPOINT,
              apislug: process.env.REACT_APP_APISLUG,
            },
            config: {},
            metadata: {},
          });

          if (!ranonce.current) {
            if (!localStorage.getItem("contentSessionId")) {
              startEvent();
            }
            ranonce.current = true;
          }
        };

        const fp = await FingerprintJS.load();
        const { visitorId } = await fp.get();
        await initService(visitorId);

        setLocalData("readMatch", true);
        //setLocalData("wordWall", true);
        handleWordClick();
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

  useEffect(() => {
    if (localStorage.getItem("apiToken") !== null) {
      navigate("/discover-start");
    }
  }, []);

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
      <LanguageModalNew show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default LoginPage;
