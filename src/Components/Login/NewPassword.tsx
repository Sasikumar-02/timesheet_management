import React, { useState, ChangeEvent } from "react";
import { Input, notification,ConfigProvider, Row,
    Col,
    Form,
    Button, } from "antd";
import '../Styles/ResetPassword.css';
import { useNavigate,} from "react-router-dom";
import LoginLogo from "../../assets/images/Forgot-password.svg";
import logo from "../../assets/images/mindgraph-logo.png";
import { useQuery } from "./UseQuery";
//import api from "../../API/API-Service";
import api from '../../Api/Api-Service';
import type { ThemeConfig } from "antd";



const config: ThemeConfig = {
    token: {
      colorPrimary: "#0B4266",
      colorPrimaryBg: "#E7ECF0",
    },
  };

interface ResetPasswordState {
    newPassword: string;
    confirmPassword: string;
    passwordError: string;
    confirmPasswordError: string;
  }

const NewPassword: React.FC = () => {
  const [loading,setIsLoading] = useState(false)
    const query = useQuery();
    const navigate = useNavigate();
    const [state, setState] = useState<ResetPasswordState>({
      newPassword: "",
      confirmPassword: "",
      passwordError: "",
      confirmPasswordError: "",
    });

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setState((prevState) => ({
          ...prevState,
          newPassword: inputValue,
          passwordError: /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(inputValue)
            ? ""
            : "Password must be at least 8 characters and include a number and a special character (!@#$%^&*)",
        }));
      };
    
      const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setState((prevState) => ({
          ...prevState,
          confirmPassword: inputValue,
          confirmPasswordError: inputValue === state.newPassword ? "" : "Passwords do not match",
        }));
      };

      const token = query.get("token");
      const HandleResetPassword = async () => {
        try {
          if (state.newPassword !== state.confirmPassword) {
            //checking if two passwords match
            setState((prevState) => ({ ...prevState, confirmPasswordError: "Passwords do not match" }));
            return;
          }
    
          // Api call
          setIsLoading(true)
          const response = await api.post(
            `/api/v1/authentication/reset-password?token=${token}`,
            {
              newPassword: state.newPassword,
              confirmPassword: state.confirmPassword,
              token,
            }
          );
    
          if (response.data.status === "OK") {
            
          notification.success({
            message: "Password Updated",
            description: "Password updated Successfully",
          });
          setIsLoading(false)
            navigate("/");
          }
        } catch (error) {
          setIsLoading(false)
          console.error("Error resetting password:", error);
          
          notification.error({
            message: "Error resetting password",
            description: "Error resetting password:"+ error,
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
                  name="basic"
                  style={{ maxWidth: 600 }}
                  initialValues={{ remember: true }}
                   
                  layout="vertical"
                  autoComplete="off"
                >
                   <div className="text">
            <div className="layout">
              <label id="text"> New Password </label>
            </div>
            <Input.Password
              placeholder="Enter your Password"
              value={state.newPassword}
              onChange={handlePasswordChange}
              prefix={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <g clipPath="url(#clip0_200_2756)">
                    <path
                      d="M24 10.6667H22.6666V8.00004C22.6666 4.32004 19.68 1.33337 16 1.33337C12.32 1.33337 9.33331 4.32004 9.33331 8.00004V10.6667H7.99998C6.53331 10.6667 5.33331 11.8667 5.33331 13.3334V26.6667C5.33331 28.1334 6.53331 29.3334 7.99998 29.3334H24C25.4666 29.3334 26.6666 28.1334 26.6666 26.6667V13.3334C26.6666 11.8667 25.4666 10.6667 24 10.6667ZM16 22.6667C14.5333 22.6667 13.3333 21.4667 13.3333 20C13.3333 18.5334 14.5333 17.3334 16 17.3334C17.4666 17.3334 18.6666 18.5334 18.6666 20C18.6666 21.4667 17.4666 22.6667 16 22.6667ZM20.1333 10.6667H11.8666V8.00004C11.8666 5.72004 13.72 3.86671 16 3.86671C18.28 3.86671 20.1333 5.72004 20.1333 8.00004V10.6667Z"
                      fill="#041724"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_200_2756">
                      <rect width="32" height="32" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              }
            />
            <div className="error">{state.passwordError}</div>
            <div className="layout">
              <label id="text"> Confrim Password </label>
            </div>
            <Input.Password
              placeholder="Enter your Password"
              value={state.confirmPassword}
              onChange={handleConfirmPasswordChange}
              prefix={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <g clipPath="url(#clip0_200_2756)">
                    <path
                      d="M24 10.6667H22.6666V8.00004C22.6666 4.32004 19.68 1.33337 16 1.33337C12.32 1.33337 9.33331 4.32004 9.33331 8.00004V10.6667H7.99998C6.53331 10.6667 5.33331 11.8667 5.33331 13.3334V26.6667C5.33331 28.1334 6.53331 29.3334 7.99998 29.3334H24C25.4666 29.3334 26.6666 28.1334 26.6666 26.6667V13.3334C26.6666 11.8667 25.4666 10.6667 24 10.6667ZM16 22.6667C14.5333 22.6667 13.3333 21.4667 13.3333 20C13.3333 18.5334 14.5333 17.3334 16 17.3334C17.4666 17.3334 18.6666 18.5334 18.6666 20C18.6666 21.4667 17.4666 22.6667 16 22.6667ZM20.1333 10.6667H11.8666V8.00004C11.8666 5.72004 13.72 3.86671 16 3.86671C18.28 3.86671 20.1333 5.72004 20.1333 8.00004V10.6667Z"
                      fill="#041724"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_200_2756">
                      <rect width="32" height="32" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              }
            />
            <div className="error">{state.confirmPasswordError}</div>
            <div>
              <button id="loginbutton" type="button" onClick={HandleResetPassword}>
                RESET PASSWORD
              </button>{" "}
            </div>
          </div>
                </Form>
              </div>
            </Col>
          </Row>
        </div>
      </ConfigProvider>
    </div>
    );
};

export default NewPassword;