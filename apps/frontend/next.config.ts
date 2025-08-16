import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar modo standalone para Docker
  output: 'standalone',
  
  // Configurar rutas para el monorepo
  transpilePackages: ['@gymcontrol/domain'],

  // Skip ESLint during build for Docker
  eslint: {
    ignoreDuringBuilds: true,
  },

};

export default nextConfig;
