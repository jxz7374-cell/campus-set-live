/* ============================================================
 * Three.js 3D 氛围背景（ThreeBackground.jsx）
 * ------------------------------------------------------------
 * 页面背后的克制 3D 场景，参考 VERDANT 视频开头：
 *   1. 3D 旋转的绿色圆环（主视觉装饰，缓缓翻转旋转）
 *   2. 环上 4 颗轨道光点（随环一起转动，科技感）
 *   3. 漂浮粒子 + 柔和光球（空气感）
 * 颜色全部用墨绿/翠绿系，浅色背景下半透明，不抢主体。
 * ============================================================ */
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'

/* ---------- 粒子云：缓慢漂浮 ---------- */
function Particles({ count = 700 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 26
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.02
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#3f9c74" transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/* ---------- 3D 旋转绿色圆环 + 轨道光点 ----------
 * 像视频里 VERDANT 页面的那个绿环：
 *  - 一个细圆环（torus），绕 X 轴倾斜旋转 + 绕 Z 轴自转，
 *    产生"3D 翻转"的立体感；
 *  - 环上均匀分布 4 颗小光点，随环一起转动。
 */
function GreenRing() {
  const group = useRef()

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.rotation.z = t * 0.5          // 绕自身中心轴缓缓自转
    group.current.rotation.x = Math.PI / 2.6 + Math.sin(t * 0.4) * 0.28  // 倾斜 + 轻微摆动（3D 翻转感）
  })

  /* 环上 4 颗光点的位置（同一平面上均匀分布） */
  const dots = useMemo(() => {
    return [0, 1, 2, 3].map(i => {
      const a = (i / 4) * Math.PI * 2
      return { x: Math.cos(a) * 1.7, z: Math.sin(a) * 1.7 }
    })
  }, [])

  return (
    <group position={[3.4, 1.1, -1.5]} ref={group}>
      {/* 主环：细圆环体，墨绿半透明，有立体感 */}
      <mesh>
        <torusGeometry args={[1.7, 0.028, 24, 96]} />
        <meshStandardMaterial color="#2e7d5b" transparent opacity={0.75} roughness={0.35} metalness={0.15} />
      </mesh>
      {/* 外圈细环：更淡，增加层次 */}
      <mesh rotation={[0.25, 0.2, 0]}>
        <torusGeometry args={[2.1, 0.012, 16, 80]} />
        <meshBasicMaterial color="#3f9c74" transparent opacity={0.30} />
      </mesh>
      {/* 轨道光点：翠绿小圆球 */}
      {dots.map((d, i) => (
        <mesh key={i} position={[d.x, 0, d.z]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshBasicMaterial color="#3f9c74" />
        </mesh>
      ))}
      {/* 环中心的小实心圆（视觉锚点） */}
      <mesh>
        <circleGeometry args={[0.16, 48]} />
        <meshBasicMaterial color="#2e7d5b" transparent opacity={0.25} />
      </mesh>
    </group>
  )
}

/* ---------- 柔和光球：空间深度 ---------- */
function SoftOrb() {
  return (
    <mesh position={[-4.5, -2.2, -6]}>
      <sphereGeometry args={[2.6, 48, 48]} />
      <meshBasicMaterial color="#3f9c74" transparent opacity={0.05} depthWrite={false} />
    </mesh>
  )
}

export default function ThreeBackground() {
  return (
    /* fixed 铺满整屏，z-index 在内容之下；指针事件穿透，不干扰操作 */
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        {/* 灯光：让圆环有立体感 */}
        <ambientLight intensity={1.1} />
        <pointLight position={[4, 3, 4]} intensity={0.9} color="#d8eadf" />
        <GreenRing />
        <Particles />
        <SoftOrb />
      </Canvas>
    </div>
  )
}
