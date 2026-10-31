# 校园集合实验室 · 现代产品版（可部署到公网）

数据结构课程设计的**动态网站**：学生名单存在后端数据库（`data/students.json`），
任何访问者看到的是**同一份数据**，可以在线**增添 / 删除学生**，所有人都能立即看到变化。

- 后端：Node.js + Express（`server.js`）
- 数据库：JSON 文件（`data/students.json`），零外部依赖，最适合小白
- 前端：React 18 + Vite + Tailwind CSS 4 + Motion 动效 + Three.js 3D 背景
  （深色科技风，Bento Grid 布局，玻璃质感，无粉紫）
- 集合运算（线性查找 / 交集 / 并集 / 补集）：前端手写实现（`src/setops.js`），
  与课程设计本体 C 程序 `public/src/set_collection.c` 是同一套算法
- 三个功能模块：
  - 01 找两人的共同好友（点选同学 A、B，展示各自的好友 / 选课 / 爱好档案）
  - 02 双条件同好筛选（两个兴趣交集）
  - 03 两人还能公选哪些课（课程全集 − 已修并集）

---

## 一、在自己电脑上先跑起来（5 分钟）

1. 打开命令行（Win 键 → 输入 `powershell` 回车）。
2. 进入本项目文件夹：

   ```powershell
   cd C:\Users\Thinkbook\DoubaoWork\chats\2026-10-17\new-chat-1\campus-set-live
   ```

3. 安装依赖（只需一次，约 1 分钟）：

   ```powershell
   npm install
   ```

4. 构建前端（把 React 源码打包成浏览器能直接运行的文件）：

   ```powershell
   npm run build
   ```

5. 启动网站：

   ```powershell
   npm start
   ```

6. 浏览器打开 <http://localhost:3000>，就能看到网站了。
   - 右上角「＋ 添加同学」可以在线增添学生（好友 / 选课 / 爱好用逗号分隔）；
     数据会保存到 `data/students.json`，刷新后所有访问者都能看到。
   - 01 模块点选学生：第一位标记为 A（蓝），第二位为 B（赭）；右侧档案区会
     展示这位同学的好友、已选课程与兴趣爱好。
   - 选中 A、B 后，03 模块自动计算两人还能一起选的课。
7. 要停止网站：在命令行按 `Ctrl + C`。

> 提示：想边开发边预览（改代码自动刷新），用 `npm run dev`，浏览器打开
> <http://localhost:5173>（它会自动转发数据请求到 3000 端口的后端）。
> 正式部署 / 给别人看，用上面的 `npm run build && npm start`。

---

## 二、部署到公网（免费平台，二选一）

> 免费平台启动服务后会给你一个 `https://xxx.onrender.com`（或 `.up.railway.app`）
> 这样的公网链接，任何人打开都能用，不需要装任何东西。

### 方式 A：Render（推荐，免费额度够用）

1. 注册：打开 <https://render.com> → Sign Up → 用 GitHub 账号注册最省事。
2. 先把本项目文件夹推到一个 GitHub 仓库（不会 Git 的话按第 4 节做，或用
   下面"没有 GitHub"的替代方式）。注意：**打包时不要上传 node_modules 文件夹**。
3. 在 Render 后台：New → Web Service → 连接你的 GitHub 仓库。
4. 填三个关键项（其他默认即可）：

   | 选项 | 填什么 |
   |---|---|
   | Name | `campus-set-live` |
   | Root Directory | `campus-set-live`（仓库根目录是它时填 `/`） |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm start` |

5. 选免费实例：Instance Type 选 **Free** → Create Web Service。
6. 等 1~3 分钟，状态变 **Live** 后，点击顶部的链接（形如
   `https://campus-set-live.onrender.com`），公网网站就上线了。

### 方式 B：Railway（免费额度，每月 5 美元额度基本够用）

1. 注册：<https://railway.com> → 用 GitHub 注册。
2. 项目里点 **New Project** → **Deploy from GitHub repo** → 选你的仓库。
3. 它会自动识别 `package.json`。如果没有自动执行构建，在 Settings 里把
   Build Command 设为 `npm install && npm run build`、Start Command 设为 `npm start`。
4. 部署完成后点 **View Logs** 看是否正常，然后点 **Generate Domain**（或 Settings →
   Networking → Generate Domain）拿到公网链接（形如 `https://xxx.up.railway.app`）。

---

## 三、没有 GitHub？用 Render 的"上传文件夹"替代

- Render 在 New Web Service 时如果不想用 GitHub，可以先把项目打包成 zip
  （**排除 node_modules**），再找一个支持 zip 上传的平台（如 **Koyeb**、**Fly.io**
  或国内的**宝塔面板 + 云服务器**）。
- 也可以直接用**腾讯云 / 阿里云轻量服务器**：把整个文件夹上传到服务器，
  装好 Node.js 后在里面执行 `npm install && npm run build && npm start`，
  再在防火墙放行 3000 端口，用 Nginx 反向代理到 80 端口
  （服务器商后台都有"宝塔面板"图形界面可选，非常方便）。

---

## 四、给小白的 Git 速查（可选）

如果你从没建过 GitHub 仓库：

```powershell
git init
git add .
git commit -m "campus set live"
# 然后去 github.com 新建仓库，按页面提示把地址填进来，例如：
git remote add origin https://github.com/你的用户名/campus-set-live.git
git push -u origin main
```

---

## 五、数据持久化说明（重要）

- 免费平台（Render / Railway 的 Free 档）**重启后会把数据还原成仓库里的
  `data/students.json`**，即回到 7 位种子同学——这是免费套餐的正常行为，
  不是程序 bug。
- 想永久保存：Render 后台给服务挂一个 **Disk（付费）** 并设置
  `DATA_DIR=/opt/render/project/src/data`（改环境变量 `DATA_DIR` 即可），
  或者以后换成免费版 SQLite / 云数据库。
- 本课程设计演示用 JSON 文件已经足够，答辩前把数据调好、正常展示即可。

---

## 六、项目文件结构

```
campus-set-live/
├── server.js              # 后端入口：静态文件 + 学生增删查 API + 数据读写
├── package.json           # 项目配置（npm start = node server.js）
├── vite.config.js         # 前端构建配置（开发端口 5173，代理 API 到 3000）
├── index.html             # React 页面外壳（Vite 入口）
├── data/
│   └── students.json      # 数据库：学生名单（可被网站读写）
├── src/                   # React 前端源码
│   ├── main.jsx           # 入口：挂载 App
│   ├── App.jsx            # 页面骨架：顶栏 + Hero + 三模块网格 + 弹窗
│   ├── api.js             # 调后端接口：读取 / 新增 / 删除学生
│   ├── setops.js          # 手写集合运算：线性查找 / 交集 / 并集 / 补集（与 C 同算法）
│   ├── index.css          # Tailwind 4 主题：深色令牌、噪点、渐变网格、玻璃卡
│   └── components/
│       ├── ui.jsx               # 设计系统组件：Button / Card / Badge / Modal / Toast…
│       ├── ThreeBackground.jsx  # Three.js 3D 粒子 + 光球氛围背景
│       ├── CommonFriends.jsx    # 01 共同好友（学生列表 + 档案 + 交集结果）
│       ├── DualMatch.jsx        # 02 双条件同好筛选
│       ├── CourseChoice.jsx     # 03 可公选课程（并集 + 补集）
│       └── AddStudentModal.jsx  # 添加学生弹窗
├── public/
│   └── src/
│       └── set_collection.c    # 课程设计 C 源码（网页可直接下载）
└── README.md              # 本文件
```

---

## 七、接口说明（答辩时可能被问到）

| 方法 | 地址 | 作用 | 示例 |
|---|---|---|---|
| GET | `/api/students` | 读取全部学生 | `GET /api/students` |
| POST | `/api/students` | 新增学生 | body: `{"name":"周雨","friends":["林晓"],"courses":["数据结构"],"tags":["篮球"]}` |
| DELETE | `/api/students/:id` | 删除学生 | `DELETE /api/students/1001` |

测试方式（本地跑起来后在浏览器地址栏直接试）：

```
http://localhost:3000/api/students
```

---

## 八、为什么"不是静态网站"

- 静态网站：网页文件固定不变，谁访问都看到同一份写死的名单，无法在线改动。
- 本网站有**后端服务（server.js）**：新增 / 删除学生时，请求发给后端，
  后端写入 `data/students.json`，之后任何人刷新都会看到新数据。
- 前端 React 只是"界面"，真正的"数据大脑"是后端 —— 这就是动态网站，
  也因此能部署在 Render / Railway 这类 Node.js 平台上。
