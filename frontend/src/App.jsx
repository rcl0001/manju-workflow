import { useState, useEffect } from 'react';
import { Layout, Input, Button, Card, Progress, Tabs, Image, List, Typography, Space, message, Drawer, Form, TextArea } from 'antd';
import { PlayCircleOutlined, EditOutlined, FileTextOutlined, UserOutlined, EnvironmentOutlined, VideoCameraOutlined, ApiOutlined } from '@ant-design/icons';
import axios from 'axios';
import './App.css';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea: AntdTextArea } = Input;

const API_BASE = 'http://localhost:34567/api';

function App() {
  const [novelText, setNovelText] = useState('');
  const [status, setStatus] = useState({ status: 'idle', progress: 0, currentStep: '' });
  const [chars, setChars] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [promptDrawerVisible, setPromptDrawerVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [promptText, setPromptText] = useState('');

  // 所有Agent列表
  const agents = [
    { name: '1_剧本生成Agent', label: '剧本生成Agent', desc: '负责将小说转换为结构化剧本' },
    { name: '2_角色三视图生成Agent', label: '角色三视图生成Agent', desc: '负责根据角色信息生成角色三视图' },
    { name: '3_环境参考图生成Agent', label: '环境参考图生成Agent', desc: '负责根据环境信息生成场景参考图' },
    { name: '4_视频提示词生成Agent', label: '视频提示词生成Agent', desc: '负责根据剧本内容生成视频生成提示词' },
    { name: '5_视频生成Agent', label: '视频生成Agent', desc: '负责根据提示词和参考图生成最终视频' },
  ];

  // 轮询状态
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/status`);
        setStatus(res.data);
        
        // 如果生成完成，刷新资源
        if (res.data.status === 'success') {
          loadResources();
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 加载资源
  const loadResources = async () => {
    try {
      const [charsRes, scenesRes, videosRes] = await Promise.all([
        axios.get(`${API_BASE}/chars`),
        axios.get(`${API_BASE}/scenes`),
        axios.get(`${API_BASE}/videos`),
      ]);
      setChars(charsRes.data);
      setScenes(scenesRes.data);
      setVideos(videosRes.data);
    } catch (err) {
      message.error('加载资源失败');
    }
  };

  // 启动生成
  const handleGenerate = async () => {
    if (!novelText.trim()) {
      message.error('请输入小说内容');
      return;
    }

    try {
      await axios.post(`${API_BASE}/generate`, { novelText });
      message.success('生成任务已启动，请等待完成');
    } catch (err) {
      message.error('启动生成失败：' + err.response?.data?.error || err.message);
    }
  };

  // 打开提示词编辑抽屉
  const openPromptEdit = async (agent) => {
    setSelectedAgent(agent.name);
    setPromptDrawerVisible(true);
    // 这里可以加读取当前提示词的逻辑
    setPromptText('');
  };

  // 保存提示词
  const savePrompt = async () => {
    try {
      await axios.post(`${API_BASE}/update-prompt`, {
        agentName: selectedAgent,
        newPrompt: promptText
      });
      message.success('提示词更新成功');
      setPromptDrawerVisible(false);
    } catch (err) {
      message.error('更新失败：' + err.response?.data?.error || err.message);
    }
  };

  const tabItems = [
    {
      key: 'script',
      label: <span><FileTextOutlined /> 剧本</span>,
      children: status.result?.script ? (
        <Card>
          <Title level={4}>角色信息</Title>
          <Paragraph>{status.result.script.roleInfo}</Paragraph>
          <Title level={4}>环境信息</Title>
          <Paragraph>{status.result.script.envInfo}</Paragraph>
          <Title level={4}>剧本内容</Title>
          <Paragraph>{status.result.script.scriptContent}</Paragraph>
        </Card>
      ) : <p>暂无剧本数据，请先运行生成流程</p>
    },
    {
      key: 'chars',
      label: <span><UserOutlined /> 角色三视图</span>,
      children: (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={chars}
          renderItem={(item) => (
            <List.Item>
              <Card hoverable>
                <Image src={`http://localhost:34567${item}`} />
              </Card>
            </List.Item>
          )}
        />
      )
    },
    {
      key: 'scenes',
      label: <span><EnvironmentOutlined /> 场景参考图</span>,
      children: (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={scenes}
          renderItem={(item) => (
            <List.Item>
              <Card hoverable>
                <Image src={`http://localhost:34567${item}`} />
              </Card>
            </List.Item>
          )}
        />
      )
    },
    {
      key: 'videos',
      label: <span><VideoCameraOutlined /> 生成视频</span>,
      children: (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={videos}
          renderItem={(item, index) => (
            <List.Item>
              <Card title={`视频片段 ${index + 1}`}>
                <video controls width="100%" src={`http://localhost:34567${item}`} />
              </Card>
            </List.Item>
          )}
        />
      )
    },
    {
      key: 'prompts',
      label: <span><ApiOutlined /> 提示词管理</span>,
      children: (
        <List
          dataSource={agents}
          renderItem={(item) => (
            <List.Item
              actions={[<Button type="link" icon={<EditOutlined />} onClick={() => openPromptEdit(item)}>编辑提示词</Button>]}
            >
              <List.Item.Meta
                title={item.label}
                description={item.desc}
              />
            </List.Item>
          )}
        />
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={3} style={{ margin: 0, lineHeight: '64px' }}>🎬 漫剧自动生成工作台</Title>
      </Header>
      <Layout>
        <Sider width={400} style={{ background: '#fff', padding: 24 }}>
          <Card title="📝 输入小说内容" bordered={false}>
            <AntdTextArea
              rows={18}
              placeholder="请粘贴你想要转换为漫剧的小说内容..."
              value={novelText}
              onChange={(e) => setNovelText(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Space direction="vertical" style={{ width: '100%' }}>
              {status.status === 'running' && (
                <div>
                  <Progress percent={status.progress} status="active" />
                  <p style={{ textAlign: 'center', marginTop: 8 }}>{status.currentStep}</p>
                </div>
              )}
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleGenerate}
                disabled={status.status === 'running'}
                block
              >
                {status.status === 'running' ? '生成中...' : '一键生成漫剧'}
              </Button>
            </Space>
          </Card>
        </Sider>
        <Content style={{ padding: 24 }}>
          <Tabs defaultActiveKey="script" items={tabItems} />
        </Content>
      </Layout>

      <Drawer
        title="编辑Agent提示词"
        width={700}
        open={promptDrawerVisible}
        onClose={() => setPromptDrawerVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setPromptDrawerVisible(false)}>取消</Button>
            <Button type="primary" onClick={savePrompt}>保存</Button>
          </Space>
        }
      >
        <Form layout="vertical">
          <Form.Item label="提示词内容">
            <TextArea
              rows={20}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="请输入新的提示词内容..."
            />
          </Form.Item>
        </Form>
      </Drawer>
    </Layout>
  );
}

export default App;
