import { useState, useEffect } from 'react';
import { Card, List, Button, Typography, Space, message, Input, Spin, Alert } from 'antd';
import { PlayCircleOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { getData, saveData } from '../utils/storage';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const API_BASE = 'http://localhost:34567/api';

function Step5_PromptEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { script, novelText, charRefs, sceneRefs } = location.state || {};

  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(true);

  // 从localStorage恢复数据
  useEffect(() => {
    if (!script || !charRefs || !sceneRefs) {
      const savedScript = getData('manju_script');
      const savedNovelText = getData('manju_novelText', false);
      const savedCharRefs = getData('manju_charRefs');
      const savedSceneRefs = getData('manju_sceneRefs');
      
      if (savedScript && savedNovelText && savedCharRefs && savedSceneRefs) {
        // 恢复保存的数据
        location.state = {
          script: savedScript,
          novelText: savedNovelText,
          charRefs: savedCharRefs,
          sceneRefs: savedSceneRefs
        };
        
        return;
      }
      // 没有数据跳回上一步
      message.error('请先完成场景生成步骤');
      navigate('/step4');
      return;
    }
    
    // 保存数据到localStorage
    saveData('manju_script', script);
    saveData('manju_novelText', novelText, false);
    saveData('manju_charRefs', charRefs);
    saveData('manju_sceneRefs', sceneRefs);

    // 自动生成视频提示词
    const generatePrompts = async () => {
      try {
        const res = await axios.post(`${API_BASE}/generate/prompts`, { 
          scriptContent: script.scriptContent,
          charRefs,
          sceneRefs
        });
        setPrompts(res.data.videoPrompts);
        saveData('manju_videoPrompts', res.data.videoPrompts);
        message.success('视频提示词生成成功！你可以调整每个镜头的提示词后生成视频');
      } catch (err) {
        message.error('生成失败：' + err.response?.data?.error || err.message);
      } finally {
        setGenerating(false);
        setLoading(false);
      }
    };

    generatePrompts();
  }, [script, novelText, charRefs, sceneRefs, navigate, location.state]);

  const handleGenerateVideo = async () => {
    if (prompts.length === 0) {
      message.error('请输入视频提示词');
      return;
    }

    // 跳转到结果页
    navigate('/result', { 
      state: { 
        script,
        novelText,
        charRefs,
        sceneRefs,
        videoPrompts: prompts
      } 
    });
  };

  const updatePrompt = (index, newText) => {
    const newPrompts = [...prompts];
    newPrompts[index].prompt = newText;
    setPrompts(newPrompts);
  };

  if (!script || !charRefs || !sceneRefs) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        <Title level={3}>正在恢复数据，请稍候...</Title>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <Title level={2} style={{ marginBottom: 32 }}>
        <PlayCircleOutlined /> 步骤5：调整视频提示词，生成最终漫剧
      </Title>

      {generating ? (
        <Card className="glass-card">
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: 24 }}>正在生成视频提示词，请稍候...</Title>
            <Paragraph>系统正在根据剧本内容生成每个镜头的视频提示词，大约需要10-20秒</Paragraph>
          </div>
        </Card>
      ) : (
        <>
          <Alert
            message="视频提示词生成成功！"
            description="你可以在这里调整每个视频片段的提示词，优化生成效果，确认无误后生成最终漫剧视频。"
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Card className="glass-card">
            <List
              dataSource={prompts}
              style={{ marginBottom: 24 }}
              renderItem={(item, index) => (
                <List.Item key={index}>
                  <Card title={`镜头 ${index + 1}：${item.duration}s`}>
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
        </>
      )}
    </div>
  );
}

export default Step5_PromptEdit;
