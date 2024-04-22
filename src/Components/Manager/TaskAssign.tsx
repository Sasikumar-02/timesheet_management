import React, {useState, useEffect} from 'react'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs';
import TextArea from 'antd/es/input/TextArea';
import { Input, TimePicker, Select, notification, DatePicker, Button, Modal, Col,
    ConfigProvider,
    Form,
    Row,
    Typography,
    message,} from 'antd';
  import * as yup from "yup";
  import { ErrorMessage, Formik, FormikFormProps, FormikHelpers, Field } from "formik";
import api from '../../Api/Api-Service';
import { DecodedToken } from '../Employee/EmployeeTaskStatus';
import { jwtDecode } from 'jwt-decode';
  type FieldType={
    members?:Array<any>;
    task?: string;
    project?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }

  interface Employee {
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
const TaskAssign = () => {
    const [initialValue, setInitialValue] = useState<any>({
                members: [],
                task: '',
                project: '',
                startDate: '',
                endDate: '',
                description: '',
    });
    const [project, setProject] = useState<ProjectDetails[]>([]);
    const [employee, setEmployee]= useState<Employee[]>([
    {
        employeeName:"Other"
    }
    ])
    const token = localStorage.getItem("authToken");
    const decoded = jwtDecode(token || "") as DecodedToken;
    const userId = decoded.UserId;
    console.log("employee-1", employee);
    console.log("project", project);

    useEffect(()=>{
        const fetchData=async()=>{
            try{
                const response = await api.get('/api/v1/employee/fetch-reporting-manager-users');
                console.log("allemployees", response.data.response.data);
            }
            catch(error){
                throw error;
            }
        }
        fetchData();
    },[])
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
            
            // Add "Other" project
            const otherProject: ProjectDetails = {
              active: false, // Example value
              createdOn: '', // Example value
              estimatedEndDate: '', // Example value
              projectCode: '', // Example value
              projectDescription: '', // Example value
              projectId: 'other', // Example value
              projectManager: '', // Example value
              projectManagerName: '', // Example value
              projectManagerProfile: '', // Example value
              projectManagerUserId: '', // Example value
              projectMembers: [], // Example value
              projectName: 'Other',
              projectOwner: '', // Example value
              projectOwnerName: '', // Example value
              projectOwnerProfile: '', // Example value
              projectOwnerUserId: '', // Example value
              projectStatus: '', // Example value
              projectType: '', // Example value
              startDate: '', // Example value
            };
            
            setProject([...projectsData, otherProject]);
            
            // Extract employee names
            let employeeNames: any[] = [];
            response.data.response.data.forEach((project: any) => {
              project.projectMembers.forEach((member: any) => {
                employeeNames.push(member.userName);
              });
            });
            setEmployee(employeeNames);
          } catch (error) {
            console.error('Error fetching projects:', error);
          }
        };
      
        fetchData();
      }, []);


    const handleFormSubmit=()=>{

    }

    const handleClearForm = (resetForm:any) => {
        resetForm(); // Reset the form to its initial values
      };

    const columns: ColumnsType<any> = [
        {
          title: 'Sl. No',
          width: '132px',
          dataIndex: 'slNo',
          key: 'slNo',
          fixed: 'left',
          //render: (text, record, index) => index + 1,
        },
        {
          title: 'Date',
          // sorter: (a: Task, b: Task) => a.date.localeCompare(b.date),
          dataIndex: 'date',
          key: 'date',
          fixed: 'left',
        },
        {
          title: 'Work Location',
          //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
          dataIndex: 'workLocation',
          key: 'workLocation',
          fixed: 'left',
        },
        {
          title: 'Task',
          //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
          dataIndex: 'task',
          key: 'task',
          fixed: 'left',
        },
        {
          title: 'Project',
          //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
          dataIndex: 'project',
          key: 'project',
          fixed: 'left',
        },
        {
          title: 'Start Time',
          //sorter: (a: Task, b: Task) => a.startTime.localeCompare(b.startTime),
          dataIndex: 'startTime',
          key: 'startTime',
          fixed: 'left',
        //   render: (_, record) => {
        //     return (
        //       <div>
        //           {hoursTimeToHoursMinutes(record?.startTime)}
        //       </div>
        //     );
        // }
        },
        {
          title: 'End Time',
          //sorter: (a: Task, b: Task) => a.endTime.localeCompare(b.endTime),
          dataIndex: 'endTime',
          key: 'endTime',
          fixed: 'left',
        //   render: (_, record) => {
        //     return (
        //       <div>
        //           {hoursTimeToHoursMinutes(record?.endTime)}
        //       </div>
        //     );
        // }
        },
        {
          title: 'Total Hours',
          //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
          dataIndex: 'totalHours',
          key: 'totalHours',
          fixed: 'left',
        //   render: (_, record) => {
        //     return (
        //       <div>
        //           {hoursDecimalToHoursMinutes(record?.totalHours)}
        //       </div>
        //     );
        // }
        },
        {
          title: 'Description',
          //sorter: (a: Task, b: Task) => a.description.localeCompare(b.description),
          dataIndex: 'description',
          key: 'description',
          fixed: 'left',
        },
        {
          title: 'Reporting To',
          //sorter: (a: Task, b: Task) => a.reportingTo.localeCompare(b.reportingTo),
          dataIndex: 'reportingToName',
          key: 'reportingToName',
          fixed: 'left',
        }, 
        {
          title: 'Status',
          //sorter: (a: Task, b: Task) => a.reportingTo.localeCompare(b.reportingTo),
          dataIndex: 'taskStatus',
          key: 'taskStatus',
          fixed: 'left',
        }, 
        {
          title: 'Actions',
          dataIndex: 'actions',
          key: 'actions',
        //   render: (_, record, index) => {
        //     // const isExistingTask = taskList.some(task => task.task_id === record?.task_id);
        //     const isDateSelected = selectedKeysToHide.includes(record?.date);
            
            
        //     // Filter tasks by userId
        //     //const userTasks = taskList.filter(task => task.userId === record?.userId);
            
        //     // Check if the user has tasks for the selected date
        //     //const hasUserTasksForDate = userTasks.some(task => task.date === record?.date);
        
        //     return (
        //       <div>
        //         <EditOutlined
        //           onClick={() => handleEditTask(record)}
        //           style={{
        //             marginRight: '8px',
        //             cursor: (isDateSelected ) ? 'not-allowed' : 'pointer', //|| !hasUserTasksForDate
        //             color: (isDateSelected ) ? 'grey' : 'blue', //|| !hasUserTasksForDate
        //             fontSize: '20px',
        //           }}
        //           disabled={isDateSelected } //|| !hasUserTasksForDate
        //         />
        //         <DeleteOutlined
        //           onClick={() => handleDeleteTask(record?.timeSheetId)}
        //           style={{
        //             cursor: (isDateSelected ) ? 'not-allowed' : 'pointer', //|| !hasUserTasksForDate
        //             color: (isDateSelected ) ? 'grey' : 'red', //|| !hasUserTasksForDate
        //             fontSize: '20px',
        //           }}
        //           disabled={isDateSelected } //|| !hasUserTasksForDate
        //         />
        //       </div>
        //     );
        //   },
        }    
        
          
      ]

      const validationSchema = yup.object().shape({
        members: yup.array().min(1, 'Members are required'), // Ensure at least one member is selected  
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
       { console.log(values,errors)
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
                        setFieldValue("project", value); // Update "workLocation" field value
                        }}
                        onBlur={() => {
                        setFieldTouched("project", true); // Mark "workLocation" field as touched
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
                        <ErrorMessage name="project" /> {/* Display error message if any */}
                        </Typography.Text>
                    </div>
                    </Form.Item>
                    <Form.Item<FieldType>
                      label="Task"
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
                          <ErrorMessage name="task" /> {/* Adjusted to use "workLocation" */}
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
                            mode="multiple" // Enable multiple selection mode
                            style={{
                            height: "50px",
                            width: "470px",
                            borderRadius: "4px",
                            margin: "0px",
                            }}
                            value={values.members}
                            onChange={(value, option) => {
                            setFieldValue("members", value); // Update "members" field value
                            }}
                            onBlur={() => {
                            setFieldTouched("members", true); // Mark "members" field as touched
                            }}
                        >
                            <Select.Option value="" disabled>
                            Select the Employee
                            </Select.Option>
                            {employee.map((option, index) => (
                            <Select.Option key={index} value={option.employeeName}> {/* Using Select.Option */}
                                {option.employeeName}
                            </Select.Option>
                            ))}
                        </Select>
                        <div>
                            <Typography.Text
                            type="danger"
                            style={{ wordBreak: "break-word", textAlign: "left" }}
                            >
                            <ErrorMessage name="members" /> {/* Display error message if any */}
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
                          {isSubmitting ? 'Submitting...' : 'Add Task'}
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
  )
}

export default TaskAssign