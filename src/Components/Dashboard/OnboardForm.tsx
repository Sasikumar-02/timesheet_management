import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Modal,
  Col,
  ConfigProvider,
  message,
  notification,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios, { AxiosResponse } from "axios";
//import "../../Styles/Custom.css";
import type { ThemeConfig } from "antd";
import { theme } from "antd";
import api from "../../Api/Api-Services";
import Avatar from "antd/es/avatar/avatar";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { PulseLoader } from "react-spinners";

const { getDesignToken, useToken } = theme;

const config: ThemeConfig = {
  token: {
    colorPrimary: "#0B4266",
    colorPrimaryBg: "#E7ECF0",
  },
};

const globalToken = getDesignToken(config);

const App = () => {
  const { token } = useToken();
  return null;
};

const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const OnboardForm: React.FC = () => {
  interface ProfileData {
    firstName: string;
    lastName: string;
    personalEmail: string;
    gender: string;
    dateOfBirth: string;
    bloodGroup: string;
    mobileNumber: string;
    role: string;
    designation: string;
    branch: string;
    reportingTo: string;
    skills: [];
    address: string;
    city: string;
    district: string;
    state: string;
    nationality: string;
    zipcode: string;
    willingToTravel: boolean;
  }
  const [validPincode, setValidPincode] = useState<string>('');
  const [validPincodeLength, setValidPincodeLength] = useState<number>(0);
  const [nationality, setNationality] = useState<string>(""); // Provide a default value
  const [managers, setManagers] = useState<any[]>([]);
  const [Data, setData] = useState<any>();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any>({
    cities: [],
  });

  const navigate = useNavigate();

  const showConfirm = () => {
    form
      .validateFields()
      .then((values: any) => {
        const formData = new FormData();

        if (profileImage) {
          formData.append("profileImage", profileImage);
        }

        if (values.willingToTravel === "Yes") {
          values.willingToTravel = true;
        } else {
          values.willingToTravel = false;
        }

        formData.append("profileData", JSON.stringify(values));

        confirm({
          title: "Do you want to create this employee?",
          icon: <ExclamationCircleFilled />,
          centered: true,
          width: "auto",
          onOk() {
            setData(formData);
          },
          onCancel() {
            console.log("Cancel");
          },
          okText: "Yes",
          cancelText: "No",
        });
      })
      .catch(() => {});
  };

  async function fetchLocationDataFromAPI(pincode: string, nationality: string) {
    try {
      const response = await api.get(`http://192.168.0.127:8080/api/v1/admin/pincode/${pincode}`, {
        params: {
          Country: nationality,
        },
      });
      console.log(response);
  
      if (response.status === 200) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      return null;
    }
  }
  const validateZipcode = (pincode: string, nationality: string): number => {
    let expectedLength = 0;
  
    switch (nationality) {
      case 'india':
      case 'singapore':
        expectedLength = 6;
        break;
      case 'usa':
      case 'malaysia':
        expectedLength = 5;
        break;
      case 'philippines':
        expectedLength = 4;
        break;
      default:
        expectedLength = 0;
        break;
    }
  
    return expectedLength;
  }; 
  const handleZipcodeChange = async (pincode: string, nationality: string) => {
    try {
      const expectedLength = validateZipcode(pincode, nationality);
  
      if (expectedLength > 0 && pincode.length === expectedLength) {
        const response = await fetchLocationDataFromAPI(pincode, nationality || "");
  
        if (response && response.status === "ACCEPTED") {
          const data = response.response.data;
          form.setFieldsValue({
            state: data.state,
            city: data.cities && data.cities.length > 0 ? data.cities[0] : undefined,
            district: data.district,
            nationality: data.nationality,
          });
          setLocationData(data);
        } else {
          message.error("Location data not found for this pincode");
        }
      } else if (expectedLength > 0) {
      } else {
        message.error("Invalid pincode or pincode length for the selected country");
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  }; 
  
  const fetchReportingManagers = async (
    val: string
  ): Promise<AxiosResponse> => {
    const url = "http://192.168.0.127:8080/api/v1/admin/fetch-manager-list?" + val;
    return await api.get(url);
  };

  const handleImage = (e: any) => {
    const selectedFile = e.target.files[0];
    setProfileImage(selectedFile);
  };

  const handleCancel = () => {
    form.resetFields();
    setProfileImage(null);
  };

  useEffect(() => {
    if (Data) {
      handleApi();
    }
  }, [Data]);

  const handleSubmit = async (values: any) => {
    const formData = new FormData();

    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    if (values.willingToTravel == "Yes") {
      values.willingToTravel = true;
    } else {
      values.willingToTravel = false;
    }

    formData.append("profileData", JSON.stringify(values));

    setData(formData);
  };

  const fetchProject = async (val: string): Promise<AxiosResponse> => {
    const url = "http://192.168.0.127:8080/api/v1/project/search-project?project" + val;
    return await api.get(url);
  };

  const handleKeyPressProject = (e: any) => {
    const value = e.target.value;
    try {
      fetchProject(value)
        .then((response) => {
          const ProjectData = response.data.response.data;
          const filteredProject = ProjectData.filter((project: any) =>
            `${project.projectName}`.toLowerCase().includes(value.toLowerCase())
          );
          setProject(filteredProject);
        })
        .catch((error) => {
          console.error("Error fetching managers:", error);
        });
    } catch (error: any) {
      console.error("Error fetching managers:", error);
      if (error.response?.status === 403) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("role");
        navigate("/");
        window.location.reload();
      }
    }
  };
  
  const handleApi = async () => {
    try {
      setIsLoading(true);
      const headers = {
        "Content-Type": "multipart/form-data",
      };
      const response = await api.post("http://192.168.0.127:8080/api/v1/admin/onboard-employee", Data, {
        headers,
      });
      console.log("Server response:", response.data);
      notification.success({
        message: "Employee Created",
        description: "Employee created successfully!",
      });
      setIsLoading(false);
      navigate(`/employee`);
    } catch (error: any) {
      setIsLoading(false);
      message.error(error?.response?.data?.message);
      if (error.response.status === 403) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("role");
        navigate("/");
        window.location.reload();
      }
    }
  };

  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };

  const handleKeyPress = (e: any) => {
    const value = e.target.value;
    try {
      fetchReportingManagers(value)
        .then((response) => {
          console.log("Fetched data:", response.data.response.data);
          setManagers(response.data.response.data);
        })
        .catch((error) => {
          console.error("Error fetching reporting managers:", error);
        });
    } catch (error: any) {
      console.error("Error fetching reporting managers:", error);
      if (error.response?.status === 403) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("role");
        navigate("/");
        window.location.reload();
      }
    }
  };

  const handleFileRemoval = () => {
    setProfileImage(null);
  };

  return (
    <>
      {isLoading ? (
        <div style={{ position: "fixed", top: "450px", left: "970px" }}>
          <PulseLoader color="#0B4266" size={20} />
        </div>
      ) : (
        <div style={{ width: "1000px", marginLeft: "20px" }}>
          <ConfigProvider theme={config}>
            <Form onFinish={handleSubmit} form={form} layout="vertical">
              <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
                <Col
                  span={12}
                  style={{ display: "flex", justifyContent: "start" }}
                >
                  <Form.Item
                    label="Upload profile"
                    rules={[
                      {
                        required: true,
                        message: "Please provide profile image",
                      },
                    ]}
                  >
                    <label htmlFor="profileImage">
                      <Avatar icon={<UserOutlined />} size={60} />
                      <span></span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ marginBottom: "-20px" }}
                        width="25"
                        height="25"
                        viewBox="0 0 32 32"
                        fill="none"
                      >
                        <g clip-path="url(#clip0_11_21)">
                          <path
                            d="M4 23V28H9L23.7467 13.2533L18.7467 8.25331L4 23ZM27.6133 9.38664C28.1333 8.86664 28.1333 8.02664 27.6133 7.50664L24.4933 4.38664C23.9733 3.86664 23.1333 3.86664 22.6133 4.38664L20.1733 6.82664L25.1733 11.8266L27.6133 9.38664Z"
                            fill="#0B4266"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_11_21">
                            <rect width="32" height="32" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </label>
                    <input
                      type="file"
                      id="profileImage"
                      accept=".jpg,.jpeg,.png"
                      name="profileUrl"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleImage(e);
                      }}
                      style={{
                        display: "none",
                      }}
                    />
                    {profileImage && (
                      <p>
                        Selected file: {profileImage.name}{" "}
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            padding: "5px",
                          }}
                          onClick={() => {
                            handleFileRemoval();
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 32 32"
                            fill="none"
                          >
                            <g clip-path="url(#clip0_11_29)">
                              <path
                                d="M8.00002 25.3333C8.00002 26.8 9.20002 28 10.6667 28H21.3334C22.8 28 24 26.8 24 25.3333V9.33333H8.00002V25.3333ZM25.3334 5.33333H20.6667L19.3334 4H12.6667L11.3334 5.33333H6.66669V8H25.3334V5.33333Z"
                                fill="#0B4266"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_11_29">
                                <rect width="32" height="32" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                        </button>
                      </p>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12} style={{ marginTop: "20px" }}>
                  <Form.Item
                    label="Employee ID"
                    name="userId"
                    rules={[
                      { required: true, message: "Please enter employee id" },
                    ]}
                  >
                    <Input placeholder="Please enter employee id" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[
                      { required: true, message: "Please enter first name" },
                    ]}
                  >
                    <Input placeholder="Please enter first name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[
                      { required: true, message: "Please enter last name" },
                    ]}
                  >
                    <Input placeholder="Please enter last name" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="Personal Email"
                    name="personalEmail"
                    rules={[
                      {
                        required: true,
                        message: "Please enter personal email",
                      },
                    ]}
                  >
                    <Input type="email" placeholder="Please enter email" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Professional Email"
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Please enter professional email",
                      },
                      {
                        pattern: /^[a-zA-Z0-9._%+-]+@mind-graph\.com$/,
                        message:
                          "Professional email must end with @mind-graph.com",
                      },
                    ]}
                  >
                    <Input type="email" placeholder="Please enter email" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="Mobile Number"
                    name="mobileNumber"
                    rules={[
                      { required: true, message: "Please enter mobile number" },
                      {
                        pattern: /^[0-9]{10}$/,
                        message: "Mobile number must a 10-digit number",
                      },
                    ]}
                  >
                    <Input
                      type="tel"
                      placeholder="Please enter mobile number"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Date of Birth"
                    name="dateOfBirth"
                    rules={[
                      {
                        required: true,
                        message: "Please select date of birth",
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%", height: "41px" }}
                      suffixIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_13_58)">
                            <path
                              d="M26.6667 3.99998H25.3334V1.33331H22.6667V3.99998H9.33335V1.33331H6.66669V3.99998H5.33335C3.86669 3.99998 2.66669 5.19998 2.66669 6.66665V28C2.66669 29.4666 3.86669 30.6666 5.33335 30.6666H26.6667C28.1334 30.6666 29.3334 29.4666 29.3334 28V6.66665C29.3334 5.19998 28.1334 3.99998 26.6667 3.99998ZM26.6667 28H5.33335V10.6666H26.6667V28Z"
                              fill="grey"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_13_58">
                              <rect width="32" height="32" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="Gender"
                    name="gender"
                    rules={[
                      { required: true, message: "Please select gender" },
                    ]}
                  >
                    <Select
                      placeholder="Select gender"
                      suffixIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_17_440)">
                            <path
                              d="M9.33331 13.3334L16 20L22.6666 13.3334H9.33331Z"
                              fill="grey"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_17_440">
                              <rect width="22" height="22" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      }
                    >
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                      <Option value="Others">Others</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Blood Group"
                    name="bloodGroup"
                    rules={[
                      { required: true, message: "Please select blood group" },
                    ]}
                  >
                    <Select
                      placeholder="Select blood group"
                      suffixIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_17_440)">
                            <path
                              d="M9.33331 13.3334L16 20L22.6666 13.3334H9.33331Z"
                              fill="grey"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_17_440">
                              <rect width="32" height="32" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      }
                    >
                      <Select.Option value="A+">A+</Select.Option>
                      <Select.Option value="A-">A-</Select.Option>
                      <Select.Option value="B+">B+</Select.Option>
                      <Select.Option value="B-">B-</Select.Option>
                      <Select.Option value="O+">O+</Select.Option>
                      <Select.Option value="O-">O-</Select.Option>
                      <Select.Option value="AB+">AB+</Select.Option>
                      <Select.Option value="AB-">AB-</Select.Option>
                      <Select.Option value="A1+">A1+</Select.Option>
                      <Select.Option value="A1-">A1-</Select.Option>
                      <Select.Option value="A2+">A2+</Select.Option>
                      <Select.Option value="A2-">A2-</Select.Option>
                      <Select.Option value="A1B+">A1B+</Select.Option>
                      <Select.Option value="A1B-">A1B-</Select.Option>
                      <Select.Option value="A2B+">A2B+</Select.Option>
                      <Select.Option value="A2B-">A2B-</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="Role"
                    name="role"
                    rules={[{ required: true, message: "Please select role" }]}
                  >
                    <Select
                      showSearch
                      placeholder="Select an option"
                      optionFilterProp="children"
                      onChange={handleSelectChange}
                      style={{ width: 492 }}
                      suffixIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_17_440)">
                            <path
                              d="M9.33331 13.3334L16 20L22.6666 13.3334H9.33331Z"
                              fill="grey"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_17_440">
                              <rect width="32" height="32" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      }
                      virtual
                      listHeight={200}
                    >
                      <Option value="Cyber Security">Cyber Security</Option>
                      <Option value="Data Engineering">Data Engineering</Option>
                      <Option value="Backend API Developer">
                        Backend API Developer
                      </Option>
                      <Option value="Fullstack Developer">
                        Fullstack Developer
                      </Option>
                      <Option value="Devops Engineer">Devops Engineer</Option>
                      <Option value="UI/UX Designer">UI/UX Designer</Option>
                      <Option value="Human Resource">Human Resource</Option>
                      <Option value="Operation & Delivery Manager">
                        Operation & Delivery Manager
                      </Option>
                      <Option value="Frontend Developer">
                        Frontend Developer
                      </Option>
                      <Option value="Project Manager">Project Manager</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Designation"
                    name="designation"
                    rules={[
                      { required: true, message: "Please select designation" },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Select an option"
                      optionFilterProp="children"
                      onChange={handleSelectChange}
                      style={{ width: 492 }}
                      suffixIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_17_440)">
                            <path
                              d="M9.33331 13.3334L16 20L22.6666 13.3334H9.33331Z"
                              fill="grey"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_17_440">
                              <rect width="32" height="32" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      }
                      virtual
                      listHeight={150}
                    >
                      <Option value="Junior Engineer Intern">
                        Junior Engineer Intern
                      </Option>
                      <Option value="Technical Manager">
                        Technical Manager
                      </Option>
                      <Option value="UI/UX Designer">UI/UX Designer</Option>
                      <Option value="Operation & Delivery Manager">
                        Operation & Delivery Manager
                      </Option>
                      <Option value="React Js Intern">React Js Intern</Option>
                      <Option value="Senior IT Recruiter">
                        Senior IT Recruiter
                      </Option>
                      <Option value="Junior Developer">Junior Developer</Option>
                      <Option value="IT Analyst">IT Analyst</Option>
                      <Option value="Consultant ">Consultant </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="Reporting Manager"
                    name="reportingTo"
                    rules={[
                      { required: true, message: "Please select Reporting To" },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Select an option"
                      optionFilterProp="children"
                      onChange={handleSelectChange}
                      style={{ width: 492 }}
                      onInputKeyDown={handleKeyPress}
                      suffixIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_17_440)">
                            <path
                              d="M9.33331 13.3334L16 20L22.6666 13.3334H9.33331Z"
                              fill="grey"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_17_440">
                              <rect width="32" height="32" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      }
                    >
                      <option value="">Select Manager</option>
                      {managers.map((manager) => (
                        <option key={manager.userId} value={manager.userId}>
                          {manager.email}
                        </option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Branch"
                    name="branch"
                    rules={[
                      { required: true, message: "Please select branch" },
                    ]}
                  >
                    <Select
                      placeholder="Select branch"
                      suffixIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_17_440)">
                            <path
                              d="M9.33331 13.3334L16 20L22.6666 13.3334H9.33331Z"
                              fill="grey"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_17_440">
                              <rect width="32" height="32" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      }
                    >
                      <Option value="Coimbatore">Coimbatore</Option>
                      <Option value="Bangalore">Bangalore</Option>
                      <Option value="Hyderabad">Hyderabad</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="Date Of Joining"
                    name="dateOfJoining"
                    rules={[
                      {
                        required: true,
                        message: "Please select date of joining",
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%", height: "41px" }}
                      suffixIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_13_58)">
                            <path
                              d="M26.6667 3.99998H25.3334V1.33331H22.6667V3.99998H9.33335V1.33331H6.66669V3.99998H5.33335C3.86669 3.99998 2.66669 5.19998 2.66669 6.66665V28C2.66669 29.4666 3.86669 30.6666 5.33335 30.6666H26.6667C28.1334 30.6666 29.3334 29.4666 29.3334 28V6.66665C29.3334 5.19998 28.1334 3.99998 26.6667 3.99998ZM26.6667 28H5.33335V10.6666H26.6667V28Z"
                              fill="grey"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_13_58">
                              <rect width="32" height="32" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Skills"
                    name="skills"
                    style={{ borderColor: "#9BB2C0" }}
                    rules={[
                      { required: true, message: "Please select skills" },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      showSearch
                      placeholder="Select skill(s)"
                      suffixIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_17_440)">
                            <path
                              d="M9.33331 13.3334L16 20L22.6666 13.3334H9.33331Z"
                              fill="grey"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_17_440">
                              <rect width="32" height="32" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      }
                      style={{ width: "100%" }}
                    >
                      <Option value="Azure">Azure</Option>
                      <Option value="Linux">Linux</Option>
                      <Option value="Pentest">Pentest</Option>
                      <Option value="AWS">AWS</Option>
                      <Option value="Python">Python</Option>
                      <Option value="SQL">SQL</Option>
                      <Option value="Machine Learning">Machine Learning</Option>
                      <Option value="Scala">Scala</Option>
                      <Option value="Java">Java</Option>
                      <Option value="C">C</Option>
                      <Option value="HTML">HTML</Option>
                      <Option value="CSS">CSS</Option>
                      <Option value="JavaScript">JavaScript</Option>
                      <Option value="React JS">React JS</Option>
                      <Option value="Bootstrap">Bootstrap</Option>
                      <Option value="Springboot">Springboot</Option>
                      <Option value="Docker">Docker</Option>
                      <Option value="Kubernetes">Kubernetes</Option>
                      <Option value="Jenkins">Jenkins</Option>
                      <Option value="NoSQL">NoSQL</Option>
                      <Option value="Servlet">Servlet</Option>
                      <Option value="JSP">JSP</Option>
                      <Option value="UX Research">UX Research</Option>
                      <Option value="UI Design">UI Design</Option>
                      <Option value="Visual Design">Visual Design</Option>
                      <Option value="Story Board Making">
                        Story Board Making
                      </Option>
                      <Option value="Information Architecture">
                        Information Architecture
                      </Option>
                      <Option value="Card Sorting">Card Sorting</Option>
                      <Option value="Figma">Figma</Option>
                      <Option value="Illustrator">Illustrator</Option>
                      <Option value="Photoshop">Photoshop</Option>
                      <Option value="Adobe XD">Adobe XD</Option>
                      <Option value="Wireframe.cc">Wireframe.cc</Option>
                      <Option value="Miro Board">Miro Board</Option>
                      <Option value="After Effects">After Effects</Option>
                      <Option value="Convincing Candidates">
                        Convincing Candidates
                      </Option>
                      <Option value="Interview Panel">Interview Panel</Option>
                      <Option value="Rate Negotiation">Rate Negotiation</Option>
                      <Option value="HR Activities">HR Activities</Option>
                      <Option value="Client Communication">
                        Client Communication
                      </Option>
                      <Option value="Pyspark">Pyspark</Option>
                      <Option value="Natural Language Processing">
                        Natural Language Processing
                      </Option>
                      <Option value="Gen AI">Gen AI</Option>
                      <Option value="Angular">Angular</Option>
                      <Option value="Typescript">Typescript</Option>
                      <Option value="Selenium Java">Selenium Java</Option>
                      <Option value="TestNG Framework">TestNG Framework</Option>
                      <Option value="Burp Suite">Burp Suite</Option>
                      <Option value="DB Security">DB Security</Option>
                      <Option value="Backend Code Verification">
                        Backend Code Verification
                      </Option>
                      <Option value="C#">C#</Option>
                      <Option value="C++">C++</Option>
                      <Option value="ASP.NET">ASP.NET</Option>
                      <Option value="PHP">PHP</Option>
                      <Option value="NextJs">NextJs</Option>
                      <Option value="NodeJs">NodeJs</Option>
                      <Option value="CPP">CPP</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    label="Address"
                    name="address"
                    rules={[
                      { required: true, message: "Please enter address" },
                    ]}
                  >
                    <Input.TextArea
                      style={{ height: "100px" }}
                      placeholder="Please enter address"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Country"
                  name="nationality"
                  rules={[
                    { required: true, message: "Please select Country" },
                  ]}
                >
                  <Select placeholder="Please select Country"
                    onChange={(value) => setNationality(value)}>
                    <Option value="india">India</Option>
                    <Option value="usa">USA</Option>
                    <Option value="malaysia">Malaysia</Option>
                    <Option value="singapore">Singapore</Option>
                    <Option value="philippines">Philippines</Option>
                  </Select>
                </Form.Item>
              </Col>
                <Col span={12}>
                <Form.Item
                    label="Zipcode"
                    name="zipcode"
                    rules={[
                      { required: true, message: "Please enter zipcode" },
                      {
                        pattern: /^[0-9]{4,}$/,
                        message: "Zipcode must be equal to or greater than 4 digits",
                      },
                    ]}
                  >
                <Input
                    placeholder="Please enter pincode"
                    onChange={(e) => handleZipcodeChange(e.target.value, nationality)}
                  />
                  </Form.Item>                 
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                <Form.Item
                    label="State"
                    name="state"
                    rules={[{ required: true, message: "Please enter state" }]}
                  >
                    <Input placeholder="Please enter state" />
                  </Form.Item>
                  
                </Col>
                <Col span={12}>
                <Form.Item
                    label="District"
                    name="district"
                    rules={[
                      { required: true, message: "Please enter district" },
                    ]}
                  >
                    <Input placeholder="Please enter district" />
                  </Form.Item>
                 
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                <Form.Item
                    label="City"
                    name="city"
                    rules={[
                      { required: true, message: "Please select a city" },
                    ]}
                  >
                    <Select
                      placeholder="Select a city"
                      showSearch
                      optionFilterProp="children"
                    >
                      {Array.isArray(locationData.cities) &&
                        locationData.cities.map((city: string) => (
                          <Select.Option key={city} value={city}>
                            {city}
                          </Select.Option>
                        ))}
                    </Select>
                  </Form.Item>

                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Willing to Travel"
                    name="willingToTravel"
                    rules={[
                      {
                        required: true,
                        message: "Please select travel preference",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select travel preference"
                      suffixIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_17_440)">
                            <path
                              d="M9.33331 13.3334L16 20L22.6666 13.3334H9.33331Z"
                              fill="grey"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_17_440">
                              <rect width="32" height="32" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      }
                    >
                      <Option value="Yes">Yes</Option>
                      <Option value="No">No</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
              <Col span={12} style={{ marginTop: "20px" }}>
                  <Form.Item
                    label="Employee Salary"
                    name="salary"
                    rules={[
                      {required:true, message: "Please enter employee Salary" },
                    ]}
                  >
                    <Input type="number" placeholder="Please enter employee Salary" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <div style={{ display: "flex", justifyContent: "end" }}>
                  <Button
                    onClick={handleCancel}
                    style={{
                      width: "200px",
                      height: "41px",
                      marginTop: "20px",
                      padding: "10px",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="Button"
                    type="primary"
                    style={{
                      width: "200px",
                      height: "41px",
                      marginTop: "20px",
                      marginLeft: "20px",
                      padding: "10px",
                    }}
                    onClick={showConfirm}
                    loading={isLoading}
                  >
                    Create Employee
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </ConfigProvider>
        </div>
      )}
    </>
  );
};

export default OnboardForm;
