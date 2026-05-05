const nextConfig = {
  // Permite imagens de qualquer origem (para QR codes externos se necessário)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
