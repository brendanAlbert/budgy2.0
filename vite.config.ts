import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 7070,
    },
    preview: {
        port: 7070,
    },
    plugins: [react()],
});
