/** @type {import('next').NextConfig} */
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, "src/styles")],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    config.module.rules.push({
      test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2)$/i,
      use: [
        {
          loader: "file-loader",
          options: {
            limit: 100000,
            name: "[name].[hash].[ext]",
          },
        },
      ],
    });
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
