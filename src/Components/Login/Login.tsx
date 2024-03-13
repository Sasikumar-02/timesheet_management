// import React, { useState, ChangeEvent, FormEvent } from "react";
// import { Input, notification } from "antd";
// import { Link, useNavigate } from "react-router-dom";
// import { useMsal } from '@azure/msal-react';
// import asset from "../../assets/images/asset.svg";
// import mindgraph from "../../assets/images/mindgraph-logo.png";
// import "../Styles/Login.css";
// import api from '../../Api/Api-Service'
// interface LoginState {
//   userName: string;
//   emailError: string;
//   password: string;
//   passwordError: string;
// }

// const Login: React.FC = () => {
//   const host_name= process.env.Host_name || "http://localhost:9090"
//   const { instance } = useMsal();
//   const navigate = useNavigate();
//   const [state, setState] = useState<LoginState>({
//     userName: "",
//     emailError: "",
//     password: "",
//     passwordError: ""
//   });

//   const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const inputValue = e.target.value;
//     setState((prevState) => ({
//       ...prevState,
//       userName: inputValue,
//       emailError: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)
//         ? ""
//         : "Invalid Email",
//     }));
//   };

//   const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const inputValue = e.target.value;
//     setState((prevState) => ({
//       ...prevState,
//       password: inputValue,
//       passwordError: /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/.test(
//         inputValue
//       )
//         ? ""
//         : "Password must be at least 8 characters and include a number and a special character (!@#$%^&*)",
//     }));
//   };

//   const isLoginDisabled =!state.userName || !state.password || state.emailError || state.passwordError;
//   const handleLogin = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!isLoginDisabled) {
//       try {
//         const loginResponse = await api.post("http://localhost:9090/api/auth/login",
//           {
//             userName: state.userName,
//             password: state.password,
//           }
//         );
//         console.log(loginResponse);
//         localStorage.setItem("email", loginResponse.data.response.data.email);
//         console.log(localStorage.getItem("email"));
//         notification.success({
//           message: "Login Successful",
//           description: "OTP has been sent to your email.",
//         });
//         navigate("/otp");
//       } catch (error) {
//         console.error("Login error:", error);
//         notification.error({
//           message: "Login Failed",
//           description: "Please try again.",
//         });
//       }
//     }
//   };
//   // const handleMicrosoftLogin = async () => {
//   //   try {
//   //     const response = await instance.loginPopup();
//   //     console.log(response);
//   //     localStorage.setItem("token", response.accessToken);
//   //     notification.success({
//   //       message: "Login Successful",
//   //       description: "Microsoft Login Successful",
//   //     });
//   //     navigate("/dashboard");
//   //     window.location.reload();
//   //   } catch (error) {
//   //     console.error('Login failed', error);
//   //     notification.error({
//   //       message: "Microsoft Login Failed",
//   //       description: "Please try again.",
//   //     });
//   //   }
//   // };    
//   return (
//     <div className="form">
//       <form className="innerform">
//         <div className="left-section">
//           <img src={asset} alt="logo" />
//           <div className="left-text">
//             <center>
//               Empower Your Team, Elevate Your Business: Streamlining Success
//               with Efficient Asset Management
//             </center>
//           </div>
//         </div>
//         <div className="right-section">
//           <img src={mindgraph} alt="mindgraph" />
//           <h3>Good to See you again</h3>
//           <div className="text">
//             <div className="layout">
//               <label id="text">E-mail ID</label>
//             </div>
//             <Input
//               placeholder="Enter your E-mail ID"
//               value={state.userName}
//               onChange={handleEmailChange}
//               prefix={
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="20"
//                   height="20"
//                   viewBox="0 0 32 32"
//                   fill="none"
//                 >
//                   <g clipPath="url(#clip0_11_8)">
//                     <path
//                       d="M26.6667 5.33331H5.33335C3.86669 5.33331 2.68002 6.53331 2.68002 7.99998L2.66669 24C2.66669 25.4666 3.86669 26.6666 5.33335 26.6666H26.6667C28.1334 26.6666 29.3334 25.4666 29.3334 24V7.99998C29.3334 6.53331 28.1334 5.33331 26.6667 5.33331ZM26.6667 10.6666L16 17.3333L5.33335 10.6666V7.99998L16 14.6666L26.6667 7.99998V10.6666Z"
//                       fill="#041724"
//                     />
//                   </g>
//                   <defs>
//                     <clipPath id="clip0_11_8">
//                       <rect width="32" height="32" fill="white" />
//                     </clipPath>
//                   </defs>
//                 </svg>
//               }
//             />
//             <div className="error">{state.emailError}</div>
//             <div className="layout">
//               <label id="text"> Password </label>
//             </div>
//             <Input.Password
//               placeholder="Enter your Password"
//               value={state.password}
//               onChange={handlePasswordChange}
//               prefix={
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="20"
//                   height="20"
//                   viewBox="0 0 32 32"
//                   fill="none"
//                 >
//                   <g clipPath="url(#clip0_200_2756)">
//                     <path
//                       d="M24 10.6667H22.6666V8.00004C22.6666 4.32004 19.68 1.33337 16 1.33337C12.32 1.33337 9.33331 4.32004 9.33331 8.00004V10.6667H7.99998C6.53331 10.6667 5.33331 11.8667 5.33331 13.3334V26.6667C5.33331 28.1334 6.53331 29.3334 7.99998 29.3334H24C25.4666 29.3334 26.6666 28.1334 26.6666 26.6667V13.3334C26.6666 11.8667 25.4666 10.6667 24 10.6667ZM16 22.6667C14.5333 22.6667 13.3333 21.4667 13.3333 20C13.3333 18.5334 14.5333 17.3334 16 17.3334C17.4666 17.3334 18.6666 18.5334 18.6666 20C18.6666 21.4667 17.4666 22.6667 16 22.6667ZM20.1333 10.6667H11.8666V8.00004C11.8666 5.72004 13.72 3.86671 16 3.86671C18.28 3.86671 20.1333 5.72004 20.1333 8.00004V10.6667Z"
//                       fill="#041724"
//                     />
//                   </g>
//                   <defs>
//                     <clipPath id="clip0_200_2756">
//                       <rect width="32" height="32" fill="white" />
//                     </clipPath>
//                   </defs>
//                 </svg>
//               }
//             />
//             <div className="error">{state.passwordError}</div>
//             <div className="forget">
//               <Link id="fp" to="/forgetPassword">
//                 Forget Password?
//               </Link>
//             </div>
//           </div>
//           <div>
//             <button
//               id="login"
//               type="submit"
//               onClick={handleLogin}
//             >
//               LOGIN
//             </button>
//           </div>
//     {/* <div className="oauth-container">
//           <Tooltip title="Login with Microsoft" placement="bottom">
//             <Button
//               id="oauth"
//               type="primary"
//               onClick={handleMicrosoftLogin}
//               style={{
//                 width: 'calc(100% - 40px)', 
//                 borderRadius: '20px', 
//                 marginTop: '16px', 
//                 backgroundColor: '#ffff',
//                 borderColor: '#ffff', 
//               }}
//             >
//               <WindowsOutlined style={{ color: 'black', marginRight: '8px',fontSize:'larger' }} />
//               Login with Microsoft
//             </Button>
//           </Tooltip>
//         </div> */}
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Login


//import "../Styles/Custom.css";

import * as yup from "yup";

import {
  Button,
  Col,
  ConfigProvider,
  Form,
  Input,
  Row,
  Typography,
  notification,
} from "antd";
import { ErrorMessage, Formik, FormikFormProps, FormikHelpers } from "formik";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import type { ThemeConfig } from "antd";
//import jwt_decode from "jwt-decode";
import logo from "../../assets/images/mindgraph-logo.png";
import LoginLogo from "../../assets/images/Login.svg";
const config: ThemeConfig = {
  token: {
    colorPrimary: "#0B4266",
    colorPrimaryBg: "#E7ECF0",
  },
};
interface LoginT {
  email: string;
  password: string;
}
type FieldType = {
  email?: string;
  password?: string;
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const handleLogin = async (
    values: LoginT,
    { setSubmitting }: FormikHelpers<LoginT>
  ) => {
    try {
      setSubmitting(true);
      const response: any = await fetch(
        `${process.env.REACT_APP_API_KEY}/api/v1/authentication/login`,  //http://192.168.0.121:8080/api/v1/authentication/login
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values?.email,
            password: values?.password,
          }),
        }
      );
  
      console.log("Response status:", response.status); // Log response status
  
      const data = await response.json();
  
      console.log("Response data:", data); // Log response data
  
      if (data?.response) {
        const { token } = data?.response?.data;
        const decoded: {
          Role: string;
        } = jwtDecode(token);
        console.log("Decoded token:", decoded); // Log decoded token
        localStorage.setItem("authToken", data?.response?.data.token);
        localStorage.setItem("role", decoded?.Role);
        setSubmitting(false);
        navigate("/");
      } else {
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error:", error); // Log any errors
      setSubmitting(false);
      notification.error({
        message: "Login Failed",
        description: "Invalid Login credentials",
      });
    }
  };

  return (
    <div>
      <ConfigProvider theme={config}>
        <div
          style={{
            width: "1000px",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
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
                <Formik
                  initialValues={{
                    email: "",
                    password: "",
                  }}
                  onSubmit={handleLogin}
                  validationSchema={yup.object().shape({
                    email: yup
                      .string()
                      .required("Email or Employee Id is required")
                      .test(
                        "isValidEmail",
                        "Email must be in the format user@mind-graph.com or start with MG",
                        (value: string) => {
                          if (value) {
                            return (
                              /^[a-zA-Z0-9._%+-]+@mind-graph\.com$/.test(
                                value
                              ) || /^MG/i.test(value)
                            );
                          }
                          return true; 
                        }
                      ),
                    password: yup
                      .string()
                      .required("Please enter the password"),
                  })}
                >
                  {({
                    values,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                  }) => (
                    <Form
                      name="basic"
                      style={{ maxWidth: 600 }}
                      layout="vertical"
                      autoComplete="off"
                      onFinish={handleSubmit}
                    >
                      <Form.Item<FieldType>
                        label="Email Id / Employee Id"
                        className="label-strong"
                        name="email"
                        required
                        style={{ padding: "10px" }}
                      >
                        <Input
                          style={{
                            height: "50px",
                            width: "470px",
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
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <Typography.Text
                          type="danger"
                          style={{ wordBreak: "break-word", textAlign:'left' }}
                        >
                          <ErrorMessage name="email" />
                        </Typography.Text>
                      </Form.Item>

                      <Form.Item<FieldType>
                        label="Password"
                        className="label-strong"
                        required
                        style={{ padding: "10px" }}
                      >
                        <Input.Password
                          style={{
                            height: "50px",
                            width: "470px",
                            borderRadius: "4px",
                            margin: "0px",
                          }}
                          prefix={
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="28"
                              height="28"
                              viewBox="0 0 20 21"
                              fill="none"
                            >
                              <g clip-path="url(#clip0_293_1306)">
                                <path
                                  d="M15 7.21517H14.1667V5.5485C14.1667 3.2485 12.3 1.38184 10 1.38184C7.70004 1.38184 5.83337 3.2485 5.83337 5.5485V7.21517H5.00004C4.08337 7.21517 3.33337 7.96517 3.33337 8.88184V17.2152C3.33337 18.1318 4.08337 18.8818 5.00004 18.8818H15C15.9167 18.8818 16.6667 18.1318 16.6667 17.2152V8.88184C16.6667 7.96517 15.9167 7.21517 15 7.21517ZM10 14.7152C9.08337 14.7152 8.33337 13.9652 8.33337 13.0485C8.33337 12.1318 9.08337 11.3818 10 11.3818C10.9167 11.3818 11.6667 12.1318 11.6667 13.0485C11.6667 13.9652 10.9167 14.7152 10 14.7152ZM12.5834 7.21517H7.41671V5.5485C7.41671 4.1235 8.57504 2.96517 10 2.96517C11.425 2.96517 12.5834 4.1235 12.5834 5.5485V7.21517Z"
                                  fill="#041724"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_293_1306">
                                  <rect
                                    width="20"
                                    height="20"
                                    fill="white"
                                    transform="translate(0 0.54834)"
                                  />
                                </clipPath>
                              </defs>
                            </svg>
                          }
                          type="password"
                          value={values.password}
                          onChange={handleChange}
                          name="password"
                          onBlur={handleBlur}
                          size="large"
                          iconRender={(visible: any) =>
                            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                          }
                        />
                        <Typography.Text
                          type="danger"
                          style={{ wordBreak: "break-word", textAlign:'left' }}
                        >
                          <ErrorMessage name="password" />
                        </Typography.Text>
                      </Form.Item>

                      <Form.Item
                        name="forgotPassword"
                        wrapperCol={{ offset: 15, span: 16 }}
                        style={{
                          marginTop: "-20px",
                          // marginLeft: "80px",
                          marginRight:'200px',
                          marginBottom: "50px",
                          textAlign:'right'
                        }}
                      >
                        <Link to="/forgot-password" className="forgot-password">
                          <Button type="text" style={{ marginBottom: "0px", fontFamily:'poppins', color:'black', textAlign:'right' }}>
                            Forgot password?
                          </Button>
                        </Link>
                      </Form.Item>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          style={{ width: "100%", height: "41px" }}
                          className="Button"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Signing in..." : "Login"}
                        </Button>
                      </Form.Item>
                    </Form>
                  )}
                </Formik>
              </div>
            </Col>
          </Row>
        </div>
      </ConfigProvider>
    </div>
  );
};

export default LoginPage;

