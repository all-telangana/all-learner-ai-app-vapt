import React, { useEffect, useRef, useState } from "react";
import { ThemeProvider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { StyledEngineProvider } from "@mui/material/styles";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import routes from "./routes";
import { AppContent } from "./views";
import theme from "./assets/styles/theme";
import { initialize } from "./services/telementryService";
import { startEvent } from "./services/callTelemetryIntract";
import "@tekdi/all-telemetry-sdk/index.js";
import axios from "axios";
import { getLocalData } from "./utils/constants";

const App = () => {
  const navigate = useNavigate();
  const ranonce = useRef(false);
  const [appInitialized, setAppInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("apiToken");
    const profileName = getLocalData("profileName");

    if (token && profileName) {
      setAppInitialized(true);
    }
  }, [navigate]);

  useEffect(() => {
    const initService = async (visitorId) => {
      await initialize({
        context: {
          mode: process.env.REACT_APP_MODE,
          authToken: localStorage.getItem("apiToken"),
          did: localStorage.getItem("deviceId") || visitorId,
          uid: "anonymous",
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
        if (localStorage.getItem("contentSessionId") === null) {
          startEvent();
        }
        ranonce.current = true;
      }
    };

    const setFp = async () => {
      const fp = await FingerprintJS.load();
      const { visitorId } = await fp.get();
      initService(visitorId);
    };

    setFp();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.telemetry?.syncEvents?.();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 400)
      ) {
        if (
          error?.response?.data?.error === "Unauthorized" ||
          error?.response?.data?.error === "Invalid token" ||
          error?.response?.data?.error === "Token expired"
        ) {
          if (
            localStorage.getItem("contentSessionId") &&
            process.env.REACT_APP_IS_APP_IFRAME === "true"
          ) {
            window.parent.postMessage(
              {
                message: "Unauthorized",
              },
              window?.location?.ancestorOrigins?.[0] ||
                window.parent.location.origin
            );
          } else {
            localStorage.clear();
            sessionStorage.clear();
            navigate("/login");
          }
        }
      }
      return Promise.reject(error);
    }
  );

  if (!appInitialized) return <div>Loading...</div>;

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <AppContent routes={routes} />
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
