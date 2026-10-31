/* ============================================================
 * 添加学生弹窗（AddStudentModal.jsx）
 * 填写：姓名 / 好友 / 已选课程 / 兴趣爱好（逗号分隔）
 * 提交后写入后端数据库，所有访问者共享
 * ============================================================ */
import { useState } from 'react'
import { Modal, Input, Button } from './ui.jsx'

export default function AddStudentModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', friends: '', courses: '', tags: '' })
  const [busy, setBusy] = useState(false)

  const split = str => str.split(/[,，、;；\s]+/).map(s => s.trim()).filter(Boolean)

  const submit = async () => {
    const name = form.name.trim()
    if (!name) return
    setBusy(true)
    try {
      await onCreate({
        name,
        friends: split(form.friends),
        courses: split(form.courses),
        tags: split(form.tags)
      })
      setForm({ name: '', friends: '', courses: '', tags: '' })
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title="添加新同学" onClose={onClose}>
      <div className="space-y-3">
        <Input placeholder="姓名（必填），例如：周雨" value={form.name} onChange={v => setForm({ ...form, name: v })} />
        <Input placeholder="好友，逗号分隔，例如：林晓、王浩" value={form.friends} onChange={v => setForm({ ...form, friends: v })} />
        <Input placeholder="已选课程，逗号分隔" value={form.courses} onChange={v => setForm({ ...form, courses: v })} />
        <Input placeholder="兴趣爱好，逗号分隔，例如：篮球、摄影" value={form.tags} onChange={v => setForm({ ...form, tags: v })} />
        <Button onClick={submit} disabled={busy || !form.name.trim()} className="w-full py-2.5">
          {busy ? '提交中…' : '加入名单'}
        </Button>
        <p className="text-[11px] leading-relaxed text-[#8a9990]">
          提交后写入后端数据库（data/students.json），所有访问者刷新后都能看到。
        </p>
      </div>
    </Modal>
  )
}
