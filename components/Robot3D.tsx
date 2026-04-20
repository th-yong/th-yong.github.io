'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bounds, Center, useAnimations, useGLTF } from '@react-three/drei'
import { MathUtils, type Group } from 'three'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''
const MODEL_URL = `${BASE_PATH}/models/robot.glb`

function RobotModel({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<Group>(null)
  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions, names } = useAnimations(animations, groupRef)

  useEffect(() => {
    if (!actions || names.length === 0) return
    const idleName =
      names.find((n) => /idle|stand|wave|loop/i.test(n)) ?? names[0]
    const action = actions[idleName]
    if (!action) return
    if (reducedMotion) {
      action.stop()
    } else {
      action.reset().fadeIn(0.3).play()
    }
    return () => {
      action.fadeOut(0.2).stop()
    }
  }, [actions, names, reducedMotion])

  useFrame((state) => {
    const g = groupRef.current
    if (!g) return
    if (reducedMotion) {
      g.rotation.x = 0
      g.rotation.y = 0
      g.position.y = 0
      return
    }
    const targetY = state.pointer.x * 1.4
    const targetX = -state.pointer.y * 0.6
    g.rotation.y = MathUtils.lerp(g.rotation.y, targetY, 0.08)
    g.rotation.x = MathUtils.lerp(g.rotation.x, targetX, 0.08)
    g.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.06
  })

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} />
    </group>
  )
}

export default function Robot3D() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return (
    <div className="w-full h-full" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} />
        <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#99c2ff" />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.15}>
            <Center>
              <RobotModel reducedMotion={reducedMotion} />
            </Center>
          </Bounds>
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_URL)
