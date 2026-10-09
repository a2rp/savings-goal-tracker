import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    base: "/savings-goal-tracker/",
    build: { sourcemap: false },
    plugins: [react()],
});