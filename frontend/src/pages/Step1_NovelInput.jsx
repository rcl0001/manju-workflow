import { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, message, Modal } from 'antd';
import { FileTextOutlined, RightOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { hasUnfinishedProgress, clearAllData, saveData } from '../utils/storage';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const API_BASE = 'http://localhost:34567/api';

function Step1_NovelInput() {
  const navigate = useNavigate();
  const [novelText, setNovelText] = useState('');
  const [loading, setLoading] = useState(false);

  // 检查是否有未完成的进度
  useEffect(() => {
    if (hasUnfinishedProgress()) {
      Modal.confirm({
        title: '检测到未完成的生成进度',
        icon: <WarningOutlined />,
        content: '你有之前未完成的生成任务，是否继续？',
        okText: '继续上次进度',
        cancelText: '重新开始',
        onOk: () => {
          navigate('/step2');
        },
        onCancel: () => {
          clearAllData();
          message.info('已清空旧的生成进度');
        }
      });
    }
  }, [navigate]);

  const handleGenerateScript = async () => {
    if (!novelText.trim()) {
      message.error('请输入小说内容');
      return;
    }

    // 先清空旧数据
    clearAllData();
    // 保存新的小说内容
    saveData('manju_novelText', novelText, false);
    // 直接跳转到下一步，在下一步页面进行生成
    navigate('/step2', { state: { novelText } });
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
      <Title level={2} style={{ marginBottom: 32 }}>
        <FileTextOutlined /> 步骤1：输入小说内容，生成结构化剧本
      </Title>

      <Card className="glass-card" className="glass-card">
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
