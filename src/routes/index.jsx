import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Register from "../pages/Register/Register.jsx";
import Profile from "../pages/Profile/Profile.jsx";
import Chats from "../pages/Chats/Chats.jsx";
import Explore from "../pages/Explore/Explore.jsx";
import ProfileUserFind from "../pages/ProfileUserFind/ProfileUserFind.jsx";
import Postview from "../pages/Postview/Postview.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route index path="/" element={<Login />} />
      <Route path="/Dashboard" element={<Dashboard/>}></Route>
      <Route path="/Register" element={<Register/>}></Route>
      <Route path="/Profile" element={<Profile/>}></Route>
      <Route path="/Chats" element={<Chats/>}></Route>
      <Route path="/Explore" element={<Explore/>}></Route>
      <Route path="/Profile/:userId" element={<ProfileUserFind />} />
      <Route path="/Post/:postId" element={<Postview />} />
    </Routes>
  );
};
export default AppRoutes;