/**
 * 环境参考图生成Agent
 * 功能：输入环境信息文本，为每个场景生成对应的参考图
 * 输出场景名称和对应图片本地路径的映射表
 */
import { saveImageToFile } from '../utils/fileUtils.js';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

/**
 * 生成所有场景的环境参考图
 * @param {string} envInfoText Markdown格式的环境信息文本
 * @returns {object} 场景名→本地图片路径的映射表
 */
export const 环境参考图生成Agent = async (envInfoText) => {
  // 解析Markdown格式的环境信息，提取每个场景的名称和描述
  const scenes = parseEnvInfo(envInfoText);
  const sceneRefs = {};

  // 遍历每个场景，依次生成参考图
  for (const scene of scenes) {
    // ==============================================
    // 【核心提示词：场景参考图生成规则】
    // 功能：生成每个场景的参考图，匹配剧情氛围
    // ==============================================
    const prompt = `${scene.desc}，国漫二次元风格，电影级质感，光线自然，细节拉满，8K超高清 --no 模糊，扭曲，多余人物，水印`;
    // 调用生图API生成图片
    const imageUrl = await callImageGenModel(prompt);
    // 保存图片到本地assets目录
    const savePath = `./assets/scenes/${scene.name}_参考图.png`;
    await saveImageToFile(imageUrl, savePath);
    sceneRefs[scene.name] = savePath;
  }

  return sceneRefs;
};

/**
 * 解析Markdown格式的环境信息文本，提取每个场景的名称和描述
 * @param {string} envInfoText 输入的环境信息文本
 * @returns {Array} 场景对象数组，包含name和desc字段
 */
const parseEnvInfo = (envInfoText) => {
  // 提取所有以数字开头的场景行
  const lines = envInfoText.split('\n').filter(line => /^\d+\./.test(line.trim()));
  return lines.map(line => {
    const lineTrim = line.trim().replace(/^\d+\.\s*/, '');
    const [namePart, desc] = lineTrim.split('：');
    return {
      name: namePart.trim(),
      desc: desc.trim()
    };
  });
};

/**
 * 生图模型调用工具，对接火山豆包Seedream生图模型
 * @param {string} prompt 生图提示词
 * @returns {string} 生成的图片URL
 */
const callImageGenModel = async (prompt) => {
  console.log(`[生图调用] 生成环境参考图，提示词前50字：${prompt.slice(0, 50)}...`);
  // 构造输入参数，指定图片尺寸为横版适合场景图，像素满足模型最低要求
  const input = JSON.stringify({ prompt, size: "2560x1440" });
  // 调用Python脚本调用火山生图API
  const { stdout } = await execAsync(`echo '${input.replace(/'/g, "'\\''")}' | python3 ./utils/volc_image_gen.py`);
  const result = JSON.parse(stdout);
  if (result.url.startsWith('Error:')) {
    throw new Error(`生图调用失败: ${result.url}`);
  }
  return result.url;
};
