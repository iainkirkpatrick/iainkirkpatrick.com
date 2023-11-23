import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
// import { Physics, usePlane, useBox } from '@react-three/cannon'
import { Physics, usePlane, useBox } from 'use-cannon'

import Head from 'next/head'
import styles from '../styles/Home.module.css'

import Box from '../components/Box'
import Basketball from '../components/Basketball'

// // https://github.com/pmndrs/use-cannon#simple-example
// function Plane(props) {
//   const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
//   return (
//     <mesh ref={ref}>
//       <planeBufferGeometry args={[100, 100]} />
//     </mesh>
//   )
// }

function Plane(props) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
  return (
    <mesh ref={ref} receiveShadow>
      <planeBufferGeometry attach="geometry" args={[1009, 1000]} />
      <shadowMaterial attach="material" color="#171717" />
    </mesh>
  )
}

function Cube(props) {
  const [ref] = useBox(() => ({ mass: 1, position: [0, 5, 0], rotation: [0.4, 0.2, 0.5], ...props }))
  return (
    <mesh receiveShadow castShadow ref={ref}>
      <boxBufferGeometry attach="geometry" />
      <meshLambertMaterial attach="material" color="hotpink" />
    </mesh>
  )
}


export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>iain kirkpatrick</title>
        <meta name="description" content="iain kirkpatrick" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Canvas gl={{ alpha: false }} camera={{ position: [-1, 2, 5], fov: 50 }}>
        <color attach="background" args={['lightblue']} />
        <hemisphereLight intensity={0.35} />
        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <Physics>
          <Plane />
          <Cube />
          <Cube position={[0, 10, -2]} />
          <Cube position={[0, 20, -2]} />
        </Physics>
      </Canvas>

    </div>
  )
}