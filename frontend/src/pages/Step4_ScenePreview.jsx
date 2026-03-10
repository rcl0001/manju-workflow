import { useState, useEffect } from 'react';
import { Card, Image, List, Button, Typography, Space, message, Input, Spin, Alert } from 'antd';
import { VideoCameraOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { getData, saveData } from '../utils/storage';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const API_BASE = 'http://localhost:34567/api';

function Step4_ScenePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { script, novelText, charRefs } = location.state || {};

  const [scriptContent, setScriptContent] = useState(script?.scriptContent || '');
  const [sceneRefs, setSceneRefs] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(true);

  // 从localStorage恢复数据
  useEffect(() => {
    if (!script || !charRefs) {
      const savedScript = getData('manju_script');
      const savedNovelText = getData('manju_novelText', false);
      const savedCharRefs = getData('manju_charRefs');
      
      if (savedScript && savedNovelText && savedCharRefs) {
        // 恢复保存的数据
        location.state = {
          script: savedScript,
          novelText: savedNovelText,
          charRefs: savedCharRefs
        };
        setScriptContent(savedScript.scriptContent);
        window.location.reload();
        return;
      }
      // 没有数据跳回上一步
      message.error('请先完成角色生成步骤');
      navigate('/step3');
      return;
    }
    
    // 保存数据到localStorage
    saveData('manju_script', script);
    saveData('manju_novelText', novelText, false);
    saveData('manju_charRefs', charRefs);

    // 自动生成场景图
    const generateScenes = async () => {
      try {
        const res = await axios.post(`${API_BASE}/generate/scenes`, { envInfo: script.envInfo });
        setSceneRefs(res.data.sceneRefs);
        saveData('manju_sceneRefs', res.data.sceneRefs);
        message.success('场景参考图生成成功！你可以调整剧本内容后继续下一步');
      } catch (err) {
        message.error('生成失败：' + err.response?.data?.error || err.message);
      } finally {
        setGenerating(false);
        setLoading(false);
      }
    };

    generateScenes();
  }, [script, novelText, charRefs, navigate, location.state]);

  const handleGeneratePrompts = async () => {
    if (!scriptContent.trim()) {
      message.error('请输入剧本内容');
      return;
    }

    // 跳转到下一步
    navigate('/step5', { 
      state: { 
        script: { ...script, scriptContent },
        novelText,
        charRefs,
        sceneRefs
      } 
    });
  };

  // 把场景引用转为图片URL
  const sceneImages = Object.values(sceneRefs).map(url => 
    url.startsWith('./') ? `http://localhost:34567${url.replace('.', '')}` : url
  );

  if (!script || !charRefs) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        <Title level={3}>正在恢复数据，请稍候...</Title>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 20px' }}>
      <Title level={2} style={{ marginBottom: 32 }}>
        <VideoCameraOutlined /> 步骤4：预览场景，生成视频提示词
      </Title>

      {generating ? (
        <Card className="glass-card">
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: 24 }}>正在生成场景参考图，请稍候...</Title>
            <Paragraph>系统正在根据环境信息生成每个场景的参考图，大约需要30-60秒</Paragraph>
          </div>
        </Card>
      ) : (
        <>
          <Alert
            message="场景参考图生成成功！"
            description="你可以预览生成的场景图，调整剧本内容后点击下一步生成视频提示词。"
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Card className="glass-card" title="🏞️ 生成的场景参考图" style={{ marginBottom: 24 }}>
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

          <Card className="glass-card" title="✍️ 调整剧本内容">
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
        </>
      )}
    </div>
  );
}

export default Step4_ScenePreview;
