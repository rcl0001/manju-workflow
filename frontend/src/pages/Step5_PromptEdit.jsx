import { useState } from 'react';
import { Card, List, Button, Typography, Space, message, Input } from 'antd';
import { PlayCircleOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const API_BASE = 'http://localhost:34567/api';

function Step5_PromptEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { script, novelText, charRefs, sceneRefs, videoPrompts } = location.state || {};

  const [prompts, setPrompts] = useState(videoPrompts || []);
  const [loading, setLoading] = useState(false);

  const handleGenerateVideo = async () => {
    if (prompts.length === 0) {
      message.error('请输入视频提示词');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/generate/video`, { 
        videoPrompts: prompts
      });
      message.success('视频生成成功！');
      // 跳转到结果页
      navigate('/result', { 
        state: { 
          script,
          novelText,
          charRefs,
          sceneRefs,
          videoPrompts: prompts,
          finalVideo: res.data.finalVideo
        } 
      });
    } catch (err) {
      message.error('生成失败：' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!videoPrompts) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        <Title level={3}>请先完成第四步，生成视频提示词</Title>
        <Button onClick={() => navigate('/step4')}>返回第四步</Button>
      </div>
    );
  }

  const updatePrompt = (index, newText) => {
    const newPrompts = [...prompts];
    newPrompts[index].prompt = newText;
    setPrompts(newPrompts);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <Title level={2} style={{ marginBottom: 32 }}>
        <PlayCircleOutlined /> 步骤5：调整视频提示词，生成最终漫剧
      </Title>

      <Card>
        <Paragraph style={{ marginBottom: 16 }}>
          你可以在这里调整每个视频片段的提示词，优化生成效果，确认无误后生成最终漫剧视频。
        </Paragraph>

        <List
          dataSource={prompts}
          style={{ marginBottom: 24 }}
          renderItem={(item, index) => (
            <List.Item key={index}>
              <Card className="glass-card" title={`镜头 ${index + 1}：${item.duration}s`}>
                <TextArea
                  rows={4}
                  value={item.prompt}
                  onChange={(e) => updatePrompt(index, e.target.value)}
                />
              </Card>
            </List.Item>
          )}
        />

        <Space>
          <Button size="large" icon={<LeftOutlined />} onClick={() => navigate('/step4')}>
            返回上一步
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={handleGenerateVideo}
            loading={loading}
          >
            生成最终漫剧视频
          </Button>
        </Space>
      </Card>
    </div>
  );
}

export default Step5_PromptEdit;
