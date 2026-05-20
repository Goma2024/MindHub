// API工具函数

// DeepSeek API配置
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 千问3 VL API配置
const QWEN_API_KEY = import.meta.env.VITE_QWEN_API_KEY || '';
const QWEN_API_URL = 'https://api.siliconflow.cn/v1/';
const QWEN_MODEL_NAME = 'Qwen/Qwen3-VL-8B-Instruct';

// 网页内容抓取API配置（使用第三方服务）
// 示例API密钥，实际使用时需要替换
// const WEB_SCRAPE_API_URL = 'https://api.apyhub.com/extract/text/website';
// const WEB_SCRAPE_API_KEY = 'apyhub_live_myApyhubKey12345';

/**
 * 调用DeepSeek API获取AI响应
 * @param prompt 用户输入的提示
 * @param context 上下文信息，可选
 * @returns Promise<string> AI生成的响应
 */
export async function callDeepSeekAPI(prompt: string, context?: string): Promise<string> {
  try {
    // 构建系统提示
    const systemPrompt = '你是一个智能助手，能够提供简洁、准确的回答。请根据用户的问题提供有用的信息，保持回答精炼。';
    
    // 构建消息数组
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: context ? `${context}\n\n${prompt}` : prompt }
    ];

    // 调用API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API调用错误:', error);
    // 返回默认响应，避免影响用户体验
    return '根据您的查询，我建议您从多个角度思考这个问题，结合实际情况进行分析。';
  }
}

/**
 * 抓取网页内容
 * @param url 网页URL
 * @returns Promise<string> 抓取的网页内容
 */
export async function scrapeWebContent(url: string): Promise<string> {
  try {
    console.log(`正在抓取链接内容: ${url}`);
    
    // 检查是否是百度链接
    const isBaiduUrl = url.includes('baidu.com');
    
    // 使用多个CORS代理服务，增加成功率
    const proxyServices = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?url=',
      'https://cors-anywhere.herokuapp.com/'
    ];
    
    let content: string = '';
    let response: Response;
    
    // 尝试使用不同的代理服务
    for (let i = 0; i < proxyServices.length; i++) {
      try {
        const corsProxy = proxyServices[i];
        const proxyUrl = `${corsProxy}${encodeURIComponent(url)}`;
        
        // 发送请求，设置合适的请求头
        response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Referer': 'https://www.google.com/',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          content = await response.text();
          console.log(`使用代理 ${corsProxy} 抓取成功`);
          break;
        }
      } catch (proxyError) {
        console.error(`代理服务 ${proxyServices[i]} 失败:`, proxyError);
        // 继续尝试下一个代理
      }
    }
    
    // 如果所有代理都失败，使用直接请求作为最后的尝试
    if (!content) {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      if (!response.ok) {
        throw new Error(`网页抓取失败: ${response.statusText}`);
      }
      
      content = await response.text();
    }
    
    // 处理百度搜索结果的特殊情况
    if (isBaiduUrl) {
      // 百度搜索结果可能需要特殊处理
      // 尝试提取搜索结果的标题和摘要
      console.log('处理百度搜索结果');
    }
    
    // 简单处理内容，提取标题和正文
    const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '无标题';
    
    // 简单提取正文内容（去除HTML标签）
    const textContent = content
      .replace(/<[^>]*>/g, '') // 去除HTML标签
      .replace(/\s+/g, ' ') // 合并空白字符
      .trim();
    
    // 限制内容长度，避免过多内容
    const limitedContent = textContent.length > 1000 
      ? textContent.substring(0, 1000) + '...' 
      : textContent;
    
    // 构建返回内容
    const result = `标题: ${title}\n\n来源: ${url}\n\n内容:\n${limitedContent}`;
    
    console.log(`链接内容抓取成功: ${url}`);
    return result;
    
  } catch (error) {
    console.error('网页抓取错误:', error);
    // 针对百度链接的特殊错误处理
    const isBaiduUrl = url.includes('baidu.com');
    if (isBaiduUrl) {
      return `来源: ${url}\n\n内容:\n百度搜索结果页面可能受到访问限制，无法直接抓取内容。\n\n建议：\n1. 尝试直接访问该链接\n2. 复制搜索结果中的具体网页链接进行导入\n3. 在实际应用中，使用后端服务实现更可靠的网页抓取功能`;
    }
    // 其他链接的错误处理
    return `来源: ${url}\n\n内容:\n由于网络限制或网站设置，无法直接抓取此链接的内容。\n\n错误信息: ${(error as Error).message}\n\n在实际应用中，建议通过后端服务实现网页内容抓取功能，以避免CORS限制并获得更可靠的结果。`;
  }
}

/**
 * 将文件转换为base64格式
 * @param file 文件对象
 * @returns Promise<string> base64编码的文件内容
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // 移除数据URL前缀，只返回base64编码部分
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * 调用千问3 VL API进行图像转文字
 * @param file 文件对象（图片或PDF）
 * @returns Promise<string> 转换后的文字内容
 */
export async function convertImageToText(file: File): Promise<string> {
  try {
    console.log(`正在处理文件: ${file.name}`);
    
    // 检查文件类型
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type.includes('pdf');
    
    if (!isImage && !isPDF) {
      throw new Error('不支持的文件类型，仅支持图片和PDF文件');
    }
    
    let base64Image: string;
    let imageUrl: string;
    
    if (isImage) {
      // 处理图片文件
      base64Image = await fileToBase64(file);
      const mimeType = file.type;
      imageUrl = `data:${mimeType};base64,${base64Image}`;
    } else {
      // 处理PDF文件（这里简化处理，实际项目中可能需要先将PDF转换为图片）
      base64Image = await fileToBase64(file);
      imageUrl = `data:application/pdf;base64,${base64Image}`;
    }
    
    // 构建请求消息
    const messages = [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "请将这个图片或PDF中的内容转换为文字，保持原始格式和结构。如果有图片，请描述图片内容。"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": imageUrl
            }
          }
        ]
      }
    ];
    
    // 调用千问3 VL API
    const response = await fetch(`${QWEN_API_URL}chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`
      },
      body: JSON.stringify({
        model: QWEN_MODEL_NAME,
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.7,
        frequency_penalty: 0.5,
        stream: false,
        n: 1
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API调用失败: ${response.statusText} - ${errorData.error?.message || ''}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log(`文件处理完成: ${file.name}`);
    return content;
  } catch (error) {
    console.error('千问3 VL API调用错误:', error);
    // 返回默认响应，避免影响用户体验
    return `无法处理文件 ${file.name}，请检查网络连接或文件格式是否正确。`;
  }
}

/**
 * 生成第三方平台授权二维码
 * @param platform 平台名称
 * @returns Promise<{qrCodeUrl: string, authUrl: string}> 二维码URL和授权URL
 */
export async function generateAuthQRCode(platform: string): Promise<{qrCodeUrl: string, authUrl: string}> {
  try {
    console.log(`正在生成 ${platform} 授权二维码...`);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 生成模拟的二维码URL（实际项目中应该使用真实的二维码生成服务）
    // 这里使用Google Charts的二维码生成服务作为示例
    const authUrl = getAuthUrl(platform);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(authUrl)}`;
    
    console.log(`${platform} 授权二维码生成成功`);
    return { qrCodeUrl, authUrl };
  } catch (error) {
    console.error(`${platform} 二维码生成失败:`, error);
    throw new Error('二维码生成失败');
  }
}

/**
 * 获取平台授权URL
 * @param platform 平台名称
 * @returns string 授权URL
 */
function getAuthUrl(platform: string): string {
  // 模拟各平台的授权URL
  switch (platform) {
    case 'wechat':
      return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=YOUR_APPID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
    case 'zhihu':
      return 'https://www.zhihu.com/api/v3/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code';
    case 'csdn':
      return 'https://passport.csdn.net/login?code=app&state=YOUR_STATE';
    default:
      return 'https://example.com/auth';
  }
}

/**
 * 模拟第三方平台授权登录状态检查
 * @param platform 平台名称
 * @returns Promise<boolean> 授权是否成功
 */
export async function checkAuthStatus(platform: string): Promise<boolean> {
  try {
    // 模拟授权状态检查
    console.log(`正在检查 ${platform} 授权状态...`);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟授权成功（实际项目中应该检查真实的授权状态）
    console.log(`${platform} 授权状态检查成功`);
    return true;
  } catch (error) {
    console.error(`${platform} 授权状态检查失败:`, error);
    return false;
  }
}
