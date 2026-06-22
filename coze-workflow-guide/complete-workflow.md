# 🍳 美食视频生成工作流 - 完整正确版（2026最新版）

> 包含：AI分镜生成 + AI图片生成 + AI视频生成 + 字幕配音

---

## ⚠️ 重要说明

1. **图像生成**和**视频生成**是 Coze 的**内置节点**，不是插件！
2. **不要使用插件**，直接用节点
3. LLM 输出应该是**纯JSON数组**

---

## 📁 完整工作流结构

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   ┌─────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     │
│   │     │     │         │     │         │     │         │     │
│   │开始 │────▶│  LLM   │────▶│ 代码    │────▶│  循环   │     │
│   │     │     │ 分镜生成 │     │ 解析    │     │  图片   │     │
│   └─────┘     └─────────┘     └─────────┘     └────┬────┘     │
│                                                     │           │
│                              ┌──────────────────────┘           │
│                              ▼                                  │
│                       ┌─────────────┐                          │
│                       │  循环体内   │                          │
│                       │  ┌───────┐ │                          │
│                       │  │图像生成│ │                          │
│                       │  │TTS配音│ │                          │
│                       │  │合成小片│ │                          │
│                       │  └───────┘ │                          │
│                       └────┬──────┘                          │
│                            │                                   │
│              ┌─────────────┴─────────────┐                     │
│              ▼                           ▼                      │
│       ┌─────────────┐            ┌─────────────┐              │
│       │ 拼接视频    │            │ 生成字幕    │              │
│       └──────┬──────┘            └──────┬──────┘              │
│              │                          │                      │
│              └────────────┬─────────────┘                      │
│                           ▼                                    │
│                    ┌─────────────┐                             │
│                    │    结束     │                             │
│                    └─────────────┘                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔧 详细配置步骤

---

### 第一步：创建工作流

```
名称：food_video_workflow
描述：美食视频生成工作流
```

---

### 第二步：配置「开始」节点

添加输入变量：

```
变量1：
  名称：topic
  类型：String
  描述：菜谱主题
  默认值：番茄炒蛋
```

---

### 第三步：添加「LLM」节点（生成JSON分镜）

**拖入一个大模型节点，连接：开始 → LLM**

**配置：**

```
名称：生成分镜脚本

模型：豆包 1.5 Pro 32k（或其他）

System Prompt（完整复制）：
```

```
# 角色
你是一位专业美食短视频编剧。

# 任务
根据用户输入的菜谱主题，生成5-8个分镜脚本。

# 输入
菜谱主题：{{start.topic}}

# 输出格式
请严格输出一个JSON数组，不要加任何其他内容：

[
  {
    "scene_id": 1,
    "scene_name": "场景名称",
    "narration": "配音解说词30-50字",
    "duration": 3,
    "visual_prompt": "英文画面描述，用于AI生成图片"
  }
]

# 示例输出（番茄炒蛋）
[
  {"scene_id":1,"scene_name":"准备食材","narration":"先把番茄洗净切成小块，鸡蛋打入碗中加少许盐搅拌均匀备用","duration":3,"visual_prompt":"Fresh tomatoes being chopped on a wooden cutting board, with eggs cracked into a bowl nearby, kitchen counter, natural lighting, food photography style, 4K"},
  {"scene_id":2,"scene_name":"热锅炒蛋","narration":"锅中倒入食用油，油温六成热时倒入蛋液快速翻炒","duration":3,"visual_prompt":"Oil in a hot wok, eggs being poured in and quickly stirred, sizzling sound, professional food cooking video, shallow depth of field"},
  {"scene_id":3,"scene_name":"盛出备用","narration":"将炒至八成熟的鸡蛋盛出备用，锅中留底油","duration":2,"visual_prompt":"Scrambled eggs being scooped out of a wok onto a plate, golden and fluffy, steam rising"},
  {"scene_id":4,"scene_name":"炒番茄","narration":"下番茄块，翻炒约2分钟至软烂出汁","duration":3,"visual_prompt":"Tomato chunks being stir-fried in a wok, juice releasing, red color, glossy surface, close-up shot"},
  {"scene_id":5,"scene_name":"合并调味","narration":"倒入炒好的鸡蛋，加1勺糖、少许盐，大火快速翻炒均匀","duration":3,"visual_prompt":"Eggs being added back to the wok with tomatoes, seasoning being sprinkled, chef's hands stirring"},
  {"scene_id":6,"scene_name":"出锅装盘","narration":"撒上翠绿葱花，香气四溢的番茄炒蛋完成","duration":2,"visual_prompt":"Finished tomato and eggs dish being garnished with green onions, served on a white plate, appetizing, restaurant style"}
]

# 要求
1. 生成5-8个分镜
2. 每个分镜包含：scene_id, scene_name, narration, duration, visual_prompt
3. narration用中文，30-50字
4. visual_prompt用英文，详细描述画面
5. duration是秒数，2-4秒
6. 只输出JSON数组，不要其他内容
```

**用户输入：**
```
- topic = {{start.topic}}
```

**输出变量：**
```
- output（String）：JSON数组
```

---

### 第四步：添加「代码」节点（解析JSON）

**拖入一个代码节点，连接：LLM → 代码**

**配置：**

```
名称：解析分镜数据

运行时：Node.js

代码（完整复制）：
```

```javascript
const input = params.output || '[]';
try {
  const scenes = JSON.parse(input);
  const count = Array.isArray(scenes) ? scenes.length : 0;
  return {
    scenes: scenes,
    count: count
  };
} catch(e) {
  return {
    scenes: [],
    count: 0,
    error: String(e)
  };
}
```

**输入：**
```
- output = {{生成分镜脚本.output}}
```

**输出变量：**
```
- scenes（Array）
- count（Number）
```

---

### 第五步：添加「循环」节点

**拖入一个循环节点，连接：代码 → 循环**

**配置：**

```
名称：循环生成图片

循环数据：{{解析分镜数据.scenes}}
（这样会自动按分镜数量循环）
```

---

### 第六步：在循环体内添加节点

**点击循环节点内部的「+」，添加以下节点：**

#### 6.1 代码节点（提取当前分镜）

```
名称：提取当前分镜

运行时：Node.js

代码：
```javascript
const scenes = params.scenes || [];
const index = loop.index || 0;
const scene = scenes[index] || {};
return {
  scene_id: scene.scene_id || 0,
  scene_name: scene.scene_name || '',
  narration: scene.narration || '',
  duration: scene.duration || 3,
  visual_prompt: scene.visual_prompt || ''
};
```

输入：
```
- scenes = {{解析分镜数据.scenes}}
- loop.index（自动注入）
```

输出：
```
- scene_id（Number）
- scene_name（String）
- narration（String）
- duration（Number）
- visual_prompt（String）
```

#### 6.2 图像生成节点（生成当前分镜图片）

**这是关键！找到「图像生成」节点（不是插件！）：**

在左侧节点面板，找到「图像生成」或「Image Generation」，拖入循环体内。

**配置：**

```
名称：生成当前分镜图片

模型：Seedream 3.0（或其他可用模型）

正向提示词：{{提取当前分镜.visual_prompt}}

负向提示词：low quality, blurry, watermark, text, logo

比例：1:1 或 9:16（根据需要）

生成质量：25
```

**输入：**
```
- visual_prompt = {{提取当前分镜.visual_prompt}}
```

**输出：**
```
- data（Image）：生成的图片URL
- msg（String）：状态
```

#### 6.3 TTS节点（生成配音）

**找到「语音合成」或「TTS」节点，拖入循环体内**

**配置：**

```
名称：生成配音

文本：{{提取当前分镜.narration}}

声音：甜美女声（或其他）

语速：1.0
```

**输入：**
```
- text = {{提取当前分镜.narration}}
```

**输出：**
```
- audio_url（String）：音频URL
```

#### 6.4 代码节点（收集结果）

```
名称：收集循环结果

运行时：Node.js

代码：
```javascript
const results = params.loop_results || [];
const current = {
  scene_id: params.scene_id,
  scene_name: params.scene_name,
  narration: params.narration,
  duration: params.duration,
  image_url: params.image_url,
  audio_url: params.audio_url
};
results.push(current);
return {
  all_results: results
};
```

输入：
```
- loop_results = {{循环生成图片.loop_results}}
- scene_id = {{提取当前分镜.scene_id}}
- scene_name = {{提取当前分镜.scene_name}}
- narration = {{提取当前分镜.narration}}
- duration = {{提取当前分镜.duration}}
- image_url = {{生成当前分镜图片.data}}
- audio_url = {{生成配音.audio_url}}
```

输出：
```
- all_results（Array）
```

---

### 第七步：循环体外的节点

循环结束后（连接到循环节点的出线）：

#### 7.1 代码节点（合并所有结果）

```
名称：合并最终结果

运行时：Node.js

代码：
```javascript
const all = params.all_results || [];
return {
  final_scenes: all,
  total_count: all.length,
  video_ready: true
};
```

输入：
```
- all_results = {{收集循环结果.all_results}}
```

输出：
```
- final_scenes（Array）
- total_count（Number）
- video_ready（Boolean）
```

#### 7.2 结束节点

**配置输出：**

```
- final_scenes = {{合并最终结果.final_scenes}}
- total_count = {{合并最终结果.total_count}}
```

---

## 🔧 如果没有图像生成/视频生成节点

如果你的 Coze 界面找不到「图像生成」节点，可能是因为：
1. 版本问题 - 尝试更新或使用其他模型
2. 权限问题 - 检查你的订阅套餐
3. 地域问题 - 部分功能可能只在特定地区可用

**替代方案：使用插件**

搜索并添加这些插件：
- **通义万相**（文生图）
- **字节图像生成**
- **SkyReels**（视频生成）

---

## ❗ 常见错误排查

| 错误 | 原因 | 解决 |
|------|------|------|
| Jinja2语法错误 | System Prompt中有`{{}}` | JSON示例中不要用`{{}}` |
| LLM询问用户 | 提示词不够明确 | 强调"直接生成，不要询问" |
| 图像生成失败 | 提示词包含敏感词 | 检查英文提示词 |
| 循环不执行 | 循环数据格式不对 | 确保是数组格式 |
| 视频生成超时 | 视频生成需要等待 | 使用循环+查询节点 |

---

## 📋 完整检查清单

```
□ 工作流名称是英文
□ 开始节点有 topic 输入变量
□ LLM 输出纯JSON数组（无{{}}）
□ 代码节点正确解析JSON
□ 循环节点引用了 scenes 数组
□ 循环体内有：代码+图像生成+TTS+收集结果
□ 循环体外有：合并结果+结束节点
□ 所有连接都正确
```

---

## 🎯 快速复制版

如果上述太复杂，想要简化版：

**只用LLM生成文本分镜，不生成图片和视频：**

1. 开始 → LLM（生成JSON） → 代码（解析） → 结束

这样可以先确保流程跑通，之后再加图像和视频生成。
