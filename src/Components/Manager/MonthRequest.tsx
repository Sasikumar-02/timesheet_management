import React,{useEffect, useState} from 'react'
import { ColumnsType } from 'antd/es/table';
import { Space, Avatar, Button, Modal, Input, ConfigProvider, Select } from 'antd';
import dayjs from 'dayjs';
import Table from 'antd/es/table';
import {
    UserOutlined,
    DownOutlined,
    UpOutlined,
  } from "@ant-design/icons";
  import type { ThemeConfig } from "antd";
import api from '../../Api/Api-Service';
import { DecodedToken } from '../Employee/EmployeeTaskStatus';
import { jwtDecode } from 'jwt-decode';
const config: ThemeConfig = {
    token: {
      colorPrimary: "#0b4266",
      colorPrimaryBg: "white",
      colorFillAlter: "rgba(231, 236, 240, 0.3)",
      colorPrimaryBgHover: "white",
      borderRadiusLG: 4,
      colorFill: "#0b4266",
      colorBgContainerDisabled: "rgba(0, 0, 0, 0.04)",
    },
  };

const MonthRequest = () => {
    const token = localStorage.getItem("authToken");
    const decoded = jwtDecode(token || "") as DecodedToken;
    const role = decoded.Role;
    console.log("decoded", decoded);
    const {Option}= Select
    const statusOptions = ['Pending', 'Approved', 'Rejected'];
    const [request, setRequest]= useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [comments, setComments] = useState('');
    const [commentVisible, setCommentVisible] = useState(false);
    const [statuses, setStatuses]= useState<boolean>(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    useEffect(()=>{
        const fetchData =async()=>{
            const response= await api.get('/api/v1/timeSheet/fetch-month-block-requests')
            console.log("response", response.data.response.data);
            setRequest(response.data.response.data);
        }
        fetchData();
    },[statuses])

    const handleReject = () => {
        if(selectedRows.length>0){
            setCommentVisible(true);
        }
      };

      const handleCancel = () => {
        setCommentVisible(false);
        setComments(''); // Clear comments when modal is canceled
      };
    
      const handleInputChange = (e:any) => {
        setComments(e.target.value);
      };
    
      const handleSubmit = async () => {
        try {
          const payload = {
            action: "Reject",
            comments: comments,
            requestIds: selectedRows, // Assuming id is the property in each selected row that holds the uniqueRequestId
          };
    
          // Send the payload to the API
          const response = await api.put('/api/v1/timeSheet/timesheet-approval', payload);
          
          console.log(response?.data); // Optionally handle the response data
    
          // Reset the modal state
          setStatuses(prev=>!prev);
          setCommentVisible(false);
          setComments('');
          setSelectedRows([]);
        } catch (error) {
          console.error('Error occurred:', error);
          // Optionally handle errors
        }
      };

      const handleApprove = async () => {
        try {
            if(selectedRows.length>0){
                console.log("handleApprove-selectedRows", selectedRows);
                const payload = {
                    action: "Approve",
                    requestIds: selectedRows, // Assuming id is the property in each selected row that holds the uniqueRequestId
                };
                
                const response = await api.put('/api/v1/timeSheet/review-month-block-requests', payload);
                setStatuses(prev=>!prev);
                setSelectedRows([]);
                console.log("handleApprove",response?.data); // Optionally handle the response data
            }
        } catch (error) {
          console.error('Error occurred:', error);
          // Optionally handle errors
        }
      };

      const handleRowSelection = (selectedRowKeys:any, selectedRows:any) => {
        // Update selectedRows state with the array of uniqueRequestId
        console.log("selectedRowKeys",selectedRowKeys);
        setSelectedRows(selectedRowKeys);
      };

      const handleClearFilter = () => {
        setSelectedStatus(null); // Clear the selected status
    };
      

    const columns: ColumnsType<any> = [
        {
          title: 'Sl.No',
          className: 'ant-table-column-title',
          dataIndex: 'slNo',
          key: 'slNo',
          fixed: 'left',
          render: (_, __, index) => <span>{index + 1}</span>,
        },    
        {
          title: "Employee",
          className: ' ant-table-column-title',
          dataIndex: "employeeId",
          render: (employeeId, record) => (
            <Space className="flex gap-5">
              <Avatar icon={<UserOutlined />} size={45} />
              <div>
                <div>
                  <strong>{record.employeeName}</strong>
                </div>
                <div>{employeeId}</div>
              </div>
            </Space>
          ),
        },          
        {
            title: 'Month',
            className: 'ant-table-column-title',
            dataIndex: 'requestedMonth',
            key: 'requestedMonth',
            fixed: 'left',
            render: (requestedMonth: string) => (
                <div>{dayjs(requestedMonth).format('MMMM YYYY')}</div>
            )
          },
          
        {
          title: 'Description',
          className: 'ant-table-column-title',
          dataIndex: 'description', // Assuming 'requestedOn' is the property in userTasks containing requestedOn data
          key: 'description',
          fixed: 'left',
        },     
        {
          title: 'Status',
          className: 'ant-table-column-title',
          dataIndex: 'approvalStatus',
          key: 'approvalStatus',
        },    
        Table.EXPAND_COLUMN
      ];
  return (
    <ConfigProvider theme={config}>
        <div>
          <div style={{textAlign:'left', marginLeft:'20px', color:"#0B4266"}}>
            <h2>{role==='ROLE_MANAGER' ?'Employee Request':'Request Status'}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'left' }}>
            <Select
                showSearch
                style={{ width: 200, marginRight: 8, height: 40, marginLeft:'20px' }}
                placeholder="Filter by Status"
                onChange={(value) => setSelectedStatus(value)}
                value={selectedStatus}
            >
                <Option value={null}>All Statuses</Option>
                {statusOptions.map((status) => (
                    <Option key={status} value={status}>
                        {status}
                    </Option>
                ))}
            </Select>
            <Button type="default" onClick={handleClearFilter} style={{ width: '100px', height: '40px' }}>Clear Filter</Button>
          </div>
        </div>
        <Table
            rowSelection={{
                type: 'checkbox',
                selectedRowKeys: selectedRows,
                onChange: (selectedRowKeys:any, selectedRows:any[]) => handleRowSelection(selectedRowKeys, selectedRows)
            }}
            className='custom-table'
            columns={columns}
            dataSource={request.filter((task:any) => selectedStatus ? task.approvalStatus === selectedStatus : true)}
            pagination={false}
            rowKey="id" // Set the rowKey prop to 'uniqueRequestId'

        />
        {
          role === 'ROLE_MANAGER' && (
            <div style={{display:'flex', justifyContent:'flex-end', margin:"10px 20px"}}> 
              {selectedStatus !== 'Approved' && selectedStatus !== 'Rejected' && (
                  <>
                      <Button 
                          style={{
                              height: '200%',
                              width: '100px',
                              backgroundColor: selectedRows.length===0?'#FC8267': 'red',
                              color: 'white',
                              marginRight: '10px',
                              cursor: selectedRows.length === 0 ? 'not-allowed' : 'pointer'
                          }} 
                          onClick={handleReject} 
                          title={selectedRows.length === 0 ? "Please select the row to Reject" : ""}
                      >
                          Reject
                      </Button>
                      <Button 
                          style={{
                              height: '200%', 
                              width: '100px', 
                              backgroundColor: selectedRows.length===0?'#6CB66B':'green', 
                              color: 'white', 
                              cursor: selectedRows.length === 0 ? 'not-allowed' : 'pointer'
                          }} 
                          onClick={handleApprove} 
                          title={selectedRows.length === 0 ? "Please select the row to Approve" : ""}
                      >
                          Approve
                      </Button>
                  </>
              )}

              <Modal
              title="Comments"
              className='modalTitle'
              visible={commentVisible}
              onCancel={handleCancel}
              footer={[
                  <Button style={{ width:'100px', height:'40px', backgroundColor: '#0B4266', color: 'white', cursor: selectedRows.length === 0 ? 'not-allowed' : 'pointer' }} key="submit" type="primary" onClick={handleSubmit}>
                  Submit
                  </Button>,
              ]}
              >
              <Input.TextArea placeholder='Write here...' rows={4} value={comments} onChange={handleInputChange} />
              </Modal>
            </div>
          )
        }
        
    </ConfigProvider>
  )
}

export default MonthRequest