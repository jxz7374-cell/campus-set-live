/* ============================================================
 * 模块三：两人还能公选哪些课（CourseChoice.jsx）
 * 复用模块一选中的两位同学：
 *   已修并集 = A ∪ B（去重）
 *   可公选   = U − (A ∪ B)（补集）
 * VERDANT 浅色绿主题配色。
 * ============================================================ */
import { motion } from 'framer-motion'
import { Card, CardHeader, EmptyState } from './ui.jsx'
import { union, complement } from '../setops.js'

/* 固定的课程全集：即使没人选也保留，保证"可公选课程"有意义 */
const COURSE_POOL = ['高等数学','线性代数','大学英语','程序设计','数据结构','音乐鉴赏','心理学','电影欣赏','体育','舞蹈','军事理论','人工智能导论','网页设计','经济学原理']

export default function CourseChoice({ sel }) {
  const a = sel.a
  const b = sel.b

  const Stat = ({ label, value, accent }) => (
    <div className="rounded-xl border border-[#e0e8e2] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(23,58,43,.04)]">
      <div className="text-[10.5px] uppercase tracking-wider text-[#8a9990]">{label}</div>
      <div className={`font-mono text-[22px] font-bold ${accent || 'text-[#0e1d16]'}`}>{value}</div>
    </div>
  )

  return (
    <Card>
      <CardHeader
        index="03"
        title="两人还能公选哪些课"
        formula="U − (A ∪ B)"
        sub="先求两人已修课程的并集（去重），再从课程全集 U 中减去，剩下的就是可公选。"
      />
      <div className="px-6 pb-6">
        {!a || !b ? (
          <EmptyState title="先在模块 01 选择两位同学" desc="课程计算复用模块一选中的 A、B" />
        ) : (
          <div>
            <div className="mb-4 flex items-center gap-2 text-[12.5px] text-[#5b6b62]">
              同学 A · <span className="font-semibold text-[#2e7d5b]">{a.name}</span>
              <span className="mx-1 h-3 w-px bg-[#cddcd2]" />
              同学 B · <span className="font-semibold text-[#a06f35]">{b.name}</span>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-3">
              <Stat label="全部课程" value={COURSE_POOL.length} />
              <Stat label="已修并集" value={union(a.courses, b.courses).result.length} accent="text-[#a06f35]" />
              <Stat label="可公选" value={complement(COURSE_POOL, union(a.courses, b.courses).result).result.length} accent="text-[#2e7d5b]" />
            </div>

            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.025 } } }}
              className="grid grid-cols-2 gap-2"
            >
              {COURSE_POOL.map(c => {
                const taken = union(a.courses, b.courses).result.includes(c)
                return (
                  <motion.div
                    key={c}
                    variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                    className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-[13px] ${
                      taken
                        ? 'border-[#e6ece8] bg-[#f4f7f5] text-[#8a9990]'
                        : 'border-[#3f9c74]/40 bg-[#3f9c74]/[0.07] text-[#1f7a56] font-medium'
                    }`}
                  >
                    <span>{c}</span>
                    <span className="font-mono text-[10.5px]">{taken ? '已修' : '可选'}</span>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        )}
      </div>
    </Card>
  )
}
