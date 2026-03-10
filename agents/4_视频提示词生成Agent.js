/**
 * 视频提示词生成Agent
 * 功能：输入剧本内容、角色参考图、场景参考图，生成每段视频的专用提示词
 * 输出结构化的视频提示词列表，可直接喂给视频生成模型
 */
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

/**
 * 生成视频生成用的提示词列表
 * @param {string} scriptContent 剧本内容文本
 * @param {object} charRefs 角色参考图映射表 {角色名: 图片路径}
 * @param {object} sceneRefs 场景参考图映射表 {场景名: 图片路径}
 * @returns {Array} 视频提示词列表，每个对象包含场景ID、提示词、参考图路径等
 */
export const 视频提示词生成Agent = async (scriptContent, charRefs, sceneRefs) => {
  // ==============================================
  // 【核心提示词：视频提示词生成规则】
  // 功能：把剧本拆成每段4-15秒的视频生成提示词
  // ==============================================
  const prompt = `根据以下剧本内容，拆分成适合生成4-15秒视频的分段提示词，每段对应一个场景片段：
  剧本内容：${scriptContent}
  角色参考图：${JSON.stringify(charRefs)}
  场景参考图：${JSON.stringify(sceneRefs)}
  
  输出格式严格为JSON，不要输出任何多余内容：
  [
    {
      "scene_id": 1,
      "scene_name": "场景名",
      "duration": 8,
      "prompt": "完整的视频生成提示词，包含景别、角色动作、台词、环境，参考对应角色和场景图",
      "char_ref": "对应的角色参考图路径",
      "scene_ref": "对应的场景参考图路径"
    }
  ]
  `;

  // 调用大模型生成提示词
  const response = await callLLM(prompt);
  return JSON.parse(response);
};

/**
 * 大模型调用工具函数，对接火山引擎豆包模型
 * @param {string} prompt 输入给大模型的提示词
 * @returns {string} 大模型返回的JSON格式提示词列表
 */
const callLLM = async (prompt) => {
  console.log("[大模型调用] 生成视频提示词...");
  // 调用Python脚本调用火山SDK
  const { stdout } = await execAsync(`echo '${JSON.stringify(prompt).replace(/'/g, "'\\''")}' | python3 ./utils/volc_llm.py`);
  const result = JSON.parse(stdout);
  if (result.result.startsWith('Error:')) {
    throw new Error(`大模型调用失败: ${result.result}`);
  }
  return result.result;
};
