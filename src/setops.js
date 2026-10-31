/* ============================================================
 * 手写集合运算（与 C 程序 set_collection.c 同一套算法）
 * 线性查找 -> 交集 / 并集 / 补集
 * ============================================================ */

/* 线性查找：返回是否找到 + 比较次数 */
export function linearFind(list, x) {
  let compares = 0
  for (let i = 0; i < list.length; i++) {
    compares++
    if (list[i] === x) return { found: true, compares }
  }
  return { found: false, compares }
}

/* 交集 A∩B：两边都有的元素 */
export function intersect(A, B) {
  const result = []
  let compares = 0
  for (const x of A) {
    const r = linearFind(B, x)
    compares += r.compares
    if (r.found) result.push(x)
  }
  return { result, compares }
}

/* 并集 A∪B：合并去重 */
export function union(A, B) {
  const result = [...A]
  let compares = 0
  for (const x of B) {
    const r = linearFind(result, x)
    compares += r.compares
    if (!r.found) result.push(x)
  }
  return { result, compares }
}

/* 补集 U−chosen：全集里没被选中的 */
export function complement(U, chosen) {
  const result = []
  let compares = 0
  for (const x of U) {
    const r = linearFind(chosen, x)
    compares += r.compares
    if (!r.found) result.push(x)
  }
  return { result, compares }
}
