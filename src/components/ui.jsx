/* ============================================================
 * 设计系统组件（ui.jsx）
 * ------------------------------------------------------------
 * 一套风格统一的"积木"组件：按钮、卡片、标签、输入框、
 * 弹窗、提示。VERDANT 浅色高级主题：白卡 + 墨绿 + 轻阴影。
 * ============================================================ */
import { motion } from 'framer-motion'

/* ---------- 按钮 ---------- */
export function Button({ children, onClick, className = '', disabled, variant = 'primary' }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 select-none disabled:opacity-45 disabled:pointer-events-none'
  const styles = {
    primary: 'bg-[#2e7d5b] text-white hover:bg-[#276a4e] hover:shadow-[0_6px_20px_rgba(46,125,91,.28)] active:scale-[.98]',
    accent:  'bg-[#2e7d5b] text-white hover:bg-[#276a4e] active:scale-[.98]',
    soft:    'border border-[#d5e2da] bg-white text-[#2e5c45] hover:border-[#b3cdbd] hover:bg-[#f4f9f6] active:scale-[.98]',
  }
  return (
    <button className={`${base} ${styles[variant]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

/* ---------- 卡片（白色玻璃容器） ---------- */
export function Card({ children, className = '' }) {
  return (
    <div className={`glass rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

/* ---------- 卡片头部：编号 + 标题 + 公式 + 说明 ---------- */
export function CardHeader({ index, title, formula, sub }) {
  return (
    <div className="px-6 pt-5 pb-4">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2e7d5b]/[0.10] font-mono text-[12.5px] font-bold text-[#2e7d5b]">
          {index}
        </span>
        <h2 className="text-[16px] font-bold tracking-tight text-[#0e1d16]">{title}</h2>
        {formula && (
          <span className="ml-auto rounded-md border border-[#2e7d5b]/25 bg-[#2e7d5b]/[0.06] px-2 py-1 font-mono text-[11.5px] text-[#2e7d5b]">
            {formula}
          </span>
        )}
      </div>
      {sub && <p className="mt-2 text-[12.5px] leading-relaxed text-[#5b6b62]">{sub}</p>}
    </div>
  )
}

/* ---------- 标签 ---------- */
export function Badge({ children, tone = 'tag' }) {
  const tones = {
    tag:   'bg-[#eef3ef] text-[#4c6a5b]',
    a:     'bg-[#2e7d5b]/[0.12] text-[#2e7d5b]',
    b:     'bg-[#c08a4e]/[0.14] text-[#a06f35]',
    hit:   'bg-[#3f9c74]/[0.14] text-[#1f7a56]',
  }
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

/* ---------- 输入框 ---------- */
export function Input({ placeholder, value, onChange }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[#dde6e0] bg-white px-3.5 py-2.5 text-[13px] text-[#0e1d16] placeholder:text-[#8a9990] outline-none transition-colors focus:border-[#2e7d5b]/60 focus:bg-white"
    />
  )
}

/* ---------- 空状态 ---------- */
export function EmptyState({ title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#cddcd2] bg-[#f4f8f5] px-6 py-8 text-center">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[16px] text-[#8a9990] shadow-sm">
        ∅
      </div>
      <div className="text-[13px] font-semibold text-[#3d5546]">{title}</div>
      {desc && <div className="mt-1 text-[11.5px] text-[#8a9990]">{desc}</div>}
    </div>
  )
}

/* ---------- 弹窗（Modal）：遮罩 + 居中卡片 ---------- */
export function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0e1d16]/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: .98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .28, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-2xl border border-[#e3eae5] bg-white p-6 shadow-[0_24px_60px_rgba(23,58,43,.18)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[#0e1d16]">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8a9990] hover:bg-[#f0f5f1] hover:text-[#0e1d16] transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  )
}

/* ---------- 轻提示（Toast）：右下角自动消失 ---------- */
export function Toast({ toast, onClose }) {
  if (!toast) return null
  const ok = toast.type === 'ok'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: .25 }}
      onClick={onClose}
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[13px] font-medium shadow-lg cursor-pointer ${
        ok
          ? 'border-[#3f9c74]/40 bg-white text-[#1f7a56]'
          : 'border-[#c08a4e]/45 bg-white text-[#a06f35]'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${ok ? 'bg-[#3f9c74]' : 'bg-[#c08a4e]'}`} />
      {toast.message}
    </motion.div>
  )
}
