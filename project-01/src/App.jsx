import source from "./assets/free_bread_pack_cs2_glb/source/bread pack.glb?url";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  PerspectiveCamera,
  Html,
} from "@react-three/drei";
import { convertMeshName } from "./utils/convertValue";

function App() {
  const [selectedMesh, setSelectedMesh] = useState(null);
  const [coordinate, setCoordinate] = useState({ x: null, y: null });

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Canvas
        style={{ width: "100%", height: "100%" }}
        // camera={{ position: [8, 15, 12], fov: 50, zoom: 40 }}
      >
        <PerspectiveCamera makeDefault position={[8, 15, 12]} zoom={30} />
        <directionalLight castShadow position={[0, 10, 5]} intensity={4} />
        <ambientLight intensity={0.4} />
        <Scene mesh={selectedMesh} />
        <Raycaster
          setSelectedMesh={setSelectedMesh}
          setCoordinate={setCoordinate}
        />
        <OrbitControls enableDamping={true} />
      </Canvas>
      {selectedMesh && <Detail mesh={selectedMesh} coordinate={coordinate} />}
      {selectedMesh && <HighlightMesh mesh={selectedMesh} color={0xff0000} />}
    </div>
  );
}

function Scene({ mesh }) {
  // @react-three/fiber:
  // const { scene } = useLoader(GLTFLoader, source);
  const { scene } = useGLTF(source);

  return (
    <primitive object={scene} scale={[1, 1, 1]} position={[-0.1, -0.04, 0]}>
      {scene.children.map((child) => {
        return child.isMesh && child.name === mesh?.name ? (
          <Name key={child.uuid} mesh={child} position={child.position} />
        ) : null;
      })}
    </primitive>
  );
}

function Name({ mesh, position }) {
  return (
    <Html
      position={position}
      style={{
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "150px",
          height: "40px",
          color: "white",
          backgroundColor: "black",
          padding: "10px",
        }}
      >
        {convertMeshName(mesh.name)}
      </div>
    </Html>
  );
}

function Raycaster({ setSelectedMesh, setCoordinate }) {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const hoveredMesh = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
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
        document.body.style.cursor = "pointer";
        hoveredMesh.current = intersects[0].object;
      } else {
        document.body.style.cursor = "default";
        hoveredMesh.current = null;
      }
    };

    const handleMouseClick = (event) => {
      if (hoveredMesh.current) {
        setSelectedMesh(hoveredMesh.current);
        setCoordinate({ x: event.clientX, y: event.clientY });
      } else {
        setSelectedMesh(null);
        setCoordinate({ x: null, y: null });
      }
    };

    // const handleResize = () => {
    //   setSelectedMesh(null);
    //   setCoordinate({ x: null, y: null });
    // };

    gl.domElement.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("click", handleMouseClick);
    // window.addEventListener("resize", handleResize);

    return () => {
      gl.domElement.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("click", handleMouseClick);
      // window.removeEventListener("resize", handleResize);
    };
  }, [camera, gl, scene, hoveredMesh.current]);

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

function Detail({ mesh, coordinate }) {
  const meshName = convertMeshName(mesh.name);

  return (
    <>
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
      {/* <div
        style={{
          position: "absolute",
          top: `${coordinate.y}px`,
          left: `${coordinate.x}px`,
          transform: "translate(-50%, -150%)",
          transition: "all 300ms ease",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "200px",
          height: "60px",
          borderRadius: "10px",
          background: "white",
          padding: "10px",
          color: "black",
        }}
      >
        {`${meshName} is selected`}
      </div> */}
    </>
  );
}

export default App;
