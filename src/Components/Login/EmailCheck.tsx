import React from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  ConfigProvider,
} from "antd";
import LoginLogo from "../../Assets/Images/Forgot-password.svg";
import logo from "../../Assets/Images/MG Logo 1.png";
import type { ThemeConfig } from "antd";
import { Link, useNavigate} from "react-router-dom";


const config: ThemeConfig = {
  token: {
    colorPrimary: "#0B4266",
    colorPrimaryBg: "#E7ECF0",
  },
};

const EmailCheck: React.FC = () => {
  const navigate = useNavigate();

  interface EmailCheck {
    username: string;
    password: string;
  }
  type FieldType = {
    username?: string;
    password?: string;
    remember?: string;
  };
  const handleLogin = async (values: EmailCheck) => {
    console.log('OTP sent to your mail please check')
    navigate("/otp-check")
  };

  return (
    <div>
      <ConfigProvider theme={config}>
        <div
          style={{
            width: "1000px",
            position:'fixed',
            top:'50%',
            left:'50%',
            transform:'translate(-50%,-50%)',
            backgroundColor: "#ffffff",
            padding: "50px",
            borderRadius: "10px",
            boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
          className="login-container"
        >
          <Row justify="center" align="middle" className="login-row">
            <Col span={12} className="left-side">
              <img
                src={LoginLogo}
                height="430px"
                alt="Left Image"
                className="left-image"
              />
            </Col>
            <Col span={12} className="right-side">
              <div className="right-content">
                <img
                  src={logo}
                  alt="Company Logo"
                  width="250px"
                  height="100px"
                  style={{marginLeft: "-20PX"}}
                  className="company-logo"
                />
                <h1>Forgot Your Password?</h1>
                <Form
                  name="basic"
                  style={{ maxWidth: 600 }}
                  initialValues={{ remember: true }}
                  onFinish={handleLogin}
                  layout="vertical"
                  autoComplete="off"
                >
                  <Form.Item<FieldType>
                    label="Email Id"
                    className="label-strong"
                    name="username"
                    rules={[
                      { required: true, message: "Please enter your mail id" },
                      {
                        validator: async (_, value) => {
                          if (value) {
                            if (
                              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                            ) {
                              throw new Error(
                                "Invalid mail id"
                              );
                            }
                          }
                        },
                      },
                    ]}
                    
                    style={{ padding: "10px" }}
                  >
                    <Input
                      style={{
                        height: "50px",
                        width:'470px',
                        borderRadius: "4px",
                        margin: "0px",
                      }}
                      prefix={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="28"
                          height="28"
                          viewBox="0 0 18 14"
                          fill="none"
                        >
                          <path
                            d="M15.6666 0.381836H2.33329C1.41663 0.381836 0.674959 1.13184 0.674959 2.0485L0.666626 12.0485C0.666626 12.9652 1.41663 13.7152 2.33329 13.7152H15.6666C16.5833 13.7152 17.3333 12.9652 17.3333 12.0485V2.0485C17.3333 1.13184 16.5833 0.381836 15.6666 0.381836ZM15.6666 3.71517L8.99996 7.88184L2.33329 3.71517V2.0485L8.99996 6.21517L15.6666 2.0485V3.71517Z"
                            fill="#041724"
                          />
                        </svg>
                      }
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{ width:'470px', height: "41px",marginLeft:'10px' }}
                      className="Button"
                    >
                      Send OTP
                    </Button>
                  </Form.Item>
                </Form>
                  <Link to="/"><h3 style={{display:'flex',justifyContent:'center',color:'#0B4266'}}>Return to login page</h3></Link>
              </div>
            </Col>
          </Row>
        </div>
      </ConfigProvider>
    </div>
  );
};

export default EmailCheck;
