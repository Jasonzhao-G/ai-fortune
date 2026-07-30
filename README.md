# AI 命理 - 智能算命 App

基于 Next.js 的 AI 驱动命理分析应用，支持八字算命、命势 K 线、手相/面相分析，可接入 DeepSeek、ChatGPT 等大模型。

## 功能特性

### 1. 八字算命
- 输入出生年月日时和性别
- 自动排盘（四柱、大运、流年）
- AI 分析：财运、爱情、性格、朋友、子女、家庭、事业

### 2. 命势 K 线图
- 支持查看未来 1/3/5/10/20/50/100 年运势
- 红涨绿跌 K 线可视化
- 点击某年 K 线，切换为该年月度分时图

### 3. AI 看手相 / 看面相
- 拍照或上传图片
- AI 智能分析七大维度运势
- 支持 OpenAI Vision 真实图像识别（需配置 API Key）

### 4. 设置
- 浅色 / 深色主题
- 中英文切换
- 联系客服、版本信息

## 所有者：接入 AI API

在 Vercel 或服务器环境变量中配置（用户不可见）：

```bash
DEEPSEEK_API_KEY=sk-xxx
```

详见 `.env.example`

## 快速开始

用户端不展示 API 配置。未设置环境变量时，自动使用本地模拟分析。

App 所有者在部署平台配置环境变量即可接入 AI，参见 `.env.example`。

## 快速开始

```bash
cd ai-fortune
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)

## 配置 AI

1. 进入「设置」页面
2. 选择 AI 服务商（DeepSeek / ChatGPT / 自定义）
3. 填入 API Key
4. 保存配置

未配置 API Key 时，应用会使用本地示例分析结果，方便体验 UI。

## 技术栈

- **框架**: Next.js 15 + React 19 + TypeScript
- **样式**: Tailwind CSS（深色命理主题）
- **图表**: Recharts（K 线 / 分时图）
- **八字**: lunar-javascript（农历/八字计算）
- **AI**: OpenAI 兼容 API

## 项目结构

```
src/
├── app/                  # 页面路由
│   ├── bazi/             # 八字算命
│   ├── chart/            # 命势 K 线
│   ├── palm/             # 手相分析
│   ├── face/             # 面相分析
│   ├── settings/         # AI 配置
│   └── api/              # 后端 API
├── components/           # UI 组件
└── lib/                  # 核心逻辑
    ├── bazi.ts           # 八字排盘
    ├── fortune-chart.ts  # K 线生成
    └── llm.ts            # AI 分析
```

## 后续扩展建议

- [ ] 接入 DeepSeek-VL 实现真实手相/面相图像识别
- [ ] 添加用户账号与历史记录
- [ ] 封装为 React Native / 微信小程序
- [ ] 增加六爻、紫微斗数等命理模块
- [ ] 付费订阅与会员体系

## 免责声明

本应用仅供娱乐参考，不构成任何人生决策建议。
