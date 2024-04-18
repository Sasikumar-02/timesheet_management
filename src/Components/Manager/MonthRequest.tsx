import React,{useEffect, useState} from 'react'
import { ColumnsType } from 'antd/es/table';
import { Space, Avatar } from 'antd';
import dayjs from 'dayjs';
import Table from 'antd/es/table';
import {
    UserOutlined,
    DownOutlined,
    UpOutlined,
  } from "@ant-design/icons";
import api from '../../Api/Api-Service';
const MonthRequest = () => {

    const [request, setRequest]= useState();

    useEffect(()=>{
        const fetchData =async()=>{
            const response= await api.get('/api/v1/timeSheet/fetch-month-block-requests-for-manager')
            console.log("response", response.data.response.data);
            setRequest(response.data.response.data);
        }
        fetchData();
    },[])
      

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
    <>
        <Table
            // rowSelection={{
            //     type: 'checkbox',
            //     selectedRowKeys: selectedRows,
            //     onChange: (selectedRowKeys:any, selectedRows:any[]) => handleRowSelection(selectedRowKeys, selectedRows)
            // }}
            
            className='custom-table'
            columns={columns}
            dataSource={request}
            pagination={false}
            rowKey="uniqueRequestId" // Set the rowKey prop to 'uniqueRequestId'

        />
    </>
  )
}

export default MonthRequest