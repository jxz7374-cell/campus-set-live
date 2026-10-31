/* ============================================================
 * 校园集合实验室 · 现代产品版 服务器（server.js）
 * ------------------------------------------------------------
 * 这个文件是整个网站的"大脑"（后端），它负责：
 *   1. 提供网页文件（dist 文件夹：React 前端 npm run build 的产物）
 *   2. 提供一套"接口（API）"给网页调用：
 *        GET    /api/students     -> 读取全部学生名单
 *        POST   /api/students     -> 新增一位学生
 *        DELETE /api/students/:id -> 删除一位学生
 *   3. 把学生数据保存到 data/students.json 文件里
 *      （这就是"数据库"，所有访问者看到的是同一份数据）
 *
 * 为什么用 Node.js + Express？
 *   - 免费托管平台（Render / Railway）原生支持 Node.js，部署最简单
 *   - Express 是最流行的轻量框架，代码短、注释清楚，适合初学者看懂
 *
 * 课程设计本体（C 语言的顺序表集合运算）没有被替代：
 *   网页前端仍用手写的线性查找 / 交集 / 并集 / 补集逻辑，
 *   与 C 程序（src/set_collection.c）是同一套算法。
 * ============================================================ */

/* ---------- 第 1 步：引入需要用到的工具 ---------- */
import express from 'express';   // Web 框架：帮我们处理"网页请求"
import path from 'path';         // Node 自带的路径工具
import fs from 'fs';             // Node 自带的文件工具（读写 JSON 数据库用）
import { fileURLToPath } from 'url';

// 本项目 package.json 用的是 ESM 规范（"type": "module"），
// 所以这里用 import 而不是 require；__dirname 需要自己换算：
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ---------- 第 2 步：创建应用对象、设置端口 ---------- */
const app = express();                // 创建服务器应用
const PORT = process.env.PORT || 3000;
// 上面的写法：优先用环境变量 PORT（免费平台会自动分配一个端口号给你），
// 在你自己电脑上运行时没有这个变量，就用 3000 端口。

/* 数据文件的位置：data/students.json（和 server.js 在同一个文件夹）。
 * 也可以用环境变量 DATA_DIR 指定其他位置（付费挂盘持久化时有用）。 */
const DATA_DIR  = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'students.json');

/* 让服务器能解析网页发来的 JSON 数据（新增学生时要用） */
app.use(express.json());

/* ---------- 第 3 步：读取 / 保存数据的小函数 ---------- */
/* 确保数据文件夹存在（挂盘或首次运行时目录可能还不存在） */
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/* 读数据库：把 students.json 的内容读进来，转成 JS 对象 */
function readStudents() {
  try {
    // fs.readFileSync 是"同步读取"，出错时会 throw（抛异常）
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);        // JSON 文本 -> JS 对象
    return data.students || [];          // 取出学生数组
  } catch (e) {
    // 文件不存在或损坏时，返回空名单（不会让网站崩溃）
    return [];
  }
}

/* 写数据库：把最新名单保存回 students.json（覆盖写入） */
function writeStudents(list) {
  // JSON.stringify(obj, null, 2) 第 3 个参数 2 表示缩进 2 个空格，文件更易读
  fs.writeFileSync(DATA_FILE, JSON.stringify({ students: list }, null, 2), 'utf8');
}

/* 生成一个不重复的 id（用当前时间戳，足够唯一） */
function newId() {
  return Date.now().toString();
}

/* ---------- 第 4 步：提供前端页面（dist 文件夹） ---------- */
/* React 前端构建后生成 dist/，访问网站根地址 / 时自动打开 dist/index.html。
 * 本地开发时可以先用 `npm run dev`（Vite 自带页面），部署/本地完整运行用 `npm start`。 */
const DIST_DIR = path.join(__dirname, 'dist');
/* 提供 dist 里的静态文件。
 * setHeaders：在返回文件前，给特定类型的文件补一个"响应头"。
 * 为什么要这段？.c 源码文件里有中文注释，默认情况下浏览器不知道它是
 * UTF-8 编码，会按系统编码（GBK）去猜，中文就变成一串问号乱码。
 * 这里明确告诉浏览器：.c 文件按 UTF-8 文本读取，中文注释就正常了。 */
app.use(express.static(DIST_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.c')) {
      if (filePath.includes('_GBK版')) {
        // 带下划线后缀的是给老 Dev-C++ 用的 GBK 备份，按 GBK 声明
        res.setHeader('Content-Type', 'text/plain; charset=gbk');
      } else {
        // 主源码文件已转为 UTF-8，按 UTF-8 解码，任何浏览器/平台中文都正常
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      }
    }
  }
}));

/* ---------- 第 5 步：提供 API（接口） ---------- */

/* 5.1 查询全部学生：GET /api/students */
app.get('/api/students', (req, res) => {
  res.json({ ok: true, students: readStudents() });
});

/* 5.2 新增一位学生：POST /api/students
 * 网页发来的格式：{ "name": "周雨", "friends": [...], "courses": [...], "tags": [...] } */
app.post('/api/students', (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();   // 姓名必须填

  // 校验：姓名不能为空
  if (!name) {
    return res.status(400).json({ ok: false, message: '姓名不能为空。' });
  }
  // 校验：不能重名（集合里的元素不允许重复，名单里的学生也一样）
  const list = readStudents();
  if (list.some(s => s.name === name)) {
    return res.status(400).json({ ok: false, message: '名单里已经有「' + name + '」了。' });
  }

  // 拼出完整的学生对象，追加到名单末尾
  const student = {
    id: newId(),
    name: name,
    friends: Array.isArray(body.friends) ? body.friends : [],
    courses: Array.isArray(body.courses) ? body.courses : [],
    tags:    Array.isArray(body.tags)    ? body.tags    : []
  };
  list.push(student);
  writeStudents(list);
  res.json({ ok: true, student: student });   // 把新学生回给网页
});

/* 5.3 删除一位学生：DELETE /api/students/:id
 *（方便你删掉测试时加错的同学；:id 是网址里的学生编号） */
app.delete('/api/students/:id', (req, res) => {
  const id = req.params.id;
  const list = readStudents();
  const next = list.filter(s => s.id !== id);   // 留下所有 id 不相等的人
  if (next.length === list.length) {
    return res.status(404).json({ ok: false, message: '没有找到这位学生。' });
  }
  writeStudents(next);
  res.json({ ok: true });
});

/* ---------- 第 5.5 步：单页应用回退（必须放在 API 之后） ----------
 * 前端是单页应用（SPA）：除了 /api 开头的接口请求，
 * 其他未知路径都返回 index.html，让 React 自己接管路由。
 * 注意：这条通配路由必须写在所有 API 路由后面，否则会拦截 /api 请求。 */
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

/* ---------- 第 6 步：启动服务器，让网站跑起来 ---------- */
app.listen(PORT, () => {
  console.log('校园集合实验室 动态版已启动：http://localhost:' + PORT);
});
