import React, {useState, useEffect} from 'react'
import { ColumnsType } from 'antd/es/table'
import { useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import TextArea from 'antd/es/input/TextArea';
import { Input, TimePicker, Select, notification, DatePicker, Button, Modal, Col,
    ConfigProvider,
    Form,
    Row,
    Typography,
    ThemeConfig,
    message,} from 'antd';
  import * as yup from "yup";
  import { ErrorMessage, Formik, FormikFormProps, FormikHelpers, Field } from "formik";
import api from '../../Api/Api-Service';
import { DecodedToken } from '../Employee/EmployeeTaskStatus';
import { jwtDecode } from 'jwt-decode';
import { CatchingPokemonSharp } from '@mui/icons-material';
import {ArrowLeftOutlined } from "@ant-design/icons";
import '../Styles/CreateUser.css';
import '../Styles/AddTask.css';
import { useLocation } from 'react-router-dom';
import { initial } from 'lodash';
  type FieldType={
    members?:Array<any>;
    task?: string;
    project?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }

  interface Employee {
    employeeId?:string;
    employeeName?:string;
  }

  interface ProjectDetails{
    active: boolean;
    createdOn: string;
    estimatedEndDate:string;
    projectCode: string;
    projectDescription:string;
    projectId:string;
    projectManager: string;
    projectManagerName:string;
    projectManagerProfile:string;
    projectManagerUserId:string;
    projectMembers:Array<any>;
    projectName:string;
    projectOwner:string;
    projectOwnerName:string;
    projectOwnerProfile:string;
    projectOwnerUserId:string;
    projectStatus:string;
    projectType:string;
    startDate:string

  }

  const config: ThemeConfig = {
    token: {
      colorPrimary: "#0B4266",
      colorPrimaryBg: "#E7ECF0",
    },
  };

const TaskAssign = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location;
    const record = state && state.record ? state.record : null;
    const [project, setProject] = useState<ProjectDetails[]>([]);
    const [employee, setEmployee]= useState<Employee[]>([])
    const [allemployees, setAllEmployees]= useState<Employee[]>([]);
    const token = localStorage.getItem("authToken");
    const decoded = jwtDecode(token || "") as DecodedToken;
    const userId = decoded.UserId;
    const [initialValue, setInitialValue] = useState<any>(() => {
      if (record!==null) {
          return {
              members: record.employees.map((emp:any)=>emp.employeeId),
              task: record.taskName,
              project: record.projectName,
              startDate: record.startDate,
              endDate: record.estimatedEndDate,
              description: record.taskDescription,
          };
      } else {
          return {
              members: allemployees,
              task: '',
              project: '',
              startDate: '',
              endDate: '',
              description: '',
          };
      }
    });
    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await api.get('/api/v1/employee/fetch-reporting-manager-users');
            const employeeNames = response.data.response.data.map((emp: any) => ({
              employeeName: emp.firstName + ' ' + emp.lastName,
              employeeId: emp.userId
          }));
            setAllEmployees(employeeNames);
          } catch (error) {
            console.error('Error fetching reporting manager users:', error);
          }
        };
        fetchData();
      }, []);
      
    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await api.get('/api/v1/project/get-all-projects');
            const projectsData: ProjectDetails[] = response.data.response.data.map((project: any) => {
              return {
                active: project.active,
                createdOn: project.createdOn,
                estimatedEndDate: project.estimatedEndDate,
                projectCode: project.projectCode,
                projectDescription: project.projectDescription,
                projectId: project.projectId,
                projectManager: project.projectManager,
                projectManagerName: project.projectManagerName,
                projectManagerProfile: project.projectManagerProfile,
                projectManagerUserId: project.projectManagerUserId,
                projectMembers: project.projectMembers,
                projectName: project.projectName,
                projectOwner: project.projectOwner,
                projectOwnerName: project.projectOwnerName,
                projectOwnerProfile: project.projectOwnerProfile,
                projectOwnerUserId: project.projectOwnerUserId,
                projectStatus: project.projectStatus,
                projectType: project.projectType,
                startDate: project.startDate,
              };
            });
            const otherProject: ProjectDetails = {
              active: false, 
              createdOn: '', 
              estimatedEndDate: '', 
              projectCode: '', 
              projectDescription: '', 
              projectId: 'other',
              projectManager: '', 
              projectManagerName: '', 
              projectManagerProfile: '', 
              projectManagerUserId: '',  
              projectMembers: employee,  
              projectName: 'Other',
              projectOwner: '',  
              projectOwnerName: '',  
              projectOwnerProfile: '',  
              projectOwnerUserId: '',  
              projectStatus: '',  
              projectType: '',  
              startDate: '',  
            };
            
            setProject([...projectsData, otherProject]);
            let employeeNames: Employee[] = [];
            response.data.response.data.forEach((project: any) => {
              project.projectMembers.forEach((member: any) => {
                employeeNames.push(
                    {
                        employeeName: member.userName,
                        employeeId: member.userId,
                    });
              });
            });
            setEmployee(employeeNames);
          } catch (error) {
            console.error('Error fetching projects:', error);
          }
        };
        fetchData();
      }, []);

      const handleEmployeeName=(value:string)=>{
        if(value === 'Other'){
            setEmployee(allemployees);
        } else{
            let employeeNames:any[]=[];
            project.map((project:any)=>{
                if(project.projectName === value){
                    project.projectMembers.forEach((member: any) => {
                        employeeNames.push(
                        {
                            employeeName: member.userName,
                            employeeId: member.userId,
                        });
                    });
                }
            })
            setEmployee(employeeNames);
        }
      }


    const handleFormSubmit=async(values: any, { setSubmitting, resetForm }: FormikHelpers<any>)=>{
      const response = await api.get('/api/v1/project/get-all-projects');
      let selectedProject =null; 
      response.data.response.data.forEach((project:any) => {
          if (project.projectName === values.project) {
              selectedProject = {
                  active: project.active,
                  createdOn: project.createdOn,
                  estimatedEndDate: project.estimatedEndDate,
                  projectCode: project.projectCode,
                  projectDescription: project.projectDescription,
                  projectId: project.projectId,
                  projectManager: project.projectManager,
                  projectManagerName: project.projectManagerName,
                  projectManagerProfile: project.projectManagerProfile,
                  projectManagerUserId: project.projectManagerUserId,
                  projectMembers: project.projectMembers,
                  projectName: project.projectName,
                  projectOwner: project.projectOwner,
                  projectOwnerName: project.projectOwnerName,
                  projectOwnerProfile: project.projectOwnerProfile,
                  projectOwnerUserId: project.projectOwnerUserId,
                  projectStatus: project.projectStatus,
                  projectType: project.projectType,
                  startDate: project.startDate,
              };
          }
      });
      try{
        const payload ={
          projectName: values.project,
          taskName: values.task,
          assignerId: userId,
          startDate: values.startDate,
          estimatedEndDate: values.endDate,
          taskDescription: values.description,
          employeeIds: values.members
        }
        if(record!==null){
          const edit_payload={
            taskId: record.taskId,
            projectName: values.project,
            taskName: values.task,
            assignerId: userId,
            startDate: values.startDate,
            estimatedEndDate: values.endDate,
            taskDescription: values.description,
            employeeIds: values.members
          }
          const responses = await api.put('/api/v1/task/edit-task-by-manager', edit_payload);
          if (responses.status === 200) {
            notification.success({
              message:response?.data?.response?.action,
              description:response?.data?.message,
            })
            navigate('/manager/taskassigntable')
            setSubmitting(true);
            resetForm();
          } 
        } else{
          const responses = await api.post('/api/v1/task/create-task', payload);
          if (responses.status === 200) {
            notification.success({
              message:response?.data?.response?.action,
              description:response?.data?.message,
            })
            navigate('/manager/taskassigntable')
            setSubmitting(true);
            resetForm();
          } 
        }
      }
      catch (error:any) {
        setSubmitting(false);
        console.error('Error adding/editing task:', error);
        notification.error({
          message:error?.response?.data?.response?.action,
          description: error?.response?.data?.message
        })
      }
    }
      
      const handleClearForm = (resetForm:any) => {
        resetForm(); 
      };

      const validationSchema = yup.object().shape({
        members: yup.array().min(1, 'Members are required'),  
        task: yup.string().required('Task is required'),
        project: yup.string().required('Project is Required'),
        startDate: yup.string().required('Start Date is required'),
        endDate: yup.string()
          .required('End Date is required')
          .test(
            'is-greater',
            'End Date must be greater than Start Date',
            function (value) {
              const { startDate } = this.parent;
              return value && startDate && value > startDate;
            }
          ),  
          description: yup.string().required('Description is required'),
      });
  return (
    <ConfigProvider theme={config}>
      <div className='createuser-main' style={{overflow:'hidden'}}>
        <div className='header' style={{display:'flex', flexDirection:'column'}}>
          <div>
            <h1><ArrowLeftOutlined style={{ marginRight: '10px' }} onClick={()=>{navigate('/manager/taskassigntable')}} />Task Assign</h1>
          </div>
          <div>
            <Formik
              initialValues={initialValue}
              validationSchema={validationSchema}
              onSubmit={handleFormSubmit}
              enableReinitialize={true}
            >
            {({
              
              values,
              handleChange,
              setFieldValue,
              setFieldTouched,
              handleBlur,
              handleSubmit,
              errors,
              isSubmitting,
              resetForm
            }) => 
          { console.log("values",values,errors)
            return (  
              <Form name='basic' layout='vertical' autoComplete='off' onFinish={handleSubmit}>
                <div>
                  <div style={{display:'flex', marginLeft:'10px'}}>
                    <div>
                      <div style={{display:'flex'}}>
                        <Form.Item
                            label="Project"
                            className="label-strong"
                            name="project"
                            required
                            style={{ padding: "10px" }}
                            >
                            <Select
                                style={{
                                height: "50px",
                                width: "470px",
                                borderRadius: "4px",
                                margin: "0px",
                                }}
                                value={values.project}
                                onChange={(value, option) => {
                                    handleEmployeeName(value)
                                    setFieldValue("members", []); 
                                    setFieldValue("project", value); 
                                    
                                }}
                                onBlur={() => {
                                setFieldTouched("project", true); 
                                }}
                            >
                                <Select.Option value="" disabled>
                                Select the Project
                                </Select.Option>
                                {project.map((option, index) => (  
                                <Select.Option key={index} value={option.projectName}>
                                    {option.projectName}
                                </Select.Option>
                                ))}
                            </Select>
                        <div>
                            <Typography.Text
                            type="danger"
                            style={{ wordBreak: "break-word", textAlign: "left" }}
                            >
                            <ErrorMessage name="project" /> 
                            </Typography.Text>
                        </div>
                        </Form.Item>
                        <Form.Item<FieldType>
                          label="Task Name"
                          className="label-strong"
                          name="task"
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
                            name="task"
                            value={values.task}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <div>
                            <Typography.Text
                              type="danger"
                              style={{ wordBreak: "break-word", textAlign: "left" }}
                            >
                              <ErrorMessage name="task" /> 
                              
                            </Typography.Text>
                          </div>
                        </Form.Item>
                      </div>
                      <div style={{display:'flex'}}>
                        <Form.Item<FieldType>
                          label="Start Date"
                          className="label-strong"
                          name="startDate"
                          required
                          style={{ padding: "10px" }}
                        >
                          <DatePicker
                            style={{
                                height: "50px",
                                width: "470px",
                                borderRadius: "4px",
                                margin: "0px",
                            }}
                            format="YYYY-MM-DD"
                            value={values.startDate ? dayjs(values.startDate) : null} // Convert startDate to a Moment object if it exists
                            onChange={(date, dateString) => {
                                if (date) {
                                setFieldValue('startDate', date.format('YYYY-MM-DD')); // Use Moment's format method to get the date string
                                }
                            }}
                            onBlur={() => {
                                setFieldTouched("startDate", true); // Mark "workLocation" field as touched
                              }}
                            />
                            <div>
                            <Typography.Text
                                type="danger"
                                style={{ wordBreak: "break-word", textAlign: 'left' }}
                            >
                                <ErrorMessage name="date" />
                            </Typography.Text>
                            </div>
                        </Form.Item>
                        <Form.Item<FieldType>
                          label="End Date"
                          className="label-strong"
                          name="endDate"
                          required
                          style={{ padding: "10px" }}
                        >
                        <DatePicker
                            style={{
                                height: "50px",
                                width: "470px",
                                borderRadius: "4px",
                                margin: "0px",
                            }}
                            format="YYYY-MM-DD"
                            value={values.endDate?dayjs(values.endDate): null}                 
                            onChange={(date, dateString) => {
                                if (date) {
                                setFieldValue('endDate', dayjs(dateString).format('YYYY-MM-DD'));
                                }
                            }}
                            onBlur={() => {
                                setFieldTouched("endDate", true); // Mark "workLocation" field as touched
                              }}
                            />
                          <div>
                            <Typography.Text
                              type="danger"
                              style={{ wordBreak: "break-word", textAlign: "left" }}
                            >
                              <ErrorMessage name="endDate" /> {/* Adjusted to use "workLocation" */}
                            </Typography.Text>
                          </div>
                        </Form.Item>
                      </div>
                      <div style={{display:'flex'}}>
                      <Form.Item
    label="Employee"
    className="label-strong"
    name="members"
    required
    style={{ padding: "10px" }}
>
    <Select
        mode="multiple"
        style={{
            height: "50px",
            width: "960px",
            borderRadius: "4px",
            margin: "0px",
        }}
        defaultValue={(record!==null)? record.employees.map((emp:any)=>emp.employeeId): null}
        value={values.members} // Control the value based on Formik values
        onChange={(value, option) => {
            setFieldValue("members", value);
        }}
        onBlur={() => {
            setFieldTouched("members", true);
        }}
        maxTagCount={6} // Display up to 6 selected options
        maxTagPlaceholder={(omittedValues) => (
            <div title={`${omittedValues.length} more items`}>
                {`+ ${omittedValues.length} more`}
            </div>
        )}
    >
        {/* <Select.Option value="" disabled>
            Select the Employee
        </Select.Option> */}
        {employee.map((option, index) => (
                <Select.Option key={index} value={option.employeeId}>
                    {option.employeeName}
                </Select.Option>
            ))
        }
    </Select>
    <div>
        <Typography.Text
            type="danger"
            style={{ wordBreak: "break-word", textAlign: "left" }}
        >
            <ErrorMessage name="members" />
        </Typography.Text>
    </div>
</Form.Item>



                      </div>
                      <div style={{display:'flex'}}>
                        <Form.Item<FieldType>
                          label="Description"
                          className="label-strong"
                          name="description"
                          required
                          style={{ padding: "10px" }}
                        >
                          <TextArea
                            style={{
                              height: "150px",
                              width: "960px",
                              borderRadius: "4px",
                              margin: "0px",
                            }}
                            name="description"
                            value={values.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <div>
                            <Typography.Text
                              type="danger"
                              style={{ wordBreak: "break-word", textAlign:'left' }}
                            >
                              <ErrorMessage name="description" />
                            </Typography.Text>
                          </div>
                        </Form.Item>
                      </div>
                      <div style={{display:'flex', marginLeft:'760px'}}>
                        <Form.Item>
                          <Button
                            //type="primary"
                            htmlType="button"
                            style={{ width: "100px", height: "41px", cursor: 'pointer'}}
                            className="Button"
                            id='cancel-addTask'
                            onClick={() => handleClearForm(resetForm)}
                            //disabled={selectedKeysToHide.includes(values.date)} // Disable if currentDate is in selectedKeysToHide
                          >
                            Clear
                          </Button>
                        </Form.Item>
                          <Form.Item>
                            <Button
                              type="primary"
                              htmlType="submit"
                              style={{ width: "100%", height: "41px" , marginLeft:'10px', cursor: 'pointer'}}
                              className="Button"
                              //disabled={isSubmitting || selectedKeysToHide.includes(values.date) || Object.keys(errors).length > 0 } // Disable if submitting, date is in selectedKeysToHide, or there are form errors
                              //title={selectedKeysToHide.includes(values.date) ? 'Approved date should not have the access to add the task' :  Object.keys(errors).length > 0 ? 'Kindly fill all the required fields':''}
                            >
                              {isSubmitting ? 'Submitting...' : record? 'Save':'Assign Task'}
                            </Button>
                          </Form.Item>
                        
                      </div>
                    </div>
                    {/* <div style={{display:'flex', alignItems:'center'}}>
                    
                      <div className='chart-container' style={{ marginLeft: "150px",width:'750px'}}>
                      <h2>Task Percentage</h2>
                        <Chart
                            options={pieChartDataInForm.options}
                            series={pieChartDataInForm.series}
                            type="pie"
                            width="480"
                        />
                      </div>
                    </div> */}
                  </div>
                </div>

            </Form>
            )}
            }  
            </Formik>
          </div>
          
        </div>
      </div>
    </ConfigProvider>
  )
}

export default TaskAssign