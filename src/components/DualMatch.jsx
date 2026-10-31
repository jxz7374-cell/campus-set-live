/* ============================================================
 * 模块二：同时满足两个兴趣的同好（DualMatch.jsx）
 * 对每位同学的兴趣列表做"多集合交集"：
 *   标签 ∩ 条件1 ∩ 条件2，同时命中才入选
 * VERDANT 浅色绿主题配色。
 * ============================================================ */
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, Badge, Button, EmptyState } from './ui.jsx'
import { linearFind } from '../setops.js'

export default function DualMatch({ students }) {
  const allTags = useMemo(() => [...new Set(students.flatMap(s => s.tags))], [students])
  const [c1, setC1] = useState(allTags[0] || '')
  const [c2, setC2] = useState(allTags[1] || allTags[0] || '')
  const [ran, setRan] = useState(false)

  const matched = useMemo(() => {
    if (!ran || !c1 || !c2) return null
    let compares = 0
    const hits = students.filter(s => {
      const r1 = linearFind(s.tags, c1); compares += r1.compares
      const r2 = linearFind(s.tags, c2); compares += r2.compares
      return r1.found && r2.found
    })
    return { hits, compares }
  }, [students, c1, c2, ran])

  return (
    <Card>
      <CardHeader
        index="02"
        title="双条件同好筛选"
        formula="标签 ∩ 条件1 ∩ 条件2"
        sub="选定两个兴趣，同时具备两者的人才入选。"
      />
      <div className="px-6 pb-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={c1}
            onChange={e => { setC1(e.target.value); setRan(false) }}
            className="rounded-lg border border-[#dde6e0] bg-white px-3 py-2 text-[13px] text-[#0e1d16] outline-none transition-colors focus:border-[#2e7d5b]/60"
          >
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className="font-mono text-[11px] text-[#8a9990]">∩</span>
          <select
            value={c2}
            onChange={e => { setC2(e.target.value); setRan(false) }}
            className="rounded-lg border border-[#dde6e0] bg-white px-3 py-2 text-[13px] text-[#0e1d16] outline-none transition-colors focus:border-[#2e7d5b]/60"
          >
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <Button onClick={() => setRan(true)} disabled={!c1 || !c2}>筛选同好</Button>
        </div>

        {!matched ? (
          <EmptyState title="选择两个兴趣后点击筛选" />
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            className="mt-5"
          >
            <div className="mb-3 font-mono text-[11.5px] text-[#8a9990]">
              共比较 {matched.compares} 次，命中 {matched.hits.length} 位同好
            </div>
            <div className="space-y-2">
              {matched.hits.length === 0 && <EmptyState title="没有同时具备两个条件的同学" />}
              {matched.hits.map(s => (
                <motion.div
                  key={s.id}
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  className="flex items-center gap-3 rounded-xl border border-[#3f9c74]/35 bg-[#3f9c74]/[0.07] px-4 py-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3f9c74] text-[12.5px] font-bold text-white">
                    {s.name[0]}
                  </div>
                  <span className="text-[13.5px] font-semibold text-[#0e1d16]">{s.name}</span>
                  <div className="ml-auto flex flex-wrap gap-1.5">
                    {s.tags.map(t => (
                      <Badge key={t} tone={t === c1 || t === c2 ? 'hit' : 'tag'}>{t}</Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  )
}
