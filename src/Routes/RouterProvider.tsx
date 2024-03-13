import { AdminLayout } from "../Components/Layout/AdminLayout";
import { ManagerLayout } from "../Components/Layout/ManagerLayout";
import { UserLayout } from "../Components/Layout/UserLayout";
import { HrRoutes, ManagerRoutes, UserRoutes } from "./Routes";
import { Button, Result } from "antd";

import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ForgetPassword from "../Components/Login/ForgetPassword";
import LoginPage from "../Components/Login/Login";
import NewPassword from "../Components/Login/NewPassword";
import { ReactNode } from "react";
import { Roles } from "../Utils/Roles";
import DashboardLayout from "../Components/Dashboard/Layout";
import ResetPassword from "../Components/Login/ResetPassword";
export function GlobalRouter() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("authToken");

  const getElementwithAccess = (element: ReactNode, role: string, path : any) => {
    const hasRole = () => {
      if (token === null) {
        return false;
      }

      if (!userRole) {
        return false;
      }

      if (role === "*") {
        return true;
      } else {
        return userRole === role;
      }
    };
console.log("userRole",userRole,token,hasRole())
    if (!userRole || !token) {

      return <Navigate to="/login" />;
    } else {
  
      return hasRole() ? element : <Navigate to="/login" />;
    }
  };

  const defaultRedirect = () => {
    switch (userRole) {
      case Roles.ROLE_HR:
        return "/hr/dashboard";
      case Roles.ROLE_EMPLOYEE:
        return "/employee/dashboard";
      case Roles.ROLE_MANAGER : 
        return "/manager/dashboard";
    //   case Roles.ROLE_ADMIN : 
    //     return "/viewer/dashboard";
      default:
        return "/login";
    }
  };

  console.log(defaultRedirect())

  return (
    <Routes>
      <Route
        path="*"
        element={
          <Result
            status={404}
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={
              <Button type="primary" onClick={() => navigate("/")}>
                Back Home
              </Button>
            }
          />
        }
      />


      <Route element={<AdminLayout />}>
        {HrRoutes.map(({ path, element, roles }) => (
          <Route
            path={path}
            element={getElementwithAccess(element, roles, path)}
            key={path}
          />
        ))}
      </Route>

      <Route element={<ManagerLayout />}>
        {ManagerRoutes.map(({ path, element, roles }) => (
          <Route
            path={path}
            element={getElementwithAccess(element, roles, path)}
            key={path}
          />
        ))}
      </Route>

      <Route element={<UserLayout />}>
        {UserRoutes.map(({ path, element, roles }) => (
          <Route
            path={path}
            element={getElementwithAccess(element, roles,path)}
            key={path}
          />
        ))}
      </Route>

      {/* <Route element={<ViewerLayout />}>
        {ViewerRoutes.map(({ path, element, roles }) => (
          <Route
            path={path}
            element={getElementwithAccess(element, roles,path)}
            key={path}
          />
        ))}
      </Route> */}
      <Route path="/" element={<Navigate to={defaultRedirect()} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ResetPassword />} />
      <Route path="/reset-password" element={<NewPassword />} />
    </Routes>
  );
}
