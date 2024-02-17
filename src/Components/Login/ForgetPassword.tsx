// import React, { useState, ChangeEvent } from "react";
// import { Input,notification } from 'antd';
// import { Link } from "react-router-dom";
// import "../Styles/Login.css";
// import forgot from "../../assets/images/forgotpassword.svg";
// import mindgraph from "../../assets/images/mindgraph-logo.png";
// import api from "../../Api/Api-Service";
// import {Button, CardHeader,CardActions, CardContent, Divider, TextField } from "@mui/material";
// import RefreshIcon from "@mui/icons-material/Refresh";
// interface ForgetPasswordState {
//     email: string;
//     emailError: string;
//     errorMessage: string | null;
// }
// const ForgetPassword: React.FC = () => {
//     const [state, setState] = useState<ForgetPasswordState>({
//         email: "",
//         emailError: "",
//         errorMessage: null,
//       });
//       const randomString = Math.random().toString(36).slice(8);
//       const [captcha, setCaptcha]= useState(randomString);
//       const [text, setText]=useState("");
//       const [valid, setValid]= useState(false);
//       const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
//         const inputValue = e.target.value;
//         setState((prevState) => ({
//           ...prevState,
//           email: inputValue,
//           emailError: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)
//             ? ""
//             : "Invalid Email",
//         //   emailError= /^[a-zA-Z0-9._%+-]+@mind-graph\.com$/.text(inputValue)
//         //      ? ""
//         //      : "Professional email must end with @mind-graph.com",
//         }));
//       };
//       const refreshString = () =>{
//         setCaptcha(Math.random().toString(36).slice(8))
//       }
//       const matchCaptcha = (e:any)=>{
//         e.preventDefault();
//         if(text === captcha){

//         }
//       }
//       const handleSendRequest = async (e:any) => {
//         e.preventDefault();
//         if(text===captcha){
//           setValid(false);
//         }else{
//           setValid(true);
//         }
//         const apiEndpoint = 'http://localhost:9090/api/auth/forgotpassword';
//         const headers = {
//           'Content-Type': 'application/json',
//         };
//         const requestBody = {
//           email: state.email,
//         };
//         console.log("a");
//         try {
//           console.log("b");
//           const response = await api.post(apiEndpoint, requestBody, { headers });
//           if (response.data.status === 'OK') {
//             console.log("c");
//             const responseData = response.data.response;
//             notification.success({
//               message: "Mail sent Successfully",
//               description: "Password reset link has been sent to your email." + responseData,
//             });
//           } 
//         } catch (error:any) {
//           console.log("d");
//           notification.error({
//             message: "Error",
//             description: `Error sending password change request: ${error.message}`,
//           });
//         }
//       };
//       return(
//         <div className="form">
//             <form className="innerform">
//                 <div className="left-section">
//                     <img src={forgot} alt="logo"/>
//                 </div>
//                 <div className="right-section">
//                   <img src={mindgraph} alt="mindgraph" />
//                   <h3>Good to See you again</h3>
//                   <div className="text">
//                     <div className="layout">
//                       <label id="text">E-mail ID</label></div>
//                       <Input value={state.email}  onChange={handleEmailChange} 
//                         placeholder="Enter your E-mail ID" prefix={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" fill="none">
//                         <g clipPath="url(#clip0_11_8)">
//                           <path d="M26.6667 5.33331H5.33335C3.86669 5.33331 2.68002 6.53331 2.68002 7.99998L2.66669 24C2.66669 25.4666 3.86669 26.6666 5.33335 26.6666H26.6667C28.1334 26.6666 29.3334 25.4666 29.3334 24V7.99998C29.3334 6.53331 28.1334 5.33331 26.6667 5.33331ZM26.6667 10.6666L16 17.3333L5.33335 10.6666V7.99998L16 14.6666L26.6667 7.99998V10.6666Z" fill="#041724"/>
//                         </g>
//                         <defs>
//                           <clipPath id="clip0_11_8">
//                             <rect width="32" height="32" fill="white"/>
//                           </clipPath>
//                         </defs>
//                       </svg>}/> 
//                       <div className="error">{state.emailError}</div>
//                       <div className="card">
//                         {/* <CardHeader title="Validate CAPTCHA"/> */}
//                         <label>Enter CAPTCHA</label>
//                         <Input onChange={(e)=>setText(e.target.value)} placeholder="Enter the Captcha"></Input>
//                         <Divider />
//                         <CardContent>
//                           <CardActions>
//                             <div className="h3">{captcha}</div>
//                             <Button 
//                               startIcon={<RefreshIcon/>}
//                               onClick={()=>refreshString()}
//                             ></Button>
//                           </CardActions>
//                         </CardContent>
//                       </div>
//                       <div>
//                         <button id="loginbutton" type="button" onClick={handleSendRequest}>Next</button>  
//                       </div>
//                       <div className="redirect">
//                         <Link id="fp" to="/">Back to Login Page</Link>
//                       </div>
//                     </div>
//                   </div>
//             </form>
//         </div>
//       );
// };
// export default ForgetPassword

// import React, { useState, ChangeEvent } from "react";
// import { Input, notification } from "antd";
// import { Link } from "react-router-dom";
// import {
//   Button,
//   CardActions,
//   CardContent,
//   Divider,
// } from "@mui/material";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import api from "../../Api/Api-Service";
// import "../Styles/Login.css";
// import forgot from "../../assets/images/forgotpassword.svg";
// import mindgraph from "../../assets/images/mindgraph-logo.png";

// interface ForgetPasswordState {
//   email: string;
//   emailError: string;
//   errorMessage: string | null;
// }

// const ForgetPassword: React.FC = () => {
//   const [state, setState] = useState<ForgetPasswordState>({
//     email: "",
//     emailError: "",
//     errorMessage: null,
//   });

//   const randomString = Math.random().toString(36).slice(8);
//   const [captcha, setCaptcha] = useState(randomString);
//   const [text, setText] = useState("");

//   const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const inputValue = e.target.value;
//     setState((prevState) => ({
//       ...prevState,
//       email: inputValue,
//       emailError: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)
//         ? ""
//         : "Invalid Email",
//     }));
//   };

//   const refreshString = () => {
//     setCaptcha(Math.random().toString(36).slice(8));
//   };
  
//   const handleSendRequest = async () => {
//     setState((prevState) => ({
//       ...prevState,
//       errorMessage: null,
//     }));
//     const apiEndpoint = "http://localhost:9090/api/auth/forgotpassword";
//     const headers = {
//       "Content-Type": "application/json",
//     };
//     const requestBody = {
//       email: state.email,
//     };

//     try {
//       const response = await api.post(apiEndpoint, requestBody, { headers });
//       if (response.data.status === "OK") {
//         const responseData = response.data.response;
//         notification.success({
//           message: "Mail sent Successfully",
//           description:
//             "Password reset link has been sent to your email." + responseData,
//         });
//       }
//     } catch (error:any) {
//       notification.error({
//         message: "Error",
//         description: `Error sending password change request: ${error.message}`,
//       });
//     }
//   };

//   return (
//     <div className="form">
//       <form className="innerform">
//         <div className="left-section">
//           <img src={forgot} alt="logo" />
//         </div>
//         <div className="right-section">
//           <img src={mindgraph} alt="mindgraph" />
//           <h3>Good to See you again</h3>
//           <div className="text">
//             <div className="layout">
//               <label id="text">E-mail ID</label>
//             </div>
//             <Input
//               value={state.email}
//               onChange={handleEmailChange}
//               placeholder="Enter your E-mail ID"
//               prefix={
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="20"
//                   height="20"
//                   viewBox="0 0 32 32"
//                   fill="none"
//                 >
//                 </svg>
//               }
//             />
//             <div className="error">{state.emailError}</div>
//             <div className="text">
//               <div className="layout">
//                 <label>Enter CAPTCHA</label>
//               </div>
//               <div className="card">
//               <Input 
//                 onChange={(e) => setText(e.target.value)}
//                 placeholder="Enter the Captcha"
//                 className="Captcha-input"
//               />
//               <Divider />
//               <CardContent>
//                 <CardActions>
//                   <div className="zigzag">{captcha}</div>
//                   <Button
//                     startIcon={<RefreshIcon />}
//                     onClick={refreshString}
//                   ></Button>
//                 </CardActions>
//               </CardContent>
//               </div>
//             </div>
//             {text !== "" && text !== captcha && (
//               <div className="error">Invalid Captcha</div>
//             )}
//             <div>
//               <button id="loginbutton" type="button" onClick={handleSendRequest}>
//                 Next
//               </button>
//             </div>
//             <div className="redirect">
//               <Link id="fp" to="/">
//                 Back to Login Page
//               </Link>
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ForgetPassword;


// import React, { useState, ChangeEvent } from "react";
// import { Input, notification } from "antd";
// import { Link } from "react-router-dom";
// import {
//   Button,
//   CardActions,
//   CardContent,
//   Divider,
// } from "@mui/material";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import api from "../../Api/Api-Service";
// import "../Styles/Login.css";
// import forgot from "../../assets/images/forgotpassword.svg";
// import mindgraph from "../../assets/images/mindgraph-logo.png";

// interface ForgetPasswordState {
//   email: string;
//   emailError: string;
//   errorMessage: string | null;
// }

// const ForgetPassword: React.FC = () => {
//   const [state, setState] = useState<ForgetPasswordState>({
//     email: "",
//     emailError: "",
//     errorMessage: null,
//   });

//   const randomString = Math.random().toString(36).slice(8);
//   const [captcha, setCaptcha] = useState(randomString);
//   const [text, setText] = useState("");

//   const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const inputValue = e.target.value;
//     setState((prevState) => ({
//       ...prevState,
//       email: inputValue,
//       emailError: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)
//         ? ""
//         : "Invalid Email",
//     }));
//   };

//   const refreshString = () => {
//     setCaptcha(Math.random().toString(36).slice(8));
//   };

//   const handleSendRequest = async () => {
//     setState((prevState) => ({
//       ...prevState,
//       errorMessage: null,
//     }));

//     if (text !== captcha) {
//       setState((prevState) => ({
//         ...prevState,
//         errorMessage: "Invalid Captcha",
//       }));
//       return;
//     }

//     const apiEndpoint = "http://localhost:9090/api/auth/forgotpassword";
//     const headers = {
//       "Content-Type": "application/json",
//     };
//     const requestBody = {
//       email: state.email,
//     };

//     try {
//       const response = await api.post(apiEndpoint, requestBody, { headers });
//       if (response.data.status === "OK") {
//         const responseData = response.data.response;
//         notification.success({
//           message: "Mail sent Successfully",
//           description:
//             "Password reset link has been sent to your email." + responseData,
//         });
//       }
//     } catch (error:any) {
//       notification.error({
//         message: "Error",
//         description: `Error sending password change request: ${error.message}`,
//       });
//     }
//   };

//   return (
//     <div className="form">
//       <form className="innerform">
//         <div className="left-section">
//           <img src={forgot} alt="logo" />
//         </div>
//         <div className="right-section">
//           <img src={mindgraph} alt="mindgraph" />
//           <h3>Good to See you again</h3>
//           <div className="text">
//             <div className="layout">
//               <label id="text">E-mail ID</label>
//             </div>
//             <Input
//               value={state.email}
//               onChange={handleEmailChange}
//               placeholder="Enter your E-mail ID"
//               prefix={
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="20"
//                   height="20"
//                   viewBox="0 0 32 32"
//                   fill="none"
//                 >
//                 </svg>
//               }
//             />
//             <div className="error">{state.emailError}</div>
//             <div className="text">
//               <div className="layout">
//                 <label>Enter CAPTCHA</label>
//               </div>
//               <div className="card">
//               <Input 
//                 onChange={(e) => setText(e.target.value)}
//                 placeholder="Enter the Captcha"
//                 className="Captcha-input"
//               />
//               <Divider />
//               <CardContent>
//                 <CardActions>
//                   <div className="zigzag">{captcha}</div>
//                   <Button
//                     startIcon={<RefreshIcon />}
//                     onClick={refreshString}
//                   ></Button>
//                 </CardActions>
//               </CardContent>
//               </div>
//             </div>
//             {text !== "" && text !== captcha && (
//               <div className="error">Invalid Captcha</div>
//             )}
//             <div>
//               <button
//                 id="loginbutton"
//                 type="button"
//                 onClick={handleSendRequest}
//                 disabled={text !== captcha}
//               >
//                 Next
//               </button>
//             </div>
//             <div className="redirect">
//               <Link id="fp" to="/">
//                 Back to Login Page
//               </Link>
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ForgetPassword;

// import React, { useState, ChangeEvent } from "react";
// import { Input, notification } from "antd";
// import { Link } from "react-router-dom";
// import {
//   Button,
//   CardActions,
//   CardContent,
//   Divider,
// } from "@mui/material";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import api from "../../Api/Api-Service";
// import "../Styles/Login.css";
// import forgot from "../../assets/images/forgotpassword.svg";
// import mindgraph from "../../assets/images/mindgraph-logo.png";

// interface ForgetPasswordState {
//   email: string;
//   emailError: string;
//   errorMessage: string | null;
// }

// const ForgetPassword: React.FC = () => {
//   const [state, setState] = useState<ForgetPasswordState>({
//     email: "",
//     emailError: "",
//     errorMessage: null,
//   });

//   const randomString = Math.random().toString(36).slice(8);
//   const [captcha, setCaptcha] = useState(randomString);
//   const [text, setText] = useState("");

//   const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const inputValue = e.target.value;
//     setState((prevState) => ({
//       ...prevState,
//       email: inputValue,
//       emailError: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)
//         ? ""
//         : "Invalid Email",
//     }));
//   };

//   const refreshString = () => {
//     setCaptcha(Math.random().toString(36).slice(8));
//   };

//   const handleSendRequest = async () => {
//     setState((prevState) => ({
//       ...prevState,
//       errorMessage: null,
//     }));

//     if (text !== captcha) {
//       notification.error({
//         message: "Invalid Captcha",
//         description: "Please enter the valid captcha",
//       });
//       return;
//     }

//     if (!text) {
//       notification.error({
//         message: "Invalid Captcha",
//         description: "Please enter the captcha",
//       });
//       return;
//     }
//     const apiEndpoint = "http://localhost:9090/api/auth/forgotpassword";
//     const headers = {
//       "Content-Type": "application/json",
//     };
//     const requestBody = {
//       email: state.email,
//     };

//     try {
//       const response = await api.post(apiEndpoint, requestBody, { headers });
//       if (response.data.status === "OK") {
//         const responseData = response.data.response;
//         notification.success({
//           message: "Mail sent Successfully",
//           description:
//             "Password reset link has been sent to your email." + responseData,
//         });
//       }
//     } catch (error:any) {
//       notification.error({
//         message: "Error",
//         description: `Error sending password change request: ${error.message}`,
//       });
//     }
//   };

//   return (
//     <div className="form">
//       <form className="innerform">
//         <div className="left-section">
//           <img src={forgot} alt="logo" />
//         </div>
//         <div className="right-section">
//           <img src={mindgraph} alt="mindgraph" />
//           <h3>Good to See you again</h3>
//           <div className="text">
//             <div className="layout">
//               <label id="text">E-mail ID</label>
//             </div>
//             <Input
//               value={state.email}
//               onChange={handleEmailChange}
//               placeholder="Enter your E-mail ID"
//               prefix={
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="20"
//                   height="20"
//                   viewBox="0 0 32 32"
//                   fill="none"
//                 >
//                 </svg>
//               }
//             />
//             <div className="error">{state.emailError}</div>
//             <div className="text">
//               <div className="layout">
//                 <label>Enter CAPTCHA</label>
//               </div>
//               <div className="card">
//               <Input 
//                 onChange={(e) => setText(e.target.value)}
//                 placeholder="Enter the Captcha"
//                 className="Captcha-input"
//               />
//               <Divider />
//               <CardContent>
//                 <CardActions>
//                   <div className="zigzag">{captcha}</div>
//                   <Button
//                     startIcon={<RefreshIcon />}
//                     onClick={refreshString}
//                     id="captchabutton"
//                   ></Button>
//                 </CardActions>
//               </CardContent>
//               </div>
//             </div>
//             {text !== "" && text !== captcha && (
//               <div className="error">Invalid Captcha</div>
//             )}
//             <div>
//               <button
//                 id="loginbutton"
//                 type="button"
//                 onClick={handleSendRequest}
//                 disabled={text !== captcha}
//               >
//                 Next
//               </button>
//             </div>
//             <div className="redirect">
//               <Link id="fp" to="/">
//                 Back to Login Page
//               </Link>
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ForgetPassword;


// ForgetPassword.tsx

import React, { useState, ChangeEvent } from "react";
import { Input, notification } from "antd";
import { Link } from "react-router-dom";
import {
  Button,
  CardActions,
  CardContent,
  Divider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import api from "../../Api/Api-Service";
import "../Styles/Login.css"; // Import your existing Login.css
import forgot from "../../assets/images/forgotpassword.svg";
import mindgraph from "../../assets/images/mindgraph-logo.png";

interface ForgetPasswordState {
  email: string;
  emailError: string;
  errorMessage: string | null;
}

const ForgetPassword: React.FC = () => {
  const [state, setState] = useState<ForgetPasswordState>({
    email: "",
    emailError: "",
    errorMessage: null,
  });

  const randomString = Math.random().toString(36).slice(8);
  const [captcha, setCaptcha] = useState(randomString);
  const [text, setText] = useState("");

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setState((prevState) => ({
      ...prevState,
      email: inputValue,
      emailError: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)
        ? ""
        : "Invalid Email",
    }));
  };

  const refreshString = () => {
    setCaptcha(Math.random().toString(36).slice(8));
  };

  const handleSendRequest = async () => {
    setState((prevState) => ({
      ...prevState,
      errorMessage: null,
    }));

    if (text !== captcha) {
      notification.error({
        message: "Invalid Captcha",
        description: "Please enter the valid captcha",
      });
      return;
    }

    if (!text) {
      notification.error({
        message: "Invalid Captcha",
        description: "Please enter the captcha",
      });
      return;
    }
    const apiEndpoint = "http://localhost:9090/api/auth/forgotpassword";
    const headers = {
      "Content-Type": "application/json",
    };
    const requestBody = {
      email: state.email,
    };

    try {
      const response = await api.post(apiEndpoint, requestBody, { headers });
      if (response.data.status === "OK") {
        const responseData = response.data.response;
        notification.success({
          message: "Mail sent Successfully",
          description:
            "Password reset link has been sent to your email." + responseData,
        });
      }
    } catch (error:any) {
      notification.error({
        message: "Error",
        description: `Error sending password change request: ${error.message}`,
      });
    }
  };

  return (
    <div className="form">
      <form className="innerform">
        <div className="left-section">
          <img src={forgot} alt="logo" />
        </div>
        <div className="right-section">
          <img src={mindgraph} alt="mindgraph" />
          <h3>Good to See you again</h3>
          <div className="text">
            <div className="layout">
              <label id="text">E-mail ID</label>
            </div>
            <Input
              value={state.email}
              onChange={handleEmailChange}
              placeholder="Enter your E-mail ID"
              prefix={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 32 32"
                  fill="none"
                >
                </svg>
              }
            />
            <div className="error">{state.emailError}</div>
            <div>
              <div className="layout">
                <label>Enter CAPTCHA</label>
              </div>
              <div className="card">
                <Input 
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the Captcha"
                  className="Captcha-input"
                />
                <Divider />
                <CardContent>
                  <CardActions>
                    <div className="zigzag">{captcha}</div>
                    <Button
                      startIcon={<RefreshIcon />}
                      onClick={refreshString}
                      id="captchabutton"
                    ></Button>
                  </CardActions>
                </CardContent>
              </div>
            </div>
            {text !== "" && text !== captcha && (
              <div className="error">Invalid Captcha</div>
            )}
            <div>
              <button
                id="loginbutton"
                type="button"
                onClick={handleSendRequest}
                disabled={text !== captcha}
              >
                Next
              </button>
            </div>
            <div className="redirect">
              <Link id="fp" to="/">
                Back to Login Page
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ForgetPassword;
