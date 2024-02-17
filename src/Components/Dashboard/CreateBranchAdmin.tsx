import React, { useState, useEffect } from "react";
import { Select, Table, Button, Modal } from "antd";
import data from "../../Data/data.json";
import DashboardLayout from "./Layout";
import "../Styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

interface Employee {
  employeeName: string;
  employeeNumber: string;
  role: string;
  location: string;
}

interface CreateBranchAdminProps {}

const CreateBranchAdmin: React.FC<CreateBranchAdminProps> = () => {
  const Navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  const visibleEmployees = filteredEmployees.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  useEffect(() => {
    setFilteredEmployees(data.employees);
  }, []);

  const handleLocationChange = (value: string | null) => {
    setSelectedLocation(value);
    setPagination({
      ...pagination,
      current: 1,
    });
    if (value) {
      const filtered = data.employees.filter((employee) => employee.location === value);
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(data.employees);
    }
  };

  const handleCreateBranchAdmin = (record: Employee) => {
    setSelectedEmployee(record);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    Navigate("/branch-admin", { state: { addedEmployee: selectedEmployee } });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const locationOptions = data.locations.map((location) => (
    <Option key={location} value={location}>
      {location}
    </Option>
  ));

  // const pageSizeOptions = ["10", "20", "All"];

  const columns = [
    {
      title: "EMPLOYEE NAME",
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: "EMPLOYEE NUMBER",
      dataIndex: "employeeNumber",
      key: "employeeNumber",
    },
    {
      title: "ROLE",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "LOCATION",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "CREATE BRANCH ADMIN",
      key: "createadmin",
      dataIndex: "createadmin",
      align: "center" as const,
      render: (_: any, record: Employee) => (
        <Button
          className="create"
          type="primary"
          onClick={() => handleCreateBranchAdmin(record)}
        >
          ADD
        </Button>
      ),
    },
  ];

  return (
    <div>
      <DashboardLayout>
        <Modal
          title="Confirm"
          visible={isModalVisible}
          onOk={handleOk}
          okText="Yes"
          onCancel={handleCancel}
          okButtonProps={{ style: { width: '80px', backgroundColor: '#0B4266' } }}
          cancelButtonProps={{ style: { width: '80px' } }}
        >
          <p>Do you want to make {selectedEmployee?.employeeName} a branch admin?</p>
        </Modal>

        <Select
          className="ant-location"
          placeholder="Select Location"
          onChange={handleLocationChange}
          value={selectedLocation}
        >
          <Option key="all" value={null}>
            All
          </Option>
          {locationOptions}
        </Select>
       

      <Table
        className="emp"
        dataSource={visibleEmployees}
        columns={columns}
        pagination={{
          ...pagination,
          total: filteredEmployees.length,
          pageSizeOptions: ['10', '20', `${filteredEmployees.length} (All)`],
          onChange: (page, pageSize) => {
            setPagination({ ...pagination, current: page, pageSize });
          },
        }}
        onChange={handleTableChange}
      />
      
      {/* <Select
        style={{ marginLeft: "100px" }}
        defaultValue="10"
        onChange={(value) => {
          const newPageSize = value === "All" ? filteredEmployees.length : Number(value);
          setPagination({ ...pagination, pageSize: newPageSize, current: 1 });
        }}
      >
        {pageSizeOptions.map((pageSize) => (
          <Option key={pageSize} value={pageSize}>
            {pageSize === "All" ? "All" : `${pageSize}  page`}
          </Option>
        ))}
      </Select> */}

      </DashboardLayout>
    </div>
  );
};

export default CreateBranchAdmin;
