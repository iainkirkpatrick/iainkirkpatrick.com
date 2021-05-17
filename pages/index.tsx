import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics, usePlane } from '@react-three/cannon'

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

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>iain kirkpatrick</title>
        <meta name="description" content="iain kirkpatrick" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        {/* <Physics> */}
          <Box position={[-2.2, 0, 0]} />
          <Box position={[2.2, 0, 0]} />
          {/* <Plane /> */}
          <Suspense fallback={null}>
            <Basketball position={[0, 0, 1]} />
          </Suspense>
        {/* </Physics> */}
      </Canvas>

    </div>
  )
}
