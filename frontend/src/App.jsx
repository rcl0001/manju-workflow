import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Typography, Steps } from 'antd';
import { FileTextOutlined, UserOutlined, EnvironmentOutlined, VideoCameraOutlined, PlayCircleOutlined, CheckOutlined } from '@ant-design/icons';
import Step1_NovelInput from './pages/Step1_NovelInput';
import Step2_ScriptEdit from './pages/Step2_ScriptEdit';
import Step3_CharPreview from './pages/Step3_CharPreview';
import Step4_ScenePreview from './pages/Step4_ScenePreview';
import Step5_PromptEdit from './pages/Step5_PromptEdit';
import Step6_Result from './pages/Step6_Result';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

// 步骤配置
const steps = [
  { title: '输入小说', icon: <FileTextOutlined /> },
  { title: '生成剧本', icon: <FileTextOutlined /> },
  { title: '生成角色', icon: <UserOutlined /> },
  { title: '生成场景', icon: <EnvironmentOutlined /> },
  { title: '生成视频', icon: <PlayCircleOutlined /> },
  { title: '完成', icon: <CheckOutlined /> },
];

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Title level={3} style={{ margin: 0, lineHeight: '64px' }}>🎬 漫剧自动生成工作台</Title>
            <Steps
              current={window.location.pathname === '/' ? 0 : 
                      window.location.pathname === '/step2' ? 1 :
                      window.location.pathname === '/step3' ? 2 :
                      window.location.pathname === '/step4' ? 3 :
                      window.location.pathname === '/step5' ? 4 : 5}
              items={steps}
              style={{ width: 700 }}
            />
          </div>
        </Header>
        <Content>
          <Routes>
            <Route path="/" element={<Step1_NovelInput />} />
            <Route path="/step2" element={<Step2_ScriptEdit />} />
            <Route path="/step3" element={<Step3_CharPreview />} />
            <Route path="/step4" element={<Step4_ScenePreview />} />
            <Route path="/step5" element={<Step5_PromptEdit />} />
            <Route path="/result" element={<Step6_Result />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
