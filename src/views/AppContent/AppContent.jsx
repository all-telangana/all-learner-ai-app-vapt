import React, { useEffect, Fragment } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import CustomizedSnackbars from "../../views/Snackbar/CustomSnackbar";

const PrivateRoute = ({ children, requiresAuth }) => {
  const token = localStorage.getItem("apiToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token && requiresAuth) {
      navigate("/login");
    }
  }, [token, requiresAuth, navigate]);

  return <>{children}</>;
};

const AppContent = ({ routes }) => {
  return (
    <Fragment>
      <CustomizedSnackbars />
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.id}
            path={route.path}
            element={
              <PrivateRoute requiresAuth={route.requiresAuth}>
                <route.component />
              </PrivateRoute>
            }
          />
        ))}
      </Routes>
    </Fragment>
  );
};

export default AppContent;
