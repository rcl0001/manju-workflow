import { useState } from 'react';
import { Card, Input, Button, Typography, Space, message, Tabs } from 'antd';
import { UserOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const API_BASE = 'http://localhost:34567/api';

function Step2_ScriptEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { script, novelText } = location.state || {};

  const [roleInfo, setRoleInfo] = useState(script?.roleInfo || '');
  const [envInfo, setEnvInfo] = useState(script?.envInfo || '');
  const [scriptContent, setScriptContent] = useState(script?.scriptContent || '');
  const [loading, setLoading] = useState(false);

  const handleGenerateChars = async () => {
    if (!roleInfo.trim()) {
      message.error('请输入角色信息');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/generate/chars`, { roleInfo });
      message.success('角色三视图生成成功！');
      // 跳转到下一步
      navigate('/step3', { 
        state: { 
          script: { roleInfo, envInfo, scriptContent },
          novelText,
          charRefs: res.data.charRefs 
        } 
      });
    } catch (err) {
      message.error('生成失败：' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!script) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        <Title level={3}>请先完成第一步，输入小说生成剧本</Title>
        <Button onClick={() => navigate('/')}>返回第一步</Button>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'role',
      label: '角色信息',
      children: (
        <TextArea
          rows={10}
          value={roleInfo}
          onChange={(e) => setRoleInfo(e.target.value)}
          placeholder="角色信息，包含每个角色的性别、年龄、身份、外貌描述"
        />
      )
    },
    {
      key: 'env',
      label: '环境信息',
      children: (
        <TextArea
          rows={10}
          value={envInfo}
          onChange={(e) => setEnvInfo(e.target.value)}
          placeholder="所有场景的环境描述，包含地点、物品、光影、氛围"
        />
      )
    },
    {
      key: 'script',
      label: '剧本内容',
      children: (
        <TextArea
          rows={20}
          value={scriptContent}
          onChange={(e) => setScriptContent(e.target.value)}
          placeholder="分镜剧本内容，包含每个场景的角色动作、台词、交互"
        />
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <Title level={2} style={{ marginBottom: 32 }}>
        <UserOutlined /> 步骤2：调整剧本，生成角色三视图
      </Title>

      <Card>
        <Paragraph style={{ marginBottom: 16 }}>
          你可以在这里修改自动生成的剧本内容，调整角色信息、环境信息和剧本内容，确认无误后生成角色三视图。
        </Paragraph>

        <Tabs defaultActiveKey="role" items={tabItems} style={{ marginBottom: 24 }} />

        <Space>
          <Button size="large" icon={<LeftOutlined />} onClick={() => navigate('/')}>
            返回上一步
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<RightOutlined />}
            onClick={handleGenerateChars}
            loading={loading}
          >
            下一步：生成角色三视图
          </Button>
        </Space>
      </Card>
    </div>
  );
}

export default Step2_ScriptEdit;
