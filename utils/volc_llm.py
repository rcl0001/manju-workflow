#!/usr/bin/env python3
"""
火山引擎豆包大模型调用工具
功能：通过火山方舟SDK调用豆包大模型，返回生成的文本内容
输入：从标准输入读取提示词
输出：JSON格式的结果，包含result字段
"""
import sys
import json
import os
from dotenv import load_dotenv
from volcenginesdkarkruntime import Ark

# 加载环境变量
load_dotenv()

# 初始化Ark客户端，使用提供的API密钥
client = Ark(
    base_url='https://ark.cn-beijing.volces.com/api/v3',
    api_key=os.getenv('VOLC_API_KEY'),
)

def call_doubao(prompt):
    """
    调用豆包大模型生成文本
    :param prompt: 输入的提示词
    :return: 生成的文本内容，出错返回错误信息
    """
    try:
        # 调用大模型接口，使用doubao-seed-2-0-pro模型
        response = client.chat.completions.create(
            model="doubao-seed-2-0-pro-260215",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,  # 温度设为0.1，保证输出稳定
            max_tokens=4096   # 最大输出token数
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    # 从标准输入读取提示词
    prompt = sys.stdin.read()
    # 调用大模型
    result = call_doubao(prompt)
    # 输出JSON格式结果
    print(json.dumps({"result": result}, ensure_ascii=False))
