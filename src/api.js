/* ============================================================
 * 与后端交互的唯一入口（api.js）
 * 所有页面组件都通过这里的函数读写数据库，不直接写 fetch
 * ============================================================ */

/* 读取全部学生：GET /api/students */
export async function fetchStudents() {
  const resp = await fetch('/api/students')
  if (!resp.ok) throw new Error('读取失败')
  return (await resp.json()).students
}

/* 新增学生：POST /api/students */
export async function createStudent(payload) {
  const resp = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const data = await resp.json()
  if (!data.ok) throw new Error(data.message || '添加失败')
  return data.student
}

/* 删除学生：DELETE /api/students/:id */
export async function deleteStudent(id) {
  const resp = await fetch('/api/students/' + id, { method: 'DELETE' })
  const data = await resp.json()
  if (!data.ok) throw new Error(data.message || '删除失败')
  return true
}
