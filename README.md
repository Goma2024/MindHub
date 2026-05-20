智汇库 - AI学习助手
===================

项目简介
-------
智汇库是一个基于AI的智能学习助手，帮助用户把"收藏"变成"学会"。通过AI一键总结、智能问答、知识卡片生成等功能，让用户高效消化和内化收藏的知识内容。

核心价值
--------
- 一键总结：快速理解文章核心观点
- 智能问答：基于收藏内容回答问题
- 知识卡片：生成可复习的知识卡片
- 学习追踪：记录学习进度，提醒复习

目标用户
--------
- 考研党：高效消化知识点，考前复习
- 考证党：整理知识体系，重点标记
- 职场学习者：快速理解，定期复习
- 自我提升者：一键获取精华，高效学习

核心功能
--------
1. 内容导入
   - 链接导入（网页、公众号文章）
   - 文本粘贴
   - 手动创建笔记

2. AI学习中心
   - 一键总结（核心功能）
   - 智能问答
   - 知识卡片生成
   - 思维导图生成

3. 知识库管理
   - 内容列表
   - 分类标签
   - 学习状态（未学/学习中/已掌握）
   - 搜索筛选

4. 学习追踪
   - 学习统计
   - 复习提醒
   - 学习报告

技术栈
------
- 前端框架：React 18 + TypeScript
- 构建工具：Vite
- 样式框架：TailwindCSS
- 状态管理：React Context + useReducer
- 路由管理：React Router
- 数据持久化：LocalStorage
- AI接口：DeepSeek API（总结、问答）
- 图像识别：千问3 VL API

项目结构
--------
智汇库/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Navbar.tsx      # 导航栏
│   │   ├── Modal.tsx       # 通用模态框
│   │   ├── LoginModal.tsx  # 登录模态框
│   │   ├── ImportModal.tsx # 导入内容模态框
│   │   ├── KnowledgeDetailModal.tsx  # 知识详情模态框
│   │   └── ImportRecordDetailModal.tsx  # 导入记录详情模态框
│   ├── pages/              # 页面目录
│   │   ├── Dashboard.tsx   # 首页/仪表盘
│   │   ├── KnowledgePage.tsx  # 知识库页面
│   │   ├── SearchPage.tsx  # 搜索页面
│   │   ├── ImportPage.tsx  # 导入页面
│   │   ├── LoginPage.tsx   # 登录页面
│   │   └── SettingsPage.tsx # 设置页面
│   ├── context/            # 状态管理
│   │   └── AppContext.tsx  # 应用上下文
│   ├── types/              # 类型定义
│   │   └── index.ts        # 全局类型
│   ├── utils/              # 工具函数
│   │   ├── api.ts          # API调用
│   │   └── mockData.ts     # 模拟数据
│   ├── App.tsx             # 根组件
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── docs/                   # 文档目录
│   ├── 业务逻辑文档.md
│   └── 提示词-单页面原型.md
├── dist/                   # 构建输出
├── node_modules/           # 依赖包
├── index.html              # HTML模板
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
├── tailwind.config.js      # TailwindCSS配置
└── README.txt              # 项目说明

安装和运行
----------

环境要求
--------
- Node.js >= 16.0.0
- npm >= 8.0.0

安装步骤
--------
1. 克隆项目
   git clone <repository-url>
   cd 智汇库

2. 安装依赖
   npm install

3. 配置环境变量
   创建 .env 文件：
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
   VITE_QWEN_API_KEY=your_qwen_api_key

4. 启动开发服务器
   npm run dev

5. 构建生产版本
   npm run build

6. 预览生产版本
   npm run preview

环境变量配置
-----------
VITE_DEEPSEEK_API_KEY
  DeepSeek API密钥，用于AI总结和智能问答
  获取地址：https://platform.deepseek.com/

VITE_QWEN_API_KEY
  千问API密钥，用于图像识别和文档处理
  获取地址：https://siliconflow.cn/

使用说明
--------

1. 用户注册/登录
   - 演示账号：user@example.com
   - 演示密码：123456

2. 导入内容
   - 点击"导入内容"按钮
   - 选择导入方式：链接、文本、PDF/图片
   - 填写内容信息并保存

3. AI总结
   - 在知识库中选择一条内容
   - 点击"AI总结"按钮
   - 等待AI生成总结结果

4. 生成知识卡片
   - 在内容详情页点击"生成知识卡片"
   - 卡片支持翻转查看（正面问题，背面答案）

5. 复习知识卡片
   - 在知识卡片页面点击"开始复习"
   - 根据掌握程度选择：简单/一般/困难
   - 系统会根据反馈调整复习时间

6. 学习统计
   - 在首页查看学习进度统计
   - 查看本周学习时长和连续学习天数

开发指南
--------

代码风格
--------
- 使用函数组件 + Hooks
- 使用TypeScript进行类型检查
- 使用TailwindCSS进行样式开发
- 遵循React最佳实践

状态管理
--------
使用React Context + useReducer进行全局状态管理：

```typescript
type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_KNOWLEDGE_ITEMS'; payload: KnowledgeItem[] }
  | { type: 'UPDATE_KNOWLEDGE_ITEM'; payload: KnowledgeItem }
  | { type: 'DELETE_KNOWLEDGE_ITEM'; payload: string }
  // ...更多action类型

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    // ...更多case
    default:
      return state;
  }
}
```

API调用
--------
所有API调用封装在 src/utils/api.ts 中：

```typescript
// 调用DeepSeek API进行总结
const summary = await callDeepSeekAPI(content);

// 调用千问API进行图像识别
const result = await callQwenAPI(imageBase64);
```

数据持久化
----------
使用LocalStorage存储用户数据：

```typescript
// 保存数据
localStorage.setItem('zhihuiku_data', JSON.stringify(data));

// 读取数据
const data = JSON.parse(localStorage.getItem('zhihuiku_data'));
