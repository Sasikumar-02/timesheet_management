import React ,{ReactNode} from 'react';
import { Layout, Flex } from 'antd';
import Headerbar from './Headerbar';
import Sidebar from './Sidebar';

const { Header, Sider, Content } = Layout;

interface DashboardLayoutProps{
  children:ReactNode;
}
const headerStyle: React.CSSProperties = {
    color: 'black',
    height: 70,
    backgroundColor: '#E7ECF0',
    position:'fixed',
    right:0,
    left:200,
};

const contentStyle: React.CSSProperties = {
    textAlign: 'center',
    minHeight: 120,
    marginTop:70,
    marginLeft:200,
    // lineHeight: '120px',
    height:'calc(100vh - 70px)',
    color: 'black',
    backgroundColor: '#fff',
    borderTopLeftRadius: '20px',
    overflowY: 'auto', 
};

const siderStyle: React.CSSProperties = {
    width:'100px',
    marginTop:'5px',
    position:'fixed',
    textAlign: 'center',
    lineHeight: '70px',
    color: 'black',
    height:'100vh',
    backgroundColor: '#E7ECF0',
};


function DashboardLayout ({children} : DashboardLayoutProps) {
  return(
 <> 
 <Flex gap="middle" wrap="wrap">
    <Layout>
      <Sider style={siderStyle}>
         <Sidebar /> 
      </Sider>
        <Layout>
        <Header style={headerStyle}>
             <Headerbar /> 
        </Header>
        <Content style={contentStyle}>
            {children}
        </Content>
      </Layout>
    </Layout>
  </Flex>
  </>
);
}

export default DashboardLayout;