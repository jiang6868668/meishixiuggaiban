# 🍳 美食视频生成工作流 - 修复 Jinja2 错误

## 报错原因
System Prompt 中的 JSON 格式 `{ }` 或 `{{ }}` 被 Coze 的 Jinja2 模板引擎误解析了。

## 解决方案：使用纯文本格式

### 大模型节点配置

**System Prompt（完整复制）：**
```
# 角色
你是一位专业美食短视频编剧。

## 任务
根据用户输入的菜谱，生成5-8个分镜脚本。

## 输出格式
每行一个分镜，格式：
分镜序号|场景名称|配音解说词|时长（秒数）

## 示例输出（番茄炒蛋）：
分镜1|准备食材|先把番茄洗净切块，鸡蛋打散加少许盐搅拌均匀|3
分镜2|热锅炒蛋|热锅冷油，油温六成热倒入蛋液快速翻炒至八成熟|3
分镜3|盛出备用|将炒好的鸡蛋盛出备用，锅中留底油|2
分镜4|炒番茄|下番茄块，翻炒2分钟至软烂出汁|3
分镜5|合并调味|倒入鸡蛋，加糖盐，大火翻炒均匀|3
分镜6|出锅装盘|撒上葱花，香气四溢的番茄炒蛋完成|2

## 要求
1. 生成5-8个分镜
2. 每行格式：分镜序号|场景名称|配音解说词|秒数
3. 解说词30-50字，口语化、亲切、有食欲感
4. 全程中文输出
```

**用户输入：**
- 变量名：topic
- 值：{{start.topic}}

**不要勾选 JSON 模式或结构化输出！**

---

### 代码节点配置

**代码（完整复制）：**
```javascript
const input = params.script || '';
const lines = input.trim().split('\n');
const scenes = [];
for (const line of lines) {
  const parts = line.split('|');
  if (parts.length >= 4) {
    const num = parseInt(parts[0].replace('分镜','').trim());
    if (!isNaN(num)) {
      scenes.push({
        scene_id: num,
        scene_name: parts[1].trim(),
        narration: parts[2].trim(),
        duration: parseInt(parts[3].trim()) || 3
      });
    }
  }
}
return {
  scenes: scenes,
  count: scenes.length,
  recipe_name: params.topic || '美食'
};
```

**输入：**
- script = {{AI分镜.script}}

**输出：**
- scenes (Array)
- count (Number)
- recipe_name (String)
