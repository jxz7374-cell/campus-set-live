/* ============================================================
 * 模块一：找两人的共同好友（CommonFriends.jsx）· 核心模块
 * ------------------------------------------------------------
 * 左栏：全部同学卡片（点第一位=A 绿，第二位=B 赭，再点取消）
 * 右栏：选中同学的完整档案（好友 / 已选课程 / 兴趣爱好）
 * 底部：A ∩ B 的共同好友结果 + 环形图（仅A / 共同 / 仅B）
 * VERDANT 浅色绿主题配色。
 * ============================================================ */
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, Badge, EmptyState } from './ui.jsx'
import { intersect } from '../setops.js'

/* ---------- 左栏：单张学生卡片 ---------- */
function StudentTile({ s, role, onSelect, onDelete, deleting }) {
  const styles = {
    undefined: 'border-[#e0e8e2] bg-white hover:border-[#2e7d5b]/50 hover:bg-[#f4f9f6]',
    a: 'border-[#2e7d5b]/70 bg-[#2e7d5b]/[0.07]',
    b: 'border-[#c08a4e]/70 bg-[#c08a4e]/[0.08]',
  }
  const chip = {
    undefined: 'bg-[#eef3ef] text-[#4c6a5b]',
    a: 'bg-[#2e7d5b] text-white',
    b: 'bg-[#c08a4e] text-white',
  }
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .3, ease: [0.22, 1, 0.36, 1] }}
      onClick={onSelect}
      className={`relative w-full rounded-xl border px-3 py-2.5 text-left shadow-[0_1px_2px_rgba(23,58,43,.04)] transition-all duration-200 ${styles[role]}`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold ${role === 'a' ? 'bg-[#2e7d5b] text-white' : role === 'b' ? 'bg-[#c08a4e] text-white' : 'bg-[#eef3ef] text-[#4c6a5b]'}`}>
          {s.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-[#0e1d16]">{s.name}</span>
            {role && (
              <span className={`rounded px-1.5 py-px font-mono text-[9.5px] font-bold ${chip[role]}`}>
                {role.toUpperCase()}
              </span>
            )}
          </div>
          <div className="mt-0.5 font-mono text-[10.5px] text-[#8a9990]">
            好友 {s.friends.length} · 选课 {s.courses.length} · 爱好 {s.tags.length}
          </div>
        </div>
        <span
          role="button"
          onClick={e => { e.stopPropagation(); onDelete(s) }}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] transition-colors ${
            deleting ? 'pointer-events-none opacity-40' : 'text-[#8a9990] hover:bg-[#c08a4e]/15 hover:text-[#a06f35]'
          }`}
          title="删除这位同学"
        >
          ✕
        </span>
      </div>
    </motion.button>
  )
}

/* ---------- 右栏：选中同学的档案 ---------- */
function ProfilePanel({ title, student, accent }) {
  const border = accent === 'a' ? 'border-[#2e7d5b]/35' : 'border-[#c08a4e]/40'
  const name = accent === 'a' ? 'text-[#2e7d5b]' : 'text-[#a06f35]'
  const chipBg = accent === 'a' ? 'bg-[#2e7d5b] text-white' : 'bg-[#c08a4e] text-white'

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-[0_1px_2px_rgba(23,58,43,.04)] ${border}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`flex h-6 items-center justify-center rounded px-1.5 font-mono text-[10.5px] font-bold ${chipBg}`}>
          {accent.toUpperCase()}
        </span>
        <span className={`text-[14px] font-bold ${name}`}>{title}</span>
      </div>

      {[
        { label: '好友', value: student.friends, tone: 'a' },
        { label: '已选课程', value: student.courses, tone: 'tag' },
        { label: '兴趣爱好', value: student.tags, tone: 'tag' },
      ].map(row => (
        <div key={row.label} className="mb-2.5 last:mb-0">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-[#8a9990]">{row.label}</div>
          <div className="flex flex-wrap gap-1.5">
            {row.value.length === 0 && <span className="text-[11.5px] text-[#8a9990]">暂无</span>}
            {row.value.map(v => (
              <Badge key={v} tone={row.tone}>{v}</Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- 共同好友结果 + 环形图 ---------- */
function CommonResult({ a, b }) {
  const common = useMemo(() => {
    let compares = 0
    const r = intersect(a.friends, b.friends)
    compares += r.compares
    const onlyA = a.friends.filter(x => !r.result.includes(x))
    const onlyB = b.friends.filter(x => !r.result.includes(x))
    return { common: r.result, onlyA, onlyB, compares }
  }, [a, b])

  const row = (list, label, tone) => (
    <div className="flex items-center gap-2 text-[12.5px]">
      <span className="w-14 shrink-0 text-[#8a9990]">{label}</span>
      <div className="flex flex-1 flex-wrap gap-1.5">
        {list.length === 0 && <span className="text-[11.5px] text-[#b9c6be]">—</span>}
        {list.map(x => <Badge key={x} tone={tone}>{x}</Badge>)}
      </div>
    </div>
  )

  const total = Math.max(common.onlyA.length + common.common.length + common.onlyB.length, 1)
  const seg = [
    { label: '仅 A', n: common.onlyA.length, color: '#2e7d5b' },
    { label: '共同', n: common.common.length, color: '#3f9c74' },
    { label: '仅 B', n: common.onlyB.length, color: '#c08a4e' },
  ].filter(s => s.n > 0)
  const c1 = 25 * Math.PI * 2
  let acc = 0
  const arcs = seg.map(s => {
    const off = (acc / total) * c1
    const len = (s.n / total) * c1
    acc += s.n
    return { ...s, off, len }
  })

  return (
    <div className="mt-4 rounded-xl border border-[#e0e8e2] bg-white p-4 shadow-[0_1px_2px_rgba(23,58,43,.04)]">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="text-[12.5px] font-semibold text-[#0e1d16]">共同好友</span>
        <span className="rounded-md bg-[#2e7d5b]/[0.12] px-2 py-0.5 font-mono text-[15px] font-bold text-[#2e7d5b]">
          {common.common.length}
        </span>
        <span className="ml-auto font-mono text-[10.5px] text-[#8a9990]">比较 {common.compares} 次</span>
      </div>

      <div className="flex items-center gap-5">
        <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0">
          <circle cx="50" cy="50" r="25" fill="none" stroke="#e3eae5" strokeWidth="12" />
          {arcs.map(s => (
            <circle
              key={s.label}
              cx="50" cy="50" r="25" fill="none"
              stroke={s.color} strokeWidth="12"
              strokeDasharray={`${s.len} ${c1 - s.len}`}
              strokeDashoffset={-s.off}
              strokeLinecap="butt"
              transform="rotate(-90 50 50)"
            />
          ))}
        </svg>

        <div className="min-w-0 flex-1 space-y-2">
          {row(common.onlyA, '仅 A', 'a')}
          {row(common.common, '共同', 'hit')}
          {row(common.onlyB, '仅 B', 'b')}
        </div>
      </div>
    </div>
  )
}

/* ---------- 模块一主体 ---------- */
export default function CommonFriends({ students, sel, onSelect, onDelete }) {
  return (
    <Card className="p-0">
      <CardHeader
        index="01"
        title="找两人的共同好友"
        formula="A ∩ B"
        sub="点击同学：第一位标记为 A（绿），第二位为 B（赭）。选中后右侧会展示这位同学的好友、选课与爱好档案。"
      />
      <div className="grid gap-4 px-6 pb-6 lg:grid-cols-[minmax(0,16rem)_1fr]">
        <div className="space-y-2.5">
          {students.map(s => (
            <StudentTile
              key={s.id}
              s={s}
              role={sel.a && sel.a.id === s.id ? 'a' : sel.b && sel.b.id === s.id ? 'b' : undefined}
              onSelect={() => onSelect(s)}
              onDelete={onDelete}
            />
          ))}
        </div>

        <div className="space-y-4">
          {sel.a && sel.b ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ProfilePanel title={sel.a.name} student={sel.a} accent="a" />
                <ProfilePanel title={sel.b.name} student={sel.b} accent="b" />
              </div>
              <CommonResult a={sel.a} b={sel.b} />
            </>
          ) : (
            <EmptyState
              title={sel.a ? '再点一位同学作为 B' : '先在上方选择两位同学'}
              desc="点第一位同学标记为 A（绿），再点第二位标记为 B（赭）"
            />
          )}
        </div>
      </div>
    </Card>
  )
}
