import source from "./assets/chess_polycam_glb/source/polycam_auto_shoot.glb?url";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function App() {
  // @react-three/fiber:
  // const { scene } = useLoader(GLTFLoader, source);
  const { scene } = useGLTF(source);

  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      camera={{ position: [8, 15, 12], zoom: 40 }}
    >
      <ambientLight intensity={0.8} />
      <primitive object={scene} scale={[1, 1, 1]} position={[0, 0, 0]} />
      <OrbitControls />
    </Canvas>
  );
}

export default App;
