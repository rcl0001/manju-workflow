/**
 * 剧本生成Agent
 * 功能：输入小说文本，输出符合指定格式的结构化剧本
 * 输出包含三个强制字段：角色信息、环境信息、剧本内容
 */
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

/**
 * 调用火山豆包大模型生成结构化剧本
 * @param {string} novelText 输入的小说文本
 * @returns {string} 结构化剧本，包含角色信息、环境信息、剧本内容
 */
export const 剧本生成Agent = async (novelText) => {
  // ==============================================
  // 【核心提示词：剧本生成规则】
  // 功能：将小说拆成结构化的角色/环境/剧本三部分
  // ==============================================
  const prompt = `请根据小说内容生成剧本，生成时需稳定提取出小说中的角色信息、环境信息，并将剧本内容结构化呈现，确保大模型能够据此写出清晰的分镜。
其中，角色信息、环境信息、剧本内容作为三个强制输出的字段：
- 角色信息需包含人物的性别、年龄、角色（例如学生、老师等）、人物形象（外貌、穿着等）
- 环境信息需准确描写出环境
- 剧本内容需要明确输出场景（即环境信息），角色。剧本内容禁止使用表格形式列出。

小说内容：${novelText}

输出格式严格参考以下示例，不要输出任何多余内容：
### 角色信息
1. 角色名：性别，年龄，身份。外貌穿着描述。
2. 角色名：性别，年龄，身份。外貌穿着描述。

### 环境信息
1. 场景名：详细环境描述，包含所有物品、光影、氛围。
2. 场景名：详细环境描述，包含所有物品、光影、氛围。

### 剧本内容
#### 场景X：场景名
【环境】场景环境描述，时间、光影。
【角色】出场角色1、出场角色2
角色动作、台词、交互内容，按剧情顺序写。
`;

  // 调用大模型生成剧本
  const response = await callLLM(prompt);
  return response;
};

/**
 * 大模型调用工具函数，对接火山引擎豆包模型
 * @param {string} prompt 输入给大模型的提示词
 * @returns {string} 大模型返回的文本内容
 */
const callLLM = async (prompt) => {
  console.log("[大模型调用] 生成结构化剧本...");
  // 调用Python脚本调用火山SDK，避免Node.js SDK兼容问题
  const { stdout } = await execAsync(`echo '${JSON.stringify(prompt).replace(/'/g, "'\\''")}' | python3 ./utils/volc_llm.py`);
  const result = JSON.parse(stdout);
  if (result.result.startsWith('Error:')) {
    throw new Error(`大模型调用失败: ${result.result}`);
  }
  return result.result;
};
