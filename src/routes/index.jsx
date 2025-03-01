import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login.jsx";
;
const AppRoutes = () => {
  return (
    
    <Routes>
      <Route index path="/" element={<Login />} />
    </Routes>
  );
};
export default AppRoutes;