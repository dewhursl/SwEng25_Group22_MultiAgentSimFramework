import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import HeroScene3D from './components/HeroScene3D';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const LandingPage = () => {
  return (
    <main className="relative">
      <Navbar />
      <section className="relative w-full h-screen z-10">
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
            <OrbitControls enableZoom={false} />
            <ambientLight intensity={1} />
            <directionalLight position={[0, 10, 5]} intensity={1} />
            <HeroScene3D url="/models/robot_playground.glb" />
          </Canvas>
        </div>
      </section>
      <section>
        <div className="max-w-7xl mx-auto py-20">
          <h1 className="text-4xl font-bold text-center text-white">FEATURES</h1>
          <p className="text-lg text-center text-gray-500 mt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros
            elementum tristique.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default LandingPage;
