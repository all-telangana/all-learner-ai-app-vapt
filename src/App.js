import React, { useEffect } from "react";
import { ThemeProvider } from "@mui/material";
import { StyledEngineProvider } from "@mui/material/styles";
import routes from "./routes";
import { AppContent } from "./views";
import theme from "./assets/styles/theme";
import "@tekdi/all-telemetry-sdk/index.js";
import axios from "axios";

const App = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      window.telemetry?.syncEvents?.();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  axios.interceptors.response.use(
    (response) => {
      // console.log("Interceptor - Successful response:", response);
      return response;
    },
    (error) => {
      // console.log("Interceptor - Error response:", error);
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 400)
      ) {
        // console.log("401/400 error detected");
        if (
          error?.response?.data?.error === "Unauthorized" ||
          error?.response?.data?.error === "Invalid token" ||
          error?.response?.data?.error === "Token expired"
        ) {
          // console.log("Token-related error detected");
          if (
            localStorage.getItem("allAppContentSessionId") &&
            process.env.REACT_APP_IS_APP_IFRAME === "true"
          ) {
            // console.log("Posting LOGOUT message to parent window");
            localStorage.setItem("logout_status", "complete");
            // window.parent.postMessage({ type: "LOGOUT" }, "*");
          } else {
            // console.log("Performing local logout");
            localStorage.setItem("logout_status", "complete");
            // localStorage.clear();
            // sessionStorage.clear();
            // navigate("/login");
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <AppContent routes={routes} />
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
