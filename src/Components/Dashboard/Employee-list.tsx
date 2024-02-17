import React, { useState, useEffect } from "react";
import {
  Avatar,
  Space,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  ConfigProvider,
  Tooltip,
  Tag,
  Popover,
  message,
  Checkbox,
  Pagination,
  Menu,
  Dropdown,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  PlusCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import "moment/locale/en-in";
import { ColumnsType } from "antd/es/table";
//import OffboardForm from "./Forms/OffboardForm";
//import "../Styles/Custom.css";
import type { ModalProps, ThemeConfig } from "antd";
import { theme } from "antd";
import { useNavigate } from "react-router";
import api from "../../Api/Api-Services";
import { NavLink } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { CSVLink } from "react-csv";
import DashboardLayout from "./Layout";

const { getDesignToken, useToken } = theme;

const config: ThemeConfig = {
  token: {
    colorPrimary: "#0b4266",

    colorPrimaryBg: "rgba(155, 178, 192, 0.2)",

    colorFillAlter: "rgba(231, 236, 240, 0.3)",

    colorPrimaryBgHover: "rgba(155, 178, 192, 0.2)",

    borderRadiusLG: 4,

    colorFill: "#0b4266",

    colorBgContainerDisabled: "rgba(0, 0, 0, 0.04)",
  },
};

const globalToken = getDesignToken(config);

const onChange = (key: string) => {};

const { Option } = Select;
moment.locale("en-in");

export interface EmployeeType {
  profileUrl: string;
  userId: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  email: string;
  mobileNumber: string;
  gender: string;
  bloodGroup: string;
  dateOfBirth: moment.Moment | any;
  role: string;
  designation: string;
  branch: string;
  dateOfJoining: string;
  dateOfLeaving: any;
  projects: string[];
  reportingManagerId: string | null;
  reportingMangerName: string | null;
  skills: string[];
  address: string;
  city: string;
  district: string;
  zipcode: string;
  state: string;
  nationality: string;
  willingToTravel: boolean;
  reportingManagerEmail: string;
  offboardingReason: string;
  revokeReason: string;
}

interface RevokeModalProps extends ModalProps {
  employeeData: EmployeeType | null;
}

function getUniqueValues(
  users: EmployeeType[],
  key: keyof EmployeeType
): string[] {
  const uniqueValues: Set<string> = new Set();

  users.forEach((user) => {
    const value = user[key];
    if (Array.isArray(value)) {
      value.forEach((item) => uniqueValues.add(item));
    } else if (typeof value === "string") {
      uniqueValues.add(value);
    }
  });

  return Array.from(uniqueValues);
}

const EmployeeList: React.FC = () => {
  const [exportType, setExportType] = useState("all");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [totalItemCount, setTotalItemCount] = useState<number>(0);
  const [employeeData, setEmployeeData] = useState<EmployeeType[]>([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeType | null>(
    null
  );
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [refreshList, setRefreshList] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<EmployeeType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState<EmployeeType[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [revokeModalVisible, setRevokeModalVisible] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeType | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number | "All">();
  const [selectedEmployeeDataForExport, setSelectedEmployeeDataForExport] =
    useState<EmployeeType[]>([]);
  const [hideExport, setHideExport] = useState(true);
  const [isAllDataDisplayed, setIsAllDataDisplayed] = useState<boolean>(false);
  const [selectedEmployeeForRevoke, setSelectedEmployeeForRevoke] =
    useState<EmployeeType | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState({
    role: "Filter by Role",
    designation: "Filter by Designation",
    skills: "Filter by Skills",
    branch: "Filter by Branch",
  });
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const initialFilters = {
    role: null,
    designation: null,
    skills: null,
    branch: null,
  };

  const [form] = Form.useForm();
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    fetchData();
  }, [refreshList]);

  const uniqueRoles: string[] = getUniqueValues(employeeData, "role");
  const uniqueDesignations: string[] = getUniqueValues(
    employeeData,
    "designation"
  );
  const uniqueBranches: string[] = getUniqueValues(employeeData, "branch");
  const allSkills: string[] = employeeData.reduce(
    (allSkills, user) => allSkills.concat(user.skills as any),
    []
  );
  const uniqueSkills: string[] = getUniqueValues(
    [{ skills: allSkills } as EmployeeType],
    "skills"
  );

  const handleRowSelection = (selectedRowKeys: React.Key[]) => {
    const selectedRowKeysString = selectedRowKeys.map((key) => key.toString());
    const selectedEmployees = employeeData.filter((employee) =>
      selectedRowKeysString.includes(employee.userId)
    );
    setSelectedEmployeeDataForExport(selectedEmployees);
    setSelectedRows(selectedRowKeysString);
    setHideExport(selectedRowKeys.length === 0);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setPlaceholderValues({
      role: "Filter by Role",
      designation: "Filter by Designation",
      skills: "Filter by Skills",
      branch: "Filter by Branch",
    });
    setSelectedSkills([]);
    setSelectedRows([]);
    setIsFilterActive(false);
    setSelectedRole(null);
    setSelectedBranch(null)
  };

  const navigate = useNavigate();

  const handleSearchInputChange = (value: string) => {
    setSearchText(value);
  };

  useEffect(() => {
    if (searchText.trim() !== "") {
      const filteredEmployees = employeeData.filter(
        (employee) =>
          employee.userId.toLowerCase().includes(searchText.toLowerCase()) ||
          employee.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
          employee.lastName.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredData(filteredEmployees);
    } else {
      setFilteredData(employeeData);
    }
  }, [searchText, employeeData]);

  const handlePageSizeChange = (current: number, size: number) => {
    const pageSizeValue = size ? totalItemCount : size;
    setPageSize(size);
    console.log(size);
    const newPage = size ? 1 : current;
    setCurrentPage(newPage);
    fetchData(newPage, pageSizeValue);
  };

  const paginationOptions: any = {
    showSizeChanger: true,
    defaultPageSize: 5,
    pageSizeOptions: ["5", "10", "20", "50"],
    onChange: handlePageSizeChange,
    onShowSizeChange: handlePageSizeChange,
  };

  const fetchData = async (pageNumber: number = 1, size?: number | "All") => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const params = {
        page: pageNumber,
        size: size === "All" ? totalItemCount : size,
      };
      const response = await api.get("http://20.198.130.68:8080/api/v1/admin/employee-list", {
        params,
      });

      const totalCount =
        parseInt(response?.data?.response?.totalCount, 10) || 0;
      const data = response?.data?.response?.data;

      const mappedData = data.map((employee: any) => ({
        key: employee.userId,
        profileUrl: employee.profileUrl,
        userId: employee.userId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        personalEmail: employee.personalEmail,
        email: employee.email,
        mobileNumber: employee.mobileNumber,
        gender: employee.gender,
        bloodGroup: employee.bloodGroup,
        dateOfBirth: employee.dateOfBirth,
        role: employee.role,
        designation: employee.designation,
        branch: employee.branch,
        dateOfJoining: employee.dateOfLeaving,
        reportingManagerId: employee.reportingManagerId,
        reportingMangerName: employee.reportingMangerName,
        reportingManagerEmail: employee.reportingManagerEmail,
        skills: employee.skills,
        address: employee.address,
        city: employee.city,
        district: employee.district,
        zipcode: employee.zipcode,
        state: employee.state,
        nationality: employee.nationality,
        willingToTravel: employee.willingToTravel,
        dateOfLeaving: employee.dateOfLeaving,
        offboardingReason: employee.offboardingReason,
      }));

      setEmployeeData(mappedData);
      setIsSubmitting(false);
      setTotalItemCount(totalCount);
      setCurrentPage(pageNumber);
    } catch (error: any) {
      setIsSubmitting(false);
      if (error.response.status === 403) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("role");
        navigate("/");
        window.location.reload();
      }
    }
  };

  const handleAllDetails = () => {
    if (isAllDataDisplayed) {
      setPageSize(5);
      fetchData(currentPage, 5);
    } else {
      setPageSize("All");
      setCurrentPage(1);
      fetchData(1, "All");
    }
    setIsAllDataDisplayed((prev) => !prev);
  };

  const handleDeleteClick = (
    record: EmployeeType,
    event: React.MouseEvent<HTMLElement>
  ) => {
    event.stopPropagation();
    setCurrentEmployee(record);
    setDeleteModalVisible(true);
  };

  const handleDeleteModalClose = async () => {
    setDeleteModalVisible(false);
    setSelectedEmployee(null);
    setRefreshList((prevState) => !prevState);
    await fetchData();
  };

  const handleRowClick = (record: EmployeeType, index: number) => {
    if (!viewModalVisible) {
      navigate(`/employee/${record.userId}`);
    }
  };

  const showTotal = (total: number, range: [number, number]) => {
    return `${range[0]}-${range[1]} of ${total}`;
  };
  const isAllSelected = pageSize === "All";

  const renderSkillsColumn = (skills: string[], selectedSkills: string[]) => {
    let visibleSkills: string[] = [];
    let remainingSkills: string[] = [];

    if (selectedSkills.length > 0) {
      visibleSkills = skills.filter((skill) => selectedSkills.includes(skill));
      remainingSkills = skills.filter(
        (skill) => !visibleSkills.includes(skill)
      );
    } else {
      visibleSkills = skills.slice(0, 3);
      remainingSkills = skills.slice(3);
    }

    return (
      <>
        {visibleSkills.map((skill) => (
          <Tag key={skill}>{skill}</Tag>
        ))}
        {remainingSkills.length > 0 && (
          <Popover
            content={
              <div>
                {remainingSkills.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </div>
            }
            title="Skills"
          >
            <InfoCircleOutlined
              style={{ marginLeft: "5px", color: "#1890ff", cursor: "pointer" }}
            />
          </Popover>
        )}
      </>
    );
  };

  const handleFilterChange = (
    filterType: keyof typeof filters,
    value: string | string[] | null
  ) => {
    if (filterType === "skills") {
      setSelectedSkills(value as string[]);
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [filterType]: value as string,
      }));
    }
    setIsFilterActive(
      Object.values(filters).some((filter) => filter !== null) ||
        selectedSkills.length >= 0
    );
  };
  const exportMenu = (
    <Menu onClick={(e) => handleExportOption(e.key as string)}>
      <Menu.Item key="selectedData">Export</Menu.Item>
      <Menu.Item key="all">Export All</Menu.Item>
    </Menu>
  );

  const handleExportOption = (key: string) => {
    let dataToExport;
  
    if (key === "all") {
      dataToExport = employeeData;
    } else {
      dataToExport = selectedEmployeeDataForExport;
    }
  
    if (dataToExport.length === 0) {
      message.error("Please select data to export.");
    } else {
      exportCSV(dataToExport);
    }
  };

  const exportCSV = (data: EmployeeType[]) => {
    const filename = `employee_data_${moment().format(
      "YYYY-MM-DD_HH-mm-ss"
    )}.csv`;
    const csvLink = document.createElement("a");
    const csv = data.map((item) => Object.values(item).join(",")).join("\n");

    csvLink.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    csvLink.download = filename;
    csvLink.click();
  };

  const filterOptions = (
    <>
      <div
        style={{
          marginBottom: 16,
          marginTop: 15,
          gap: 7,
          display: "block",
          alignItems: "center",
          verticalAlign: "center",
        }}
      >
        <Button
          style={{ height: "41px", marginRight: "10px", borderRadius: "4px" }}
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
        <Select
        showSearch
          style={{ width: 200, marginRight: 8 }}
          placeholder={placeholderValues.role}
          onChange={(value) => {
            handleFilterChange("role", value);
            setSelectedRole(value);
          }}
          value={selectedRole !== null ? selectedRole : undefined}
          virtual
          listHeight={200}
        >
          <Option value={null}>All Roles</Option>
          {uniqueRoles.map((role) => (
            <Option key={role} value={role}>
              {role}
            </Option>
          ))}
        </Select>

        <Select
        showSearch
          style={{ width: 200, marginRight: 8 }}
          placeholder={placeholderValues.designation}
          onChange={(value) => handleFilterChange("designation", value)}
          value={filters.designation !== null ? filters.designation : []}
          virtual
          listHeight={150}
        >
          <Option value={null}>All Designations</Option>
          {selectedRole
            ? uniqueDesignations
                .filter((designation) =>
                  employeeData.some(
                    (employee) =>
                      employee.role === selectedRole &&
                      employee.designation === designation
                  )
                )
                .map((designation) => (
                  <Option key={designation} value={designation}>
                    {designation}
                  </Option>
                ))
            : uniqueDesignations.map((designation) => (
                <Option key={designation} value={designation}>
                  {designation}
                </Option>
              ))}
        </Select>
        <Select
          mode="multiple"
          style={{ width: 200, marginRight: 8 }}
          placeholder={placeholderValues.skills}
          onChange={(value) => {
            handleFilterChange("skills", value);
            setSelectedSkills(value);
          }}
          value={selectedSkills}
        >
          {selectedRole && filters.designation
            ? uniqueSkills
                .filter((skill) =>
                  employeeData.some(
                    (employee) =>
                      employee.role === selectedRole &&
                      employee.designation === filters.designation &&
                      employee.skills.includes(skill)
                  )
                )
                .map((skill) => (
                  <Option key={skill} value={skill}>
                    {skill}
                  </Option>
                ))
            : selectedRole
            ? uniqueSkills
                .filter((skill) =>
                  employeeData.some(
                    (employee) =>
                      employee.role === selectedRole &&
                      employee.skills.includes(skill)
                  )
                )
                .map((skill) => (
                  <Option key={skill} value={skill}>
                    {skill}
                  </Option>
                ))
            : uniqueSkills.map((skill) => (
                <Option key={skill} value={skill}>
                  {skill}
                </Option>
              ))}
        </Select>
        <Select
        showSearch
          style={{ width: 200, marginRight: 8 }}
          placeholder={placeholderValues.branch}
          onChange={(value) => {
            handleFilterChange("branch", value);
            setSelectedBranch(value);
          }}
          value={selectedBranch !== null ? selectedBranch : undefined}
        >
          <Option value={null}>All Branches</Option>
          {selectedRole && filters.designation
            ? uniqueBranches
                .filter((branch) =>
                  employeeData.some(
                    (employee) =>
                      employee.role === selectedRole &&
                      employee.designation === filters.designation &&
                      employee.branch === branch
                  )
                )
                .map((branch) => (
                  <Option key={branch} value={branch}>
                    {branch}
                  </Option>
                ))
            : selectedRole
            ? uniqueBranches
                .filter((branch) =>
                  employeeData.some(
                    (employee) =>
                      employee.role === selectedRole &&
                      employee.branch === branch
                  )
                )
                .map((branch) => (
                  <Option key={branch} value={branch}>
                    {branch}
                  </Option>
                ))
            : uniqueBranches.map((branch) => (
                <Option key={branch} value={branch}>
                  {branch}
                </Option>
              ))}
        </Select>
        <div
          style={{
            marginTop: "-48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginLeft: "1110px",
          }}
        >
          <Input
            className="search"
            placeholder="Search by Name or ID"
            allowClear
            suffix={<SearchOutlined style={{ color: "#04172480" }} />}
            onChange={(e: any) => handleSearchInputChange(e.target.value)}
          />
          <NavLink to="/employee/onboarding">
            <Button style={{ height: "45px" }} className="Button">
              <PlusCircleOutlined />
              Employee Onboarding
            </Button>
          </NavLink>
          <Dropdown overlay={exportMenu} placement="bottomLeft">
            <Button
              type="primary"
              style={{ marginLeft: "8px", height: "45px" }}
            >
              Export
            </Button>
          </Dropdown>
        </div>
      </div>
    </>
  );

  const columns: ColumnsType<EmployeeType> = [
    {
      title: "Employee",
      dataIndex: "userId",
      sorter: (a: EmployeeType, b: EmployeeType) =>
        a.firstName.localeCompare(b.firstName),
      width: 300,
      render: (_, employee) => (
        <Space className="flex gap-5">
          {employee.profileUrl ? (
            <Avatar
              src={employee.profileUrl}
              size={45}
              key={employee.profileUrl}
            />
          ) : (
            <Avatar icon={<UserOutlined />} size={45} />
          )}
          <div>
            <div>
              <strong>
                {employee.firstName} {employee.lastName}
              </strong>
            </div>
            <div>{employee.userId}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      width: 350,
      sorter: (a: EmployeeType, b: EmployeeType) =>
        a.role.localeCompare(b.role),
      dataIndex: "role",
      key: "role",
      fixed: "left",
    },
    {
      title: "Skills",
      dataIndex: "skills",
      key: "skills",
      width: 350,
      render: (_, record) => renderSkillsColumn(record.skills, selectedSkills),
    },
    {
      title: "Reporting Manager",
      dataIndex: "reportingManagerEmail",
      key: "reportingManagerEmail",
      sorter: (a: EmployeeType, b: EmployeeType) =>
        a.reportingManagerEmail.localeCompare(b.reportingManagerEmail),
      width: 300,
    },
    {
      title: "Action",
      key: "operation",
      fixed: "right",
      width: 200,
      align: "left",
      render: (_, record) => (
        <>
          <div>
            {record?.dateOfLeaving ? (
              <Tooltip
                title={`This employee will be offboarded on (${record?.dateOfLeaving})`}
                placement="left"
                style={{ width: "123px" }}
              >
                <Button
                  className="revoke"
                  style={{ marginLeft: "20px" }}
                  onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) =>
                    handleRevokeClick(record, event)
                  }
                >
                  Revoke
                </Button>
              </Tooltip>
            ) : (
              <Button
                style={{ marginLeft: "20px", width: "100px", height: "35px" }}
                className="Button"
                id="offboard"
                onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) =>
                  handleDeleteClick(record, event)
                }
              >
                Offboard
              </Button>
            )}
          </div>
        </>
      ),
    },
  ];

  const applyFilters = () => {
    let filteredEmployees = employeeData;

    if (filters.role) {
      filteredEmployees = filteredEmployees.filter(
        (employee) => employee.role === filters.role
      );
    }

    if (filters.designation) {
      filteredEmployees = filteredEmployees.filter(
        (employee) => employee.designation === filters.designation
      );
    }

    if (selectedSkills.length > 0) {
      filteredEmployees = filteredEmployees.filter((employee) =>
        selectedSkills.every((skill) => employee.skills.includes(skill))
      );
    }

    if (filters.branch) {
      filteredEmployees = filteredEmployees.filter(
        (employee) => employee.branch === filters.branch
      );
    }

    setFilteredData(filteredEmployees);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, employeeData, selectedSkills]);

  useEffect(() => {
    if (searchText.trim() !== "") {
      const filteredEmployees = data.filter(
        (employee) =>
          employee.userId.toLowerCase().includes(searchText.toLowerCase()) ||
          employee.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
          employee.lastName.toLowerCase().includes(searchText.toLowerCase())
      );
      setSearchResults(filteredEmployees);
    } else {
      setSearchResults([]);
    }
  }, [searchText]);

  const data =
    filters.role || filters.designation || filters.skills || filters.branch
      ? filteredData
      : employeeData;

  const displayedData = searchResults.length > 0 ? searchResults : filteredData;

  const [revokeForm] = Form.useForm();

  const handleRevokeClick = async (
    record: EmployeeType,
    event: React.MouseEvent<HTMLElement>
  ) => {
    event.stopPropagation();
    setRevokeModalVisible(true);
    setSelectedEmployeeForRevoke(record);
  };

  const handleRevokeModalClose = () => {
    revokeForm.resetFields();
    setSelectedEmployeeForRevoke(null);
    setRevokeModalVisible(false);
  };

  const handleRevoke = async () => {
    if (!selectedEmployeeForRevoke) return;

    try {
      setIsSubmitting(true);
      const values = await revokeForm.validateFields();

      const response = await api.put("/api/v1/admin/revoke-employee", {
        employeeId: selectedEmployeeForRevoke.userId,
        revokeReason: values.revokeReason,
      });

      if (response.status === 200) {
        message.success("Employee revoked successfully");
        handleRevokeModalClose();
        setRefreshList((prevState) => !prevState);
      }
      setIsSubmitting(false);
      handleRevokeModalClose();
    } catch (error) {
      setIsSubmitting(false);
      handleRevokeModalClose();
      message.error("Failed to revoke employee");
    }
  };

  const showConfirm = () => {
    revokeForm
      .validateFields()
      .then(() => {
        Modal.confirm({
          title: "Do you want to revoke this employee?",
          icon: <ExclamationCircleFilled />,
          centered: true,
          onOk() {
            handleRevoke();
          },
          onCancel() {},
        });
      })
      .catch((errors) => {
        console.log("Validation errors:", errors);
      });
  };

  useEffect(() => {
    if (selectedEmployeeForRevoke) {
      revokeForm.setFieldsValue({
        userId: selectedEmployeeForRevoke.userId,
        userName:
          selectedEmployeeForRevoke.firstName +
          " " +
          selectedEmployeeForRevoke.lastName,
        dateOfLeaving: selectedEmployeeForRevoke.dateOfLeaving,
        offboardingReason: selectedEmployeeForRevoke.offboardingReason,
        revokeReason: "",
      });
    }
  }, [selectedEmployeeForRevoke]);

  return (
    <DashboardLayout>
    <div>
      <ConfigProvider theme={config}>
        <div
          style={{
            display: "flex",
            marginBottom: "20px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {filterOptions}
        </div>
        <>
          <Table
            rowSelection={{
              type: "checkbox",
              selectedRowKeys: selectedRows,
              onChange: handleRowSelection,
            }}
            columns={columns}
            dataSource={displayedData}
            onRow={(record, index: any) => ({
              onClick: () => handleRowClick(record, index),
            })}
            pagination={paginationOptions}
          />
          <Modal
            title={`Offboard`}
            style={{ marginLeft: "0px" }}
            centered
            visible={deleteModalVisible}
            onCancel={handleDeleteModalClose}
            maskClosable={false}
          >
          </Modal>

          <Modal
            title="Revoke Employee"
            visible={revokeModalVisible}
            centered
            onCancel={handleRevokeModalClose}
            footer={null}
            maskClosable={false}
          >
            <Form
              form={revokeForm}
              onFinish={handleRevoke}
              layout="vertical"
              style={{ marginTop: "40px" }}
            >
              <Form.Item label="Employee ID" name="userId">
                <Input
                  defaultValue={selectedEmployeeForRevoke?.userId}
                  disabled
                />
              </Form.Item>

              <Form.Item label="Employee Name" name="userName">
                <Input
                  defaultValue={
                    selectedEmployeeForRevoke?.firstName +
                    "" +
                    selectedEmployeeForRevoke?.lastName
                  }
                  disabled
                />
              </Form.Item>

              <Form.Item label="Date of Leaving" name="dateOfLeaving">
                <Input
                  defaultValue={selectedEmployeeForRevoke?.dateOfLeaving}
                  disabled
                />
              </Form.Item>

              <Form.Item label="Offboarding Reason" name="offboardingReason">
                <TextArea
                  defaultValue={selectedEmployeeForRevoke?.offboardingReason}
                  disabled
                />
              </Form.Item>

              <Form.Item
                label="Revoke Reason"
                name="revokeReason"
                rules={[
                  {
                    required: true,
                    message: "Please enter a reason for revoke",
                  },
                ]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Form>

            <Form.Item>
              <Button
                onClick={showConfirm}
                className="Button"
                style={{
                  width: "123px",
                  height: "41px",
                  marginTop: "20px",
                  marginLeft: "350px",
                  padding: "5px",
                }}
                htmlType="button"
              >
                Revoke
              </Button>
            </Form.Item>
          </Modal>
        </>
      </ConfigProvider>
    </div>
    </DashboardLayout>
  );
}
export default EmployeeList;