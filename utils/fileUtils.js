/**
 * 通用文件处理工具函数
 * 功能：提供图片、视频、文本、JSON文件的读写操作
 */
import fs from 'fs/promises';
import axios from 'axios';

/**
 * 保存远程图片到本地
 * @param {string} imageUrl 远程图片URL
 * @param {string} savePath 本地保存路径
 * @returns {string} 本地保存路径
 */
export const saveImageToFile = async (imageUrl, savePath) => {
  console.log(`[文件操作] 下载图片到本地: ${savePath}`);
  // 发送GET请求获取图片二进制数据
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  // 写入本地文件
  await fs.writeFile(savePath, response.data);
  console.log(`[文件操作] 图片保存成功: ${savePath}`);
  return savePath;
};

/**
 * 保存远程视频到本地
 * @param {string} videoUrl 远程视频URL
 * @param {string} savePath 本地保存路径
 * @returns {string} 本地保存路径
 */
export const saveVideoToFile = async (videoUrl, savePath) => {
  console.log(`[文件操作] 下载视频到本地: ${savePath}`);
  // 模拟URL的话直接创建空文件，跳过下载
  if (videoUrl.includes('mock.video.url')) {
    await fs.writeFile(savePath, Buffer.from(''));
    console.log(`[文件操作] 模拟视频保存成功: ${savePath}`);
    return savePath;
  }
  // 发送GET请求获取视频二进制数据
  const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
  // 写入本地文件
  await fs.writeFile(savePath, response.data);
  console.log(`[文件操作] 视频保存成功: ${savePath}`);
  return savePath;
};

/**
 * 读取本地文本文件
 * @param {string} filePath 文件路径
 * @returns {string} 文件内容
 */
export const readTextFile = async (filePath) => {
  return await fs.readFile(filePath, 'utf-8');
};

/**
 * 写入JSON数据到本地文件
 * @param {object} data 要写入的JSON数据
 * @param {string} savePath 本地保存路径
 * @returns {string} 本地保存路径
 */
export const writeJsonFile = async (data, savePath) => {
  console.log(`[文件操作] 保存JSON数据到: ${savePath}`);
  // 格式化JSON并写入文件
  await fs.writeFile(savePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[文件操作] JSON数据保存成功: ${savePath}`);
  return savePath;
};

/**
 * 本地图片转Base64编码，符合API要求格式
 * @param {string} imagePath 本地图片路径
 * @returns {string} Base64编码的图片，格式：data:image/png;base64,xxx
 */
export const imageToBase64 = async (imagePath) => {
  const imageBuffer = await fs.readFile(imagePath);
  const ext = imagePath.split('.').pop().toLowerCase();
  return `data:image/${ext};base64,${imageBuffer.toString('base64')}`;
};
