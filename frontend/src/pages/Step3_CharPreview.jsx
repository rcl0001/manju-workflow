import { useState } from 'react';
import { Card, Image, List, Button, Typography, Space, message, Input } from 'antd';
import { EnvironmentOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const API_BASE = 'http://localhost:34567/api';

function Step3_CharPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { script, novelText, charRefs } = location.state || {};

  const [envInfo, setEnvInfo] = useState(script?.envInfo || '');
  const [loading, setLoading] = useState(false);

  const handleGenerateScenes = async () => {
    if (!envInfo.trim()) {
      message.error('请输入环境信息');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/generate/scenes`, { envInfo });
      message.success('场景参考图生成成功！');
      // 跳转到下一步
      navigate('/step4', { 
        state: { 
          script,
          novelText,
          charRefs,
          sceneRefs: res.data.sceneRefs 
        } 
      });
    } catch (err) {
      message.error('生成失败：' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!charRefs) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        <Title level={3}>请先完成第二步，生成角色三视图</Title>
        <Button onClick={() => navigate('/step2')}>返回第二步</Button>
      </div>
    );
  }

  // 把角色引用转为图片URL
  const charImages = Object.values(charRefs).map(url => 
    url.startsWith('./') ? `http://localhost:34567${url.replace('.', '')}` : url
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 20px' }}>
      <Title level={2} style={{ marginBottom: 32 }}>
        <EnvironmentOutlined /> 步骤3：预览角色，生成场景参考图
      </Title>

      <Card title="🎨 生成的角色三视图" style={{ marginBottom: 24 }}>
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={charImages}
          renderItem={(item) => (
            <List.Item>
              <Card hoverable>
                <Image src={item} />
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Card title="🏞️ 调整环境信息">
        <Paragraph style={{ marginBottom: 16 }}>
          你可以在这里调整环境信息，确认无误后生成对应的场景参考图。
        </Paragraph>

        <TextArea
          rows={10}
          value={envInfo}
          onChange={(e) => setEnvInfo(e.target.value)}
          placeholder="所有场景的环境描述，包含地点、物品、光影、氛围"
          style={{ marginBottom: 24 }}
        />

        <Space>
          <Button size="large" icon={<LeftOutlined />} onClick={() => navigate('/step2')}>
            返回上一步
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<RightOutlined />}
            onClick={handleGenerateScenes}
            loading={loading}
          >
            下一步：生成场景参考图
          </Button>
        </Space>
      </Card>
    </div>
  );
}

export default Step3_CharPreview;
