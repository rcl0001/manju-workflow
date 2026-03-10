import { useState } from 'react';
import { Card, Image, List, Button, Typography, Space, message, Input } from 'antd';
import { VideoCameraOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const API_BASE = 'http://localhost:34567/api';

function Step4_ScenePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { script, novelText, charRefs, sceneRefs } = location.state || {};

  const [scriptContent, setScriptContent] = useState(script?.scriptContent || '');
  const [loading, setLoading] = useState(false);

  const handleGeneratePrompts = async () => {
    if (!scriptContent.trim()) {
      message.error('请输入剧本内容');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/generate/prompts`, { 
        scriptContent,
        charRefs,
        sceneRefs
      });
      message.success('视频提示词生成成功！');
      // 跳转到下一步
      navigate('/step5', { 
        state: { 
          script,
          novelText,
          charRefs,
          sceneRefs,
          videoPrompts: res.data.videoPrompts
        } 
      });
    } catch (err) {
      message.error('生成失败：' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!sceneRefs) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        <Title level={3}>请先完成第三步，生成场景参考图</Title>
        <Button onClick={() => navigate('/step3')}>返回第三步</Button>
      </div>
    );
  }

  // 把场景引用转为图片URL
  const sceneImages = Object.values(sceneRefs).map(url => 
    url.startsWith('./') ? `http://localhost:34567${url.replace('.', '')}` : url
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 20px' }}>
      <Title level={2} style={{ marginBottom: 32 }}>
        <VideoCameraOutlined /> 步骤4：预览场景，生成视频提示词
      </Title>

      <Card title="🏞️ 生成的场景参考图" style={{ marginBottom: 24 }}>
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={sceneImages}
          renderItem={(item) => (
            <List.Item>
              <Card hoverable>
                <Image src={item} />
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Card title="✍️ 调整剧本内容">
        <Paragraph style={{ marginBottom: 16 }}>
          你可以在这里调整剧本内容，系统会根据剧本、角色和场景信息生成每个镜头的视频生成提示词。
        </Paragraph>

        <TextArea
          rows={15}
          value={scriptContent}
          onChange={(e) => setScriptContent(e.target.value)}
          placeholder="分镜剧本内容，包含每个场景的角色动作、台词、交互"
          style={{ marginBottom: 24 }}
        />

        <Space>
          <Button size="large" icon={<LeftOutlined />} onClick={() => navigate('/step3')}>
            返回上一步
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<RightOutlined />}
            onClick={handleGeneratePrompts}
            loading={loading}
          >
            下一步：生成视频提示词
          </Button>
        </Space>
      </Card>
    </div>
  );
}

export default Step4_ScenePreview;
