import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./assets/styles/index.scss";
import store from "./store/configureStore";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";

// ⬇ React 18 createRoot()
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Provider store={store}>
        <App />
      </Provider>
    </Router>
  </React.StrictMode>
);
