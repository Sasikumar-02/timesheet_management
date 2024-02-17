// import React from 'react'
// import DashboardLayout from './Layout'
// import {
//     Avatar,
//     Space,
//     Button,
//     Table,
//     Modal,
//     Form,
//     Input,
//     Select,
//     ConfigProvider,
//     Tooltip,
//     Tag,
//     Popover,
//     message,
//     Checkbox,
//     Pagination,
//     Menu,
//     Dropdown,
//   } from "antd";
// const ModalRequest = ({content}) => {
//   return (
//     <DashboardLayout>
//         {content}
//         <div style={{display:'flex', justifyContent:'flex-end', margin:"10px 20px"}}>
//           <Button style={{width:'10%', backgroundColor:'green', color:'white'}} onClick={handleApprove}>Approve</Button>
//           <Button style={{ width: '10%', backgroundColor: 'red', color: 'white' }} onClick={handleReject}>
//             Reject
//           </Button>
//           <Modal
//             title="Comments"
//             className='modalTitle'
//             visible={commentVisible}
//             onCancel={handleCancel}
//             footer={[
//               // <Button key="cancel" onClick={handleCancel}>
//               //   Cancel
//               // </Button>,
//               <Button style={{ width: '20%', backgroundColor: '#0B4266', color: 'white' }} key="submit" type="primary" onClick={handleSubmit}>
//                 Submit
//               </Button>,
//             ]}
//           >
//             <Input.TextArea placeholder='Write here...' rows={4} value={comments} onChange={handleInputChange} />
//           </Modal>
//         </div>
//     </DashboardLayout>
//   )
// }

// export default ModalRequest

import React from 'react'

const ModalRequest = () => {
  return (
    <div>ModalRequest</div>
  )
}

export default ModalRequest