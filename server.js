import express from 'express';
import cors from 'cors';
import { runManjuWorkflow } from './main.js';
import { 剧本生成Agent } from './agents/1_剧本生成Agent.js';
import { 角色三视图生成Agent } from './agents/2_角色三视图生成Agent.js';
import { 环境参考图生成Agent } from './agents/3_环境参考图生成Agent.js';
import { 视频提示词生成Agent } from './agents/4_视频提示词生成Agent.js';
import { 视频生成Agent } from './agents/5_视频生成Agent.js';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 34567;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/assets', express.static('assets'));

// 全局状态
let generationStatus = {
  status: 'idle', // idle | running | success | failed
  progress: 0,
  currentStep: '',
  error: null,
  result: {}
};

/**
 * 启动生成流程
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { novelText } = req.body;
    
    if (!novelText) {
      return res.status(400).json({ error: '请输入小说内容' });
    }

    // 重置状态
    generationStatus = {
      status: 'running',
      progress: 0,
      currentStep: '准备启动生成流程',
      error: null,
      result: {}
    };

    // 异步执行生成流程，不阻塞接口
    (async () => {
      try {
        // 重写console.log来捕获进度
        const originalLog = console.log;
        console.log = (...args) => {
          originalLog(...args);
          const logText = args.join(' ');
          
          // 更新进度
          if (logText.includes('Step1/5')) {
            generationStatus.progress = 10;
            generationStatus.currentStep = '生成结构化剧本';
          } else if (logText.includes('Step2/5')) {
            generationStatus.progress = 30;
            generationStatus.currentStep = '生成角色三视图';
          } else if (logText.includes('Step3/5')) {
            generationStatus.progress = 50;
            generationStatus.currentStep = '生成环境参考图';
          } else if (logText.includes('Step4/5')) {
            generationStatus.progress = 70;
            generationStatus.currentStep = '生成视频提示词';
          } else if (logText.includes('Step5/5')) {
            generationStatus.progress = 90;
            generationStatus.currentStep = '生成最终漫剧视频';
          } else if (logText.includes('漫剧生成完成')) {
            generationStatus.progress = 100;
            generationStatus.currentStep = '生成完成';
          }
        };

        // 运行工作流
        const finalVideoPath = await runManjuWorkflow(novelText);
        
        // 恢复原console.log
        console.log = originalLog;

        // 读取所有中间结果
        const [script, charRefs, sceneRefs, videoPrompts] = await Promise.all([
          fs.readFile('./assets/step1_script.json', 'utf-8'),
          fs.readFile('./assets/step2_char_refs.json', 'utf-8'),
          fs.readFile('./assets/step3_scene_refs.json', 'utf-8'),
          fs.readFile('./assets/step4_video_prompts.json', 'utf-8')
        ]);

        generationStatus.status = 'success';
        generationStatus.result = {
          script: JSON.parse(script),
          charRefs: JSON.parse(charRefs),
          sceneRefs: JSON.parse(sceneRefs),
          videoPrompts: JSON.parse(videoPrompts),
          finalVideo: finalVideoPath
        };

      } catch (err) {
        generationStatus.status = 'failed';
        generationStatus.error = err.message;
        console.error(err);
      }
    })();

    res.json({ success: true, message: '生成任务已启动' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 获取生成状态
 */
app.get('/api/status', (req, res) => {
  res.json(generationStatus);
});

/**
 * 获取所有生成的角色图
 */
app.get('/api/chars', async (req, res) => {
  try {
    const files = await fs.readdir('./assets/chars');
    const charImages = files.filter(f => f.endsWith('.png')).map(f => `/assets/chars/${f}`);
    res.json(charImages);
  } catch (err) {
    res.json([]);
  }
});

/**
 * 获取所有生成的场景图
 */
app.get('/api/scenes', async (req, res) => {
  try {
    const files = await fs.readdir('./assets/scenes');
    const sceneImages = files.filter(f => f.endsWith('.png')).map(f => `/assets/scenes/${f}`);
    res.json(sceneImages);
  } catch (err) {
    res.json([]);
  }
});

/**
 * 获取所有生成的视频
 */
app.get('/api/videos', async (req, res) => {
  try {
    const files = await fs.readdir('./assets/videos');
    const videos = files.filter(f => f.endsWith('.mp4')).map(f => `/assets/videos/${f}`);
    res.json(videos);
  } catch (err) {
    res.json([]);
  }
});

/**
 * 更新指定Agent的提示词
 */
app.post('/api/update-prompt', async (req, res) => {
  try {
    const { agentName, newPrompt } = req.body;
    const agentPath = `./agents/${agentName}.js`;
    
    let content = await fs.readFile(agentPath, 'utf-8');
    
    // 替换提示词部分（假设提示词在const prompt = `...` 块里）
    const promptRegex = /const prompt = `([\s\S]*?)`;/;
    const match = content.match(promptRegex);
    
    if (match) {
      content = content.replace(match[0], `const prompt = \`${newPrompt}\`;`);
      await fs.writeFile(agentPath, content, 'utf-8');
      res.json({ success: true, message: '提示词更新成功' });
    } else {
      res.status(400).json({ error: '未找到提示词部分' });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 分步接口：生成剧本
 */
app.post('/api/generate/script', async (req, res) => {
  try {
    const { novelText } = req.body;
    const fullScript = await 剧本生成Agent(novelText);
    
    // 拆分剧本
    const splitScript = (fullScript) => {
      const parts = fullScript.split('### ');
      const roleInfoPart = (parts.find(p => p.startsWith('角色信息')) || '').replace('角色信息\n', '').trim();
      const envInfoPart = (parts.find(p => p.startsWith('环境信息')) || '').replace('环境信息\n', '').trim();
      const scriptContentPart = (parts.find(p => p.startsWith('剧本内容')) || '').replace('剧本内容\n', '').trim();
      return { roleInfo: roleInfoPart, envInfo: envInfoPart, scriptContent: scriptContentPart };
    };

    const script = splitScript(fullScript);
    // 保存中间结果
    await fs.writeFile('./assets/step1_script.json', JSON.stringify(script, null, 2), 'utf-8');
    
    res.json({ success: true, script });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 分步接口：生成角色三视图
 */
app.post('/api/generate/chars', async (req, res) => {
  try {
    const { roleInfo } = req.body;
    const charRefs = await 角色三视图生成Agent(roleInfo);
    await fs.writeFile('./assets/step2_char_refs.json', JSON.stringify(charRefs, null, 2), 'utf-8');
    res.json({ success: true, charRefs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 分步接口：生成场景参考图
 */
app.post('/api/generate/scenes', async (req, res) => {
  try {
    const { envInfo } = req.body;
    const sceneRefs = await 环境参考图生成Agent(envInfo);
    await fs.writeFile('./assets/step3_scene_refs.json', JSON.stringify(sceneRefs, null, 2), 'utf-8');
    res.json({ success: true, sceneRefs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 分步接口：生成视频提示词
 */
app.post('/api/generate/prompts', async (req, res) => {
  try {
    const { scriptContent, charRefs, sceneRefs } = req.body;
    const videoPrompts = await 视频提示词生成Agent(scriptContent, charRefs, sceneRefs);
    await fs.writeFile('./assets/step4_video_prompts.json', JSON.stringify(videoPrompts, null, 2), 'utf-8');
    res.json({ success: true, videoPrompts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 分步接口：生成视频
 */
app.post('/api/generate/video', async (req, res) => {
  try {
    const { videoPrompts } = req.body;
    const finalVideoPath = await 视频生成Agent(videoPrompts);
    res.json({ success: true, finalVideo: finalVideoPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 后端服务已启动，端口：${PORT}`);
  console.log(`🌐 前端访问地址：http://localhost:5173`);
});
