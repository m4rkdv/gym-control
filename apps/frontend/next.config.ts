import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar modo standalone para Docker
  output: 'standalone',
  
  // Configurar rutas para el monorepo
  transpilePackages: ['@gymcontrol/domain'],

};

export default nextConfig;
