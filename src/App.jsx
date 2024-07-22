import source from "./assets/free_bread_pack_cs2_glb/source/bread pack.glb?url";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, PerspectiveCamera } from "@react-three/drei";

function App() {
  const [selectedMesh, setSelectedMesh] = useState(null);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        // camera={{ position: [8, 15, 12], fov: 50, zoom: 40 }}
      >
        <PerspectiveCamera makeDefault position={[8, 15, 12]} zoom={30} />
        <directionalLight castShadow position={[0, 10, 5]} intensity={4} />
        <ambientLight intensity={0.4} />
        <Scene />
        <Raycaster setSelectedMesh={setSelectedMesh} />
        <OrbitControls enableDamping={true} />
      </Canvas>
      {selectedMesh && <Detail mesh={selectedMesh} />}
      {selectedMesh && <HighlightMesh mesh={selectedMesh} color={0xff0000} />}
    </div>
  );
}

function Scene() {
  // @react-three/fiber:
  // const { scene } = useLoader(GLTFLoader, source);
  const { scene } = useGLTF(source);

  return (
    <primitive object={scene} scale={[1, 1, 1]} position={[-0.1, -0.04, 0]} />
  );
}

function Raycaster({ setSelectedMesh }) {
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
        setSelectedMesh(intersects[0].object);
      } else {
        setSelectedMesh(null);
      }
    };
    gl.domElement.addEventListener("click", handleMouseClick);

    return () => {
      gl.domElement.removeEventListener("click", handleMouseClick);
    };
  }, [camera, gl, scene]);

  return null;
}

function HighlightMesh({ mesh, color }) {
  useEffect(() => {
    if (mesh) {
      mesh.material.emissive = new THREE.Color(color);
      mesh.material.emissiveIntensity = 0.9;
    }

    return () => {
      if (mesh) {
        mesh.material.emissive = new THREE.Color(0x000000);
        mesh.material.emissiveIntensity = 1.0;
      }
    };
  }, [mesh]);

  return null;
}

function Detail({ mesh }) {
  const convertMeshName = () => {
    switch (mesh.name) {
      case "bread":
        return "Rye Bread";
      case "bread001":
        return "Pineapple Bun";
      case "bread002":
        return "Long Baguette";
      case "bread003":
        return "Short Baguette";
      default:
        return "";
    }
  };

  const meshName = convertMeshName(mesh.name);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        background: "white",
        padding: "10px",
        color: "black",
      }}
    >
      {`${meshName} is selected`}
    </div>
  );
}

export default App;
