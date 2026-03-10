#!/usr/bin/env python3
"""
火山引擎豆包生图模型调用工具
功能：通过火山方舟SDK调用Seedream生图模型，返回生成的图片URL
输入：从标准输入读取JSON格式的参数，包含prompt和size字段
输出：JSON格式的结果，包含url字段
"""
import sys
import json
from volcenginesdkarkruntime import Ark

# 初始化Ark客户端，使用提供的API密钥
client = Ark(
    base_url='https://ark.cn-beijing.volces.com/api/v3',
    api_key='5ced3d53-2536-400f-ae64-171b991af49d',
)

def generate_image(prompt, size="1792x1024"):
    """
    调用Seedream生图模型生成图片
    :param prompt: 生图提示词
    :param size: 图片尺寸，默认1792x1024
    :return: 生成的图片URL，出错返回错误信息
    """
    try:
        # 调用生图接口，使用doubao-seedream-5-0模型
        response = client.images.generate(
            model="doubao-seedream-5-0-260128",
            prompt=prompt,
            sequential_image_generation="disabled",
            response_format="url",
            size=size,
            stream=False,
            watermark=False  # 不加水印
        )
        return response.data[0].url
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    # 从标准输入读取JSON格式的参数
    data = json.loads(sys.stdin.read())
    prompt = data.get('prompt', '')
    size = data.get('size', '1792x1024')
    # 调用生图接口
    result = generate_image(prompt, size)
    # 输出JSON格式结果
    print(json.dumps({"url": result}, ensure_ascii=False))
