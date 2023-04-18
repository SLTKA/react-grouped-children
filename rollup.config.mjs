import typescript from "rollup-plugin-typescript2"
import cleaner from "rollup-plugin-cleaner"
import pkg from "./package.json" assert { type: "json" }

export default [
  {
    input: "src/index.ts",
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
    plugins: [
      cleaner({ targets: ["./dist/"] }),
      typescript({
        tsconfig: "./tsconfig.json",
        exclude: [],
      }),
    ],
    external: Object.keys({ ...pkg.peerDependencies }),
  },
]
