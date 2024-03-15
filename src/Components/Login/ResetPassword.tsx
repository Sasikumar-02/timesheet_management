import React, { useState, } from "react";
import { Input,notification ,ConfigProvider, Row,
  Col,
  Form,
  Button,} from 'antd';
import '../Styles/ResetPassword.css';
import LoginLogo from "../../assets/images/Forgot-password.svg";
import logo from "../../assets/images/mindgraph-logo.png";
import api from "../../Api/Api-Service";
import type { ThemeConfig } from "antd";
import { Link, useNavigate } from "react-router-dom";

const config: ThemeConfig = {
  token: {
    colorPrimary: "#0B4266",
    colorPrimaryBg: "#E7ECF0",
  },
};

interface ForgetPasswordState {
    email: string;
    emailError: string;
    errorMessage: string | null;

  }

const ResetPassword: React.FC = () => {

  const [email, setEmail] = useState("");
  const [loading,setIsLoading] = useState(false)
  const navigate = useNavigate();

  console.log(email)
      const handleSendRequest = async () => {
        const apiEndpoint = '/api/v1/authentication/forgot-password';
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
        };
      
        const formData = new FormData();
        formData.append('email', email);
      
        try {
          setIsLoading(true)
          const response = await api.post(apiEndpoint, formData, { headers });
      
          if (response.data.status === 'OK') {
            const responseData = response?.data?.response;
            notification.success({
              message: 'Mail sent Successfully',
              description: response?.data?.message,
            });
          }
          setIsLoading(false)
          navigate("/");
        } catch (error: any) {
          setIsLoading(false)
          notification.error({
            message: 'Error',
            description: `Error sending password change request: ${error.message}`,
          });
        }
      };
      
    return(

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
                style={{height:'400px', width:'400px', paddingRight:'60px'}}
              />
              <p
                style={{
                  width: "350px",
                  textAlign: "center",
                  marginLeft: "35px",
                  lineHeight: "1.5", // Adjust this value as needed for the desired spacing
                }}
              >
                "Cultivate Your Talent: Collaborate, Blog, and Chart Your
                Journey! Admins Drive Seamless Onboarding and Offboarding
                Experiences."
              </p>
            </Col>
            <Col span={12} className="right-side">
              <div className="right-content">
                <img
                  src={logo}
                  alt="Company Logo"
                  width="250px"
                  height="100px"
                  style={{ marginTop: "20px", marginLeft: "-20PX" }}
                  className="company-logo"
                />
                <h1>Good to see you again</h1>
                <Form
        onFinish={handleSendRequest}
        name="basic"
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          label="Email Id"
          className="label-strong"
          name="email"
          rules={[
            { required: true, message: "Please enter professional email ID" },
            {
              validator: async (_, value) => {
                if (value) {
                  if (
                    !/^[a-zA-Z0-9._%+-]+@mind-graph\.com$/.test(value) &&
                    !/^MG/i.test(value)
                  ) {
                    throw new Error(
                      "Email must be in the format user@mind-graph.com or start with MGXXX"
                    );
                  }
                }
              },
            },
          ]}
          style={{ padding: "10px" }}
        >
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              height: "50px",
              width: '470px',
              borderRadius: "4px",
              margin: "0px",
            }}
            prefix={<svg
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
            </svg>}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: "100%", height: "41px", marginBottom:'10px' }}
            className="Button"
            loading={loading}
          >
            SEND REQUEST
          </Button>
          <a className="forgot">
            <Link to="/"><h3>Back to login page</h3></Link>
          </a>
        </Form.Item>
      </Form>
              </div>
            </Col>
          </Row>
        </div>
      </ConfigProvider>
    </div>


    );
};

export default ResetPassword