import source from "./assets/chess_polycam_glb/source/polycam_auto_shoot.glb?url";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, PerspectiveCamera } from "@react-three/drei";

function App() {
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      // camera={{ position: [8, 15, 12], fov: 50, zoom: 40 }}
    >
      <PerspectiveCamera makeDefault position={[8, 15, 12]} zoom={40} />
      <ambientLight intensity={1} />
      <Scene />
      <Raycaster />
      <OrbitControls />
    </Canvas>
  );
}

function Scene() {
  // @react-three/fiber:
  // const { scene } = useLoader(GLTFLoader, source);
  const { scene } = useGLTF(source);

  return <primitive object={scene} scale={[1, 1, 1]} position={[0, 0, 0]} />;
}

function Raycaster() {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  useEffect(() => {
    const handleMouseClick = (event) => {
      const canvasBounds = gl.domElement.getBoundingClientRect();
      const canvasX = event.clientX - canvasBounds.left;
      const canvasY = event.clientY - canvasBounds.top;

      mouse.current.x = (canvasX / canvasBounds.width) * 2 - 1;
      mouse.current.y = -((canvasY / canvasBounds.height) * 2 - 1);
      // mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      // mouse.current.y = -((event.clientY / window.innerHeight) * 2 - 1);

      raycaster.current.setFromCamera(mouse.current, camera);

      const intersects = raycaster.current.intersectObjects(scene.children);
      if (intersects.length > 0) {
        console.log("Intersection:", intersects[0].object);
      }
    };
    gl.domElement.addEventListener("click", handleMouseClick);

    return () => {
      gl.domElement.removeEventListener("click", handleMouseClick);
    };
  }, [camera, gl, scene]);

  return null;
}

export default App;
