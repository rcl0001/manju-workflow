/**
 * 角色三视图生成Agent
 * 功能：输入角色信息文本，为每个角色生成对应的三视图参考图
 * 输出角色名称和对应图片本地路径的映射表
 */
import { saveImageToFile } from '../utils/fileUtils.js';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

/**
 * 生成所有角色的三视图参考图
 * @param {string} roleInfoText Markdown格式的角色信息文本
 * @returns {object} 角色名→本地图片路径的映射表
 */
export const 角色三视图生成Agent = async (roleInfoText) => {
  // 解析Markdown格式的角色信息，提取每个角色的名称和描述
  const roles = parseRoleInfo(roleInfoText);
  const charRefs = {};

  // 遍历每个角色，依次生成三视图
  for (const role of roles) {
    // ==============================================
    // 【核心提示词：角色三视图生成规则】
    // 功能：生成每个角色的正面/侧面/背面三视图，统一画风
    // ==============================================
    const prompt = `${role.desc}，三视图，正面+侧面+背面，同一人物，国漫二次元风格，8K超高清，纯白背景，无多余内容 --no 扭曲，畸形，脸崩，多余人物`;
    // 调用生图API生成图片
    const imageUrl = await callImageGenModel(prompt);
    // 保存图片到本地assets目录
    const savePath = `./assets/chars/${role.name}_三视图.png`;
    await saveImageToFile(imageUrl, savePath);
    charRefs[role.name] = savePath;
  }

  return charRefs;
};

/**
 * 解析Markdown格式的角色信息文本，提取每个角色的名称和描述
 * @param {string} roleInfoText 输入的角色信息文本
 * @returns {Array} 角色对象数组，包含name和desc字段
 */
const parseRoleInfo = (roleInfoText) => {
  // 提取所有以数字开头的角色行
  const lines = roleInfoText.split('\n').filter(line => /^\d+\./.test(line.trim()));
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
  console.log(`[生图调用] 生成角色三视图，提示词前50字：${prompt.slice(0, 50)}...`);
  // 构造输入参数，指定图片尺寸为竖版适合三视图，像素满足模型最低要求
  const input = JSON.stringify({ prompt, size: "1440x2560" });
  // 调用Python脚本调用火山生图API
  const { stdout } = await execAsync(`echo '${input.replace(/'/g, "'\\''")}' | python3 ./utils/volc_image_gen.py`);
  const result = JSON.parse(stdout);
  if (result.url.startsWith('Error:')) {
    throw new Error(`生图调用失败: ${result.url}`);
  }
  return result.url;
};
