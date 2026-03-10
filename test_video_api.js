/**
 * 单独测试视频生成API
 */
import axios from 'axios';
import fs from 'fs/promises';

// 配置
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VOLC_API_KEY;
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks";
const TEST_CHAR_IMAGE = "./assets/chars/林小满_三视图.png"; // 用已有的角色图
const TEST_SCENE_IMAGE = "./assets/scenes/社区废品回收站_参考图.png"; // 用已有的场景图
const TEST_PROMPT = "近景，高二女生林小满站在废品回收站里，手里拿着一本旧书《小王子》，眼神带着惊喜，阳光从侧面照过来，暖金色的光线落在她脸上。"

/**
 * 本地图片转Base64
 */
const imageToBase64 = async (imagePath) => {
  const imageBuffer = await fs.readFile(imagePath);
  const ext = imagePath.split('.').pop().toLowerCase();
  return `data:image/${ext};base64,${imageBuffer.toString('base64')}`;
};

/**
 * 测试单个视频生成
 */
const testSingleVideo = async () => {
  try {
    console.log("🎬 开始测试视频生成API...");
    
    // 转Base64
    const charBase64 = await imageToBase64(TEST_CHAR_IMAGE);
    const sceneBase64 = await imageToBase64(TEST_SCENE_IMAGE);
    console.log("✅ 图片转Base64完成");

    // 提交任务
    const submitResponse = await axios.post(
      API_URL,
      {
        model: "doubao-seedance-2-0-260128",
        content: [
          { "type": "text", "text": TEST_PROMPT },
          { "type": "image_url", "image_url": { "url": charBase64 }, "role": "reference_image" },
          { "type": "image_url", "image_url": { "url": sceneBase64 }, "role": "reference_image" }
        ],
        generate_audio: true,
        resolution: "720p",
        ratio: "16:9",
        duration: 6,
        watermark: false
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        timeout: 30000
      }
    );

    const taskId = submitResponse.data.id || submitResponse.data.task_id;
    console.log(`✅ 任务提交成功，Task ID: ${taskId}`);
    console.log("提交返回数据：", JSON.stringify(submitResponse.data, null, 2));

    // 轮询结果
    const maxWaitTime = 600000; // 10分钟超时
    const pollInterval = 5000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const queryResponse = await axios.get(
        `${API_URL}/${taskId}`,
        {
          headers: { "Authorization": `Bearer ${API_KEY}` },
          timeout: 10000
        }
      );

      const taskStatus = queryResponse.data.status;
      console.log(`[${new Date().toLocaleTimeString()}] 任务状态：${taskStatus}`);
      
      if (taskStatus === "succeeded") {
        console.log("🎉 视频生成成功！返回数据：", JSON.stringify(queryResponse.data, null, 2));
        const videoUrl = queryResponse.data.video_url || queryResponse.data.output?.video_url;
        console.log("视频URL：", videoUrl);
        return videoUrl;
      } else if (taskStatus === "failed") {
        const errorMsg = queryResponse.data.error_msg || queryResponse.data.error?.message || "未知错误";
        throw new Error(`视频生成失败：${errorMsg}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error("视频生成超时");
  } catch (e) {
    console.error("❌ 测试失败：", e.response?.data || e.message);
    throw e;
  }
};

// 运行测试
testSingleVideo().catch(console.error);
