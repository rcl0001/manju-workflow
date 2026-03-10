import { useState, useEffect } from 'react';
import { Card, Image, List, Button, Typography, Space, message, Input, Spin, Alert } from 'antd';
import { EnvironmentOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const API_BASE = 'http://localhost:34567/api';

function Step3_CharPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { script, novelText } = location.state || {};

  const [envInfo, setEnvInfo] = useState(script?.envInfo || '');
  const [charRefs, setCharRefs] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(true);

  // 进入页面自动生成角色三视图
  useEffect(() => {
    if (!script?.roleInfo) {
      navigate('/step2');
      return;
    }

    const generateChars = async () => {
      try {
        const res = await axios.post(`${API_BASE}/generate/chars`, { roleInfo: script.roleInfo });
        setCharRefs(res.data.charRefs);
        message.success('角色三视图生成成功！你可以调整环境信息后继续下一步');
      } catch (err) {
        message.error('生成失败：' + err.response?.data?.error || err.message);
      } finally {
        setGenerating(false);
        setLoading(false);
      }
    };

    generateChars();
  }, [script, navigate]);

  const handleGenerateScenes = async () => {
    if (!envInfo.trim()) {
      message.error('请输入环境信息');
      return;
    }

    // 直接跳转到下一步，在下一步页面进行生成
    navigate('/step4', { 
      state: { 
        script,
        novelText,
        charRefs
      } 
    });
  };

  if (!script) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        <Title level={3}>请先完成第二步，生成剧本</Title>
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

      {generating ? (
        <Card className="glass-card" className="glass-card">
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: 24 }}>正在生成角色三视图，请稍候...</Title>
            <Paragraph>系统正在根据角色信息生成每个角色的三视图，大约需要30-60秒</Paragraph>
          </div>
        </Card>
      ) : (
        <>
          <Alert
            message="角色三视图生成成功！"
            description="你可以预览生成的角色图，调整环境信息后点击下一步生成场景参考图。"
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Card className="glass-card" className="glass-card" title="🎨 生成的角色三视图" style={{ marginBottom: 24 }}>
            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={charImages}
              renderItem={(item) => (
                <List.Item>
                  <Card className="glass-card" hoverable>
                    <Image src={item} />
                  </Card>
                </List.Item>
              )}
            />
          </Card>

          <Card className="glass-card" className="glass-card" title="🏞️ 调整环境信息">
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
        </>
      )}
    </div>
  );
}

export default Step3_CharPreview;
