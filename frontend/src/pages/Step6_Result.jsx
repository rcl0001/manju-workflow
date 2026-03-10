import { useState, useEffect } from 'react';
import { Card, Image, List, Button, Typography, Space, Tabs } from 'antd';
import { HomeOutlined, RedoOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Paragraph } = Typography;

function Step6_Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { script, charRefs, sceneRefs, videoPrompts, finalVideo } = location.state || {};

  if (!finalVideo) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        <Title level={3}>还没有生成结果，请先完成前面的步骤</Title>
        <Button onClick={() => navigate('/')}>返回首页</Button>
      </div>
    );
  }

  // 转换图片URL
  const charImages = Object.values(charRefs).map(url => 
    url.startsWith('./') ? `http://localhost:34567${url.replace('.', '')}` : url
  );
  const sceneImages = Object.values(sceneRefs).map(url => 
    url.startsWith('./') ? `http://localhost:34567${url.replace('.', '')}` : url
  );
  const videoUrl = finalVideo.startsWith('./') ? `http://localhost:34567${finalVideo.replace('.', '')}` : finalVideo;

  const tabItems = [
    {
      key: 'video',
      label: '🎬 最终漫剧',
      children: (
        <Card>
          <video controls width="100%" src={videoUrl} style={{ marginBottom: 16 }} />
          <Paragraph>所有视频片段已生成完成，你可以下载或继续调整参数重新生成。</Paragraph>
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
              <Card hoverable>
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
              <Card hoverable>
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
        <Card>
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
        <Button size="large" icon={<HomeOutlined />} onClick={() => navigate('/')}>
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
