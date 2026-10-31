/* ============================================================
 * 应用根组件（App.jsx）
 * 页面结构（参考视频开头 VERDANT 品牌页的产品级排版）：
 *   1. Three.js 3D 背景（旋转绿环 + 粒子）+ 淡绿光晕
 *   2. 极简顶栏（品牌 + 锚点导航 + 添加同学按钮）
 *   3. Hero：眉标 + 超大标题（两行） + 副文案 + 双行动按钮
 *   4. Bento Grid（01 共同好友大卡 | 02 双条件 + 03 可公选课程）
 *   5. 添加学生弹窗 + Toast 提示
 * ============================================================ */
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ThreeBackground from './components/ThreeBackground.jsx'
import CommonFriends from './components/CommonFriends.jsx'
import DualMatch from './components/DualMatch.jsx'
import CourseChoice from './components/CourseChoice.jsx'
import AddStudentModal from './components/AddStudentModal.jsx'
import { Button, Toast } from './components/ui.jsx'
import { fetchStudents, createStudent, deleteStudent } from './api.js'

/* ---------- 3D 旋转绿色圆环装饰 ----------
 * 仿视频开头 VERDANT 页面的绿环：
 * 用 CSS 3D 旋转（不依赖 WebGL），内外双环反向旋转。
 * 放在 Hero 右侧，作为氛围装饰，不遮挡文字。
 */
function GreenRing() {
  return (
    <div className="pointer-events-none absolute right-[2%] top-1/2 hidden -translate-y-[58%] lg:block" aria-hidden="true">
      <div className="ring-3d">
        {/* 外环：墨绿，带刻度短线，随整组一起转 */}
        <svg className="ring-outer" viewBox="0 0 340 340" fill="none">
          <circle cx="170" cy="170" r="150" stroke="#2e7d5b" strokeWidth="2.5" strokeOpacity="0.55" />
          <circle cx="170" cy="170" r="150" stroke="#2e7d5b" strokeWidth="8" strokeOpacity="0.12" strokeDasharray="6 22" />
          <circle cx="170" cy="170" r="122" stroke="#3f9c74" strokeWidth="1.5" strokeOpacity="0.35" strokeDasharray="3 14" />
        </svg>
        {/* 内环：翠绿细环 + 四个轨道光点（反向旋转） */}
        <svg className="ring-inner" viewBox="0 0 340 340" fill="none">
          <circle cx="170" cy="170" r="96" stroke="#3f9c74" strokeWidth="2" strokeOpacity="0.55" />
          {[0, 90, 180, 270].map(deg => {
            const a = deg * Math.PI / 180
            return (
              <circle
                key={deg}
                cx={170 + Math.cos(a) * 96}
                cy={170 + Math.sin(a) * 96}
                r="7"
                fill="#2e7d5b"
                fillOpacity="0.85"
              />
            )
          })}
        </svg>
        {/* 中心圆核：呼吸缩放 */}
        <svg className="ring-core" viewBox="0 0 340 340" fill="none">
          <circle cx="170" cy="170" r="18" fill="#2e7d5b" fillOpacity="0.55" />
          <circle cx="170" cy="170" r="9" fill="#3f9c74" fillOpacity="0.9" />
        </svg>
      </div>
    </div>
  )
}

export default function App() {
  const [students, setStudents] = useState([])         // 全部学生
  const [sel, setSel] = useState({ a: null, b: null }) // 模块一选中的 A / B
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [loaded, setLoaded] = useState(false)

  /* 从后端加载名单（初次进入、增删成功后都会调用） */
  const load = useCallback(async () => {
    try {
      const list = await fetchStudents()
      setStudents(list)
      setSel(prev => ({
        a: list.some(s => prev.a && s.id === prev.a.id) ? prev.a : null,
        b: list.some(s => prev.b && s.id === prev.b.id) ? prev.b : null
      }))
    } catch (e) {
      setToast({ type: 'error', message: '无法连接服务器，请确认后端已启动' })
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const notify = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 2600)
  }

  /* 新增学生 */
  const handleCreate = async payload => {
    try {
      await createStudent(payload)
      notify('ok', `已加入 ${payload.name}，写入数据库，所有访问者可见`)
      load()
    } catch (e) {
      notify('error', e.message)
      throw e
    }
  }

  /* 删除学生 */
  const handleDelete = async student => {
    if (!window.confirm(`确定删除 ${student.name} 吗？`)) return
    try {
      await deleteStudent(student.id)
      notify('ok', `已删除 ${student.name}`)
      load()
    } catch (e) {
      notify('error', e.message)
    }
  }

  /* 点选 / 取消 A、B：先 A 后 B，再点取消 */
  const handleSelect = student => {
    setSel(prev => {
      if (prev.a && prev.a.id === student.id) return { ...prev, a: null }
      if (prev.b && prev.b.id === student.id) return { ...prev, b: null }
      if (!prev.a) return { ...prev, a: student }
      if (!prev.b) return { ...prev, b: student }
      return { ...prev, b: student }
    })
  }

  const openCourses = new Set(students.flatMap(s => s.courses)).size

  return (
    <div className="noise relative min-h-screen">
      {/* 3D 背景 + 渐变光晕 */}
      <ThreeBackground />
      <div className="gradient-mesh" />

      {/* ===== 极简顶栏（仿 VERDANT 导航） ===== */}
      <header className="sticky top-0 z-30 border-b border-[#e3eae5] bg-[#fbfcf9]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2e7d5b] font-mono text-[14px] font-bold text-white">∪</span>
            <span className="text-[15px] font-bold tracking-tight text-[#0e1d16]">校园集合实验室</span>
          </div>
          <nav className="ml-auto hidden items-center gap-1 text-[13px] text-[#5b6b62] md:flex">
            <a href="#m1" className="rounded-md px-3 py-1.5 hover:bg-[#eef3ef] hover:text-[#2e7d5b] transition-colors">共同好友</a>
            <a href="#m2" className="rounded-md px-3 py-1.5 hover:bg-[#eef3ef] hover:text-[#2e7d5b] transition-colors">双条件同好</a>
            <a href="#m3" className="rounded-md px-3 py-1.5 hover:bg-[#eef3ef] hover:text-[#2e7d5b] transition-colors">可公选课程</a>
          </nav>
          <Button variant="accent" onClick={() => setModalOpen(true)} className="ml-auto md:ml-4 px-4 py-2">＋ 添加同学</Button>
        </div>
      </header>

      {/* ===== Hero（VERDANT 式：眉标 + 超大标题 + 副文案 + 双按钮） ===== */}
      <section className="relative mx-auto max-w-[1200px] px-6 pt-16 pb-12">
        {/* 3D 旋转绿环：Hero 右侧氛围装饰 */}
        <GreenRing />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* 眉标（仿 "NATURE. SCIENCE. FUTURE"） */}
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-full border border-[#2e7d5b]/30 bg-white px-3 py-1 font-mono text-[11px] tracking-[0.08em] text-[#2e7d5b]">
              DATA STRUCTURE · SET OPERATIONS
            </span>
            <span className="hidden items-center gap-2 text-[11px] text-[#8a9990] sm:flex">
              <span className="h-1 w-1 rounded-full bg-[#3f9c74]" /> 顺序表 / 交集 / 并集 / 补集
            </span>
          </div>

          {/* 超大标题：两行，第二行绿→金渐变 */}
          <h1 className="hero-title">
            顺序表上的集合运算
            <br />
            <span className="grad">共同好友与选课匹配</span>
          </h1>

          <p className="mt-5 max-w-[600px] text-[15px] leading-relaxed text-[#5b6b62]">
            用顺序表存储每个人的好友、选课与兴趣，手写线性查找与交、并、补集运算。
            点选两位同学，算出他们的共同好友、双条件同好，以及还能一起选的课。
          </p>

          {/* 双行动按钮（仿 JOIN WAITLIST / GET STARTED） */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => document.getElementById('m1')?.scrollIntoView({ behavior: 'smooth' })} className="px-5 py-2.5">
              开始匹配 → 
            </Button>
            <a
              href="/src/set_collection.c"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#cddcd2] bg-white px-4 py-2.5 text-[13px] text-[#2e5c45] hover:border-[#a8c8b6] hover:bg-[#f4f9f6] transition-colors"
            >
              查看课程设计 C 源码
            </a>
          </div>

          {/* 数据徽标行 */}
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-4 rounded-xl border border-[#e3eae5] bg-white px-5 py-3 shadow-[0_1px_2px_rgba(23,58,43,.04)]">
              <div>
                <div className="font-mono text-[22px] font-bold text-[#0e1d16]">{loaded ? students.length : '—'}</div>
                <div className="text-[10.5px] uppercase tracking-wider text-[#8a9990]">在册同学</div>
              </div>
              <div className="h-8 w-px bg-[#e3eae5]" />
              <div>
                <div className="font-mono text-[22px] font-bold text-[#0e1d16]">{loaded ? openCourses : '—'}</div>
                <div className="text-[10.5px] uppercase tracking-wider text-[#8a9990]">开课门数</div>
              </div>
              <div className="h-8 w-px bg-[#e3eae5]" />
              <div>
                <div className="font-mono text-[22px] font-bold text-[#2e7d5b]">{loaded ? 3 : '—'}</div>
                <div className="text-[10.5px] uppercase tracking-wider text-[#8a9990]">运算模块</div>
              </div>
            </div>
            <span className="font-mono text-[11px] tracking-wide text-[#8a9990]">
              ALGORITHMS WRITTEN BY HAND · SAME AS set_collection.c
            </span>
          </div>
        </motion.div>
      </section>

      {/* ===== Bento Grid ===== */}
      <main className="mx-auto max-w-[1200px] px-6 pb-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="grid grid-cols-12 gap-5"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }} className="col-span-12 lg:col-span-7" id="m1">
            <CommonFriends students={students} sel={sel} onSelect={handleSelect} onDelete={handleDelete} />
          </motion.div>
          <div className="col-span-12 space-y-5 lg:col-span-5">
            <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }} id="m2">
              <DualMatch students={students} />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }} id="m3">
              <CourseChoice sel={sel} />
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* ===== 页脚 ===== */}
      <footer className="border-t border-[#e3eae5] py-8">
        <div className="mx-auto max-w-[1200px] px-6 text-center text-[12px] text-[#8a9990]">
          校园集合实验室 · 数据结构课程设计 · 顺序表 / 交集 / 并集 / 补集
          <span className="mx-2 text-[#cddcd2]">·</span>
          算法手写实现，与 C 程序 set_collection.c 同源
        </div>
      </footer>

      {/* ===== 添加学生弹窗 ===== */}
      <AddStudentModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} />

      {/* ===== Toast ===== */}
      <AnimatePresence>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </AnimatePresence>
    </div>
  )
}
