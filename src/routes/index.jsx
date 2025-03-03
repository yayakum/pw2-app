import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Register from "../pages/Register/Register.jsx";
import UserProfile from "../pages/UserProfile/UserProfile.jsx";

const AppRoutes = () => {
  return (
    
    <Routes>
      <Route index path="/Login" element={<Login />} />
      <Route path="/Dashboard" element={<Dashboard/>}></Route>
      <Route path="/Register" element={<Register/>}></Route>
      <Route path="/UserProfile" element={<UserProfile/>}></Route>
    </Routes>
  );
};
export default AppRoutes;