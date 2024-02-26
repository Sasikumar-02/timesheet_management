//import "../Styles/Custom.css";
 
import { Layout, Space } from "antd";
import { Navigate, useOutlet } from "react-router";
import React, { ReactNode } from "react";
 
//import Navbar from "../Components/Navbar";
//import { Roles } from "../Utils/Roles";
import Sidebar from "../Dashboard/Sidebar";
 
const { Header, Sider, Content } = Layout;
 
const headerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  height: 80,
  paddingInline: 0,
  lineHeight: "100px",
  backgroundColor: "#e7ecf0",
};
 
const contentStyle: React.CSSProperties = {
  minHeight: 120,
  lineHeight: "120px",
  color: "#000000",
  backgroundColor: "white",
  borderRadius: "30px 0px 0px",
  paddingTop: "20px",
  marginTop: "20px",
  overflowY: "auto",
  maxHeight: "90vh",
  overflowX: "hidden",
};
 
const siderStyle: React.CSSProperties = {
  textAlign: "center",
  lineHeight: "50px",
  width: "300px",
  color: "#fff",
  backgroundColor: "#e7ecf0",
  border: "none",
};
 
export const AdminLayout = () => {
  const outlet = useOutlet();
  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("authToken");
 
  if(!token){
    return <Navigate to='/login'/>
  }
  return (
    <Space direction="vertical" style={{ width: "100%" }} size={[0, 48]}>
      <Layout>
        <Sider style={siderStyle}>
          <Sidebar />
        </Sider>
        <Layout>
          <Header style={headerStyle}>
            {/* <Navbar /> */}
          </Header>
          <Content style={contentStyle}>{outlet}</Content>
        </Layout>
      </Layout>
    </Space>
  );
};
 