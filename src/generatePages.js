const fs = require("fs");
const path = require("path");

// 读取主包配置文件
const indexPath = path.join(process.cwd(), process.argv[2], "/pages");
const indexFiles = fs.readdirSync(indexPath);
const pagesConfig = {
  index: {}
};
for (const file of indexFiles) {
  if (file.endsWith(".ts")) {
    const module = require(path.join(indexPath, file));
    for (const router of module) {
      const paths = router.path.split("/");
      const pageName = paths[paths.length - 1];
      pagesConfig.index[pageName] = "/" + router.path;
    }
  }
}

// 读取子包配置文件
const subPackagesPath = path.join(process.cwd(), process.argv[2], "/subPackages");
if (fs.existsSync(subPackagesPath)) {
  const subPackagesFiles = fs.readdirSync(subPackagesPath);
  for (const file of subPackagesFiles) {
    if (file.endsWith(".ts")) {
      const moduleName = path.basename(file, ".ts");
      const modulePath = path.join(subPackagesPath, moduleName + ".ts");
      const module = require(modulePath);
      pagesConfig[moduleName] = {};
      for (const router of module) {
        const paths = router.path.split("/");
        const pageName = paths[paths.length - 1];
        pagesConfig[moduleName][pageName] = `/subPackages/${moduleName}/${router.path}`;
      }
    }
  }
}

// 生成 pages.json 配置
const fileContent = Object.keys(pagesConfig)
  .map((key) => `const ${key} = ${JSON.stringify(pagesConfig[key], null, 2).replace(/"([^"]+)":/g, "$1:")};`)
  .join("\n");

const exportContent = `const pages = { ${Object.keys(pagesConfig)
  .map((key) => "..." + key)
  .join(", ")} };\n\nexport default pages;\n`;
const finalContent = `// Generated by script\n\n${fileContent}\n\n${exportContent}`;

// 写入 pages.json 文件
fs.writeFileSync(path.join(process.cwd(), process.argv[2], "/action/pages.ts"), finalContent);
