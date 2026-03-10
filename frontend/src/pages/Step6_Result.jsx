import { useState, useEffect } from 'react';
import { Card, Image, List, Button, Typography, Space, Tabs, Spin, Alert, message } from 'antd';
import { HomeOutlined, RedoOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { getData, saveData, clearAllData } from '../utils/storage';

const { Title, Paragraph } = Typography;
const API_BASE = 'http://localhost:34567/api';

function Step6_Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { script, charRefs, sceneRefs, videoPrompts } = location.state || {};

  const [finalVideo, setFinalVideo] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(true);

  // 从localStorage恢复数据
  useEffect(() => {
    if (!script || !charRefs || !sceneRefs || !videoPrompts) {
      const savedScript = getData('manju_script');
      const savedCharRefs = getData('manju_charRefs');
      const savedSceneRefs = getData('manju_sceneRefs');
      const savedVideoPrompts = getData('manju_videoPrompts');
      const savedFinalVideo = getData('manju_finalVideo', false);
      
      if (savedFinalVideo) {
        setFinalVideo(savedFinalVideo);
        setGenerating(false);
        setLoading(false);
        return;
      }
      
      if (savedScript && savedCharRefs && savedSceneRefs && savedVideoPrompts) {
        // 恢复保存的数据
        location.state = {
          script: savedScript,
          charRefs: savedCharRefs,
          sceneRefs: savedSceneRefs,
          videoPrompts: savedVideoPrompts
        };
        
        return;
      }
      // 没有数据跳回上一步
      message.error('请先完成视频提示词生成步骤');
      navigate('/step5');
      return;
    }
    
    // 自动生成视频
    const generateVideo = async () => {
      try {
        const res = await axios.post(`${API_BASE}/generate/video`, { 
          videoPrompts
        });
        setFinalVideo(res.data.finalVideo);
        saveData('manju_finalVideo', res.data.finalVideo, false);
        message.success('漫剧视频生成成功！');
      } catch (err) {
        message.error('生成失败：' + err.response?.data?.error || err.message);
      } finally {
        setGenerating(false);
        setLoading(false);
      }
    };

    generateVideo();
  }, [script, charRefs, sceneRefs, videoPrompts, navigate, location.state]);

  const handleRestart = () => {
    clearAllData();
    navigate('/');
  };

  // 转换图片URL
  const charImages = Object.values(charRefs || {}).map(url => 
    url.startsWith('./') ? `http://localhost:34567${url.replace('.', '')}` : url
  );
  const sceneImages = Object.values(sceneRefs || {}).map(url => 
    url.startsWith('./') ? `http://localhost:34567${url.replace('.', '')}` : url
  );
  const videoUrl = finalVideo.startsWith('./') ? `http://localhost:34567${finalVideo.replace('.', '')}` : finalVideo;

  if (!script || !charRefs || !sceneRefs || !videoPrompts) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        <Title level={3}>正在恢复数据，请稍候...</Title>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'video',
      label: '🎬 最终漫剧',
      children: (
        <Card className="glass-card">
          {generating ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Spin size="large" />
              <Title level={4} style={{ marginTop: 24 }}>正在生成最终漫剧视频，请稍候...</Title>
              <Paragraph>系统正在根据提示词生成漫剧视频，大约需要2-5分钟，请耐心等待</Paragraph>
            </div>
          ) : (
            <>
              <video controls width="100%" src={videoUrl} style={{ marginBottom: 16 }} />
              <Alert
                message="漫剧生成完成！"
                description="所有视频片段已生成完成，你可以下载或继续调整参数重新生成。"
                type="success"
                showIcon
              />
            </>
          )}
        </Card>
      )
    },
    {
      key: 'chars',
      label: '🎨 角色三视图',
      children: (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={charImages}
          renderItem={(item) => (
            <List.Item>
              <Card hoverable className="glass-card">
                <Image src={item} />
              </Card>
            </List.Item>
          )}
        />
      )
    },
    {
      key: 'scenes',
      label: '🏞️ 场景参考图',
      children: (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={sceneImages}
          renderItem={(item) => (
            <List.Item>
              <Card hoverable className="glass-card">
                <Image src={item} />
              </Card>
            </List.Item>
          )}
        />
      )
    },
    {
      key: 'script',
      label: '📝 剧本信息',
      children: (
        <Card className="glass-card">
          <Title level={4}>角色信息</Title>
          <Paragraph>{script.roleInfo}</Paragraph>
          <Title level={4}>环境信息</Title>
          <Paragraph>{script.envInfo}</Paragraph>
          <Title level={4}>剧本内容</Title>
          <Paragraph>{script.scriptContent}</Paragraph>
        </Card>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 20px' }}>
      <Title level={2} style={{ marginBottom: 32 }}>🎉 漫剧生成完成！</Title>

      <Tabs defaultActiveKey="video" items={tabItems} style={{ marginBottom: 24 }} />

      <Space>
        <Button size="large" icon={<HomeOutlined />} onClick={handleRestart}>
          重新开始
        </Button>
        <Button size="large" icon={<RedoOutlined />} onClick={() => navigate('/step5')}>
          调整提示词重新生成
        </Button>
      </Space>
    </div>
  );
}

export default Step6_Result;
