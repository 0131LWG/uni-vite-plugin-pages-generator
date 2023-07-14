const fs = require("fs");
const path = require("path");

// 读取主包配置文件
const indexPath = path.join(process.cwd(), process.argv[2], "/pages");
const indexFiles = fs.readdirSync(indexPath);
let indexConfig = [];
for (const file of indexFiles) {
  if (file.endsWith(".ts")) {
    const module = require(path.join(indexPath, file));
    indexConfig = module;
  }
}

// 读取子包配置文件
const subPackagesPath = path.join(process.cwd(), process.argv[2], "/subPackages");
const subPackagesConfig = [];
if (fs.existsSync(subPackagesPath)) {
  const subPackagesFiles = fs.readdirSync(subPackagesPath);
  for (const file of subPackagesFiles) {
    if (file.endsWith(".ts")) {
      const moduleName = path.basename(file, ".ts");
      const modulePath = path.join(subPackagesPath, moduleName + ".ts");
      const module = require(modulePath);
      const subPackage = {
        root: `subPackages/${moduleName}`,
        name: moduleName,
        pages: module
      };
      subPackagesConfig.push(subPackage);
    }
  }
}

// 生成 pages.json 配置
const pagesConfig = {
  pages: indexConfig,
  // 添加子包配置
  subPackages: subPackagesConfig
};

// 读取和生成其他配置文件
const configPath = path.join(process.cwd(), process.argv[2]);
const configFiles = fs.readdirSync(configPath);
for (const file of configFiles) {
  if (file.endsWith(".ts") && file !== "index.ts") {
    const configName = path.basename(file, ".ts");
    const filePath = path.join(configPath, configName + ".ts");
    const config = require(filePath);
    pagesConfig[configName] = config;
  }
}

// 写入 pages.json 文件
fs.writeFileSync(path.join(process.cwd(), "/src/pages.json"), JSON.stringify(pagesConfig, null, 2));
