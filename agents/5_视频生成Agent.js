/**
 * 视频生成Agent：输入提示词+参考图，生成最终漫剧视频
 */
import { saveVideoToFile, imageToBase64 } from '../utils/fileUtils.js';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VOLC_API_KEY;

export const 视频生成Agent = async (videoPrompts) => {
  const videoClips = [];

  for (const promptItem of videoPrompts) {
    // ==============================================
    // 【核心提示词：视频生成通用规则】
    // 功能：给每个视频片段的提示词加上统一的质量约束
    // ==============================================
    const fullPrompt = `<ref:${promptItem.char_ref}:1.5> <ref:${promptItem.scene_ref}:1.2> ${promptItem.prompt} 4K 60fps，电影级质感，动态流畅，无闪烁，无穿模 --no 脸崩，扭曲，口型不匹配`;
    
    // 调用你的视频生成模型，支持参考图+音频参考
    const videoUrl = await callVideoGenModel(
      fullPrompt,
      promptItem.duration,
      promptItem.char_ref,
      promptItem.scene_ref
    );

    // 保存视频到本地
    const savePath = `./assets/videos/clip_${promptItem.scene_id}.mp4`;
    await saveVideoToFile(videoUrl, savePath);
    videoClips.push(savePath);
  }

  // 最后合并所有片段成完整视频
  const finalVideoPath = await mergeVideoClips(videoClips);
  return finalVideoPath;
};

import axios from 'axios';

/**
 * 调用火山豆包视频生成API，支持参考图+轮询查询结果
 * @param {string} prompt 视频生成提示词
 * @param {number} duration 视频时长，单位秒
 * @param {string} charRefUrl 角色参考图URL
 * @param {string} sceneRefUrl 场景参考图URL
 * @returns {string} 生成完成的视频URL
 */
const callVideoGenModel = async (prompt, duration, charRefUrl, sceneRefUrl) => {
  console.log(`[视频生成] 提交生成任务，时长：${duration}s，提示词前80字：${prompt.slice(0, 80)}...`);
  
  // --- 真实调用逻辑已启用 ---
  // 1. 处理多角色的情况：拆分多个角色路径，分别转Base64
  const contentList = [{ "type": "text", "text": prompt }];
  
  // 拆分多个角色路径，支持逗号分隔的多角色
  const charPaths = charRefUrl.split(',').map(p => p.trim());
  for (const charPath of charPaths) {
    if (charPath) {
      const charBase64 = await imageToBase64(charPath);
      contentList.push({ 
        "type": "image_url", 
        "image_url": { "url": charBase64 }, 
        "role": "reference_image" 
      });
    }
  }

  // 添加场景参考图
  const sceneBase64 = await imageToBase64(sceneRefUrl);
  contentList.push({ 
    "type": "image_url", 
    "image_url": { "url": sceneBase64 }, 
    "role": "reference_image" 
  });

  // 2. 提交视频生成任务，完全匹配官方API文档
  const submitResponse = await axios.post(
    "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks",
    {
      model: "doubao-seedance-2-0-260128",
      content: contentList,
      generate_audio: true, // 自动生成同步音频
      resolution: "720p", // 分辨率默认720p
      ratio: "16:9", // 宽高比默认16:9
      duration: duration, // 视频时长
      watermark: false // 不加水印
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      timeout: 30000
    }
  );

  // 任务ID字段是id，符合官方返回结构
  const taskId = submitResponse.data.id;
  console.log(`[视频生成] 任务提交成功，Task ID: ${taskId}，开始轮询结果...`);

  // 2. 轮询查询任务结果，最长等待10分钟
  const maxWaitTime = 600000; // 最长等待10分钟，视频生成可能比较慢
  const pollInterval = 5000; // 每5秒查询一次
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    // 轮询接口是/contents/generations/tasks/{task_id}，符合文档要求
    const queryResponse = await axios.get(
      `https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/${taskId}`,
      {
        headers: { "Authorization": `Bearer ${API_KEY}` },
        timeout: 10000
      }
    );

    // 任务状态字段是data.status，符合文档要求
    const taskStatus = queryResponse.data.status;

    if (taskStatus === "succeeded") {
      // 视频URL在content.video_url字段，符合官方返回结构
      const videoUrl = queryResponse.data.content.video_url;
      console.log(`[视频生成] 任务完成，视频URL: ${videoUrl}`);
      return videoUrl;
    } else if (taskStatus === "failed") {
      // 错误信息字段是data.error_msg，符合文档要求
      const errorMsg = queryResponse.data.error_msg || queryResponse.data.error?.message || "未知错误";
      throw new Error(`视频生成失败，Task ID: ${taskId}，错误信息: ${errorMsg}`);
    }

    console.log(`[视频生成] 任务运行中，当前状态: ${taskStatus}，继续等待...`);
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error(`视频生成超时，Task ID: ${taskId}，等待超过10分钟仍未完成`);
};

// 合并所有视频片段，加字幕配音，替换成你的合成工具
const mergeVideoClips = async (clips) => {
  console.log("合并视频片段...");
  return "./assets/videos/final_manju.mp4";
};
