// AuthRoutes.tsx
import React from "react";
import { Route, Routes } from 'react-router-dom';
import Error404 from "../Components/Error/Error-404";
import Error401 from "../Components/Error/Error-401";
import Login from "../Components/Login/Login";
import ForgetPassword from "../Components/Login/ForgetPassword";
import Otp from "../Components/Login/Otp";
import ResetPassword from "../Components/Login/ResetPassword";
import AppRoutes from "./AppRoutes";  // Import AppRoutes
import PrivateRoutes from "./PrivateRoutes";

const AuthRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<PrivateRoutes/>}></Route>
      <Route path="/forgetPassword" element={<ForgetPassword />} />
      <Route path="/resetPassword" element={<ResetPassword />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/error404" element={<Error404 />} />
      <Route path="/error401" element={<Error401 />} />
      <Route path="*" element={<AppRoutes />} /> {/*Redirect to AppRoutes */}
    </Routes>
  );
};
export default AuthRoutes;