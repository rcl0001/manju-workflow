import { useState } from 'react';
import { Card, Input, Button, Typography, Space, message } from 'antd';
import { FileTextOutlined, RightOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const API_BASE = 'http://localhost:34567/api';

function Step1_NovelInput() {
  const navigate = useNavigate();
  const [novelText, setNovelText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateScript = async () => {
    if (!novelText.trim()) {
      message.error('请输入小说内容');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/generate/script`, { novelText });
      message.success('剧本生成成功！');
      // 跳转到下一步，把结果带过去
      navigate('/step2', { state: { script: res.data.script, novelText } });
    } catch (err) {
      message.error('生成失败：' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
      <Title level={2} style={{ marginBottom: 32 }}>
        <FileTextOutlined /> 步骤1：输入小说内容，生成结构化剧本
      </Title>

      <Card>
        <Paragraph style={{ marginBottom: 16 }}>
          请粘贴你想要转换为漫剧的小说内容，系统会自动分析并生成结构化剧本，包含角色信息、环境信息和分镜剧本。
        </Paragraph>

        <TextArea
          rows={20}
          placeholder="请粘贴小说内容..."
          value={novelText}
          onChange={(e) => setNovelText(e.target.value)}
          style={{ marginBottom: 24 }}
        />

        <Space>
          <Button
            type="primary"
            size="large"
            icon={<RightOutlined />}
            onClick={handleGenerateScript}
            loading={loading}
          >
            下一步：生成剧本
          </Button>
        </Space>
      </Card>
    </div>
  );
}

export default Step1_NovelInput;
