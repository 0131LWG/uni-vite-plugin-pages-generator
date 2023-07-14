const { execSync } = require("child_process");
const path = require("path");

let count = 0;

const exec = (folderPath) => {
  if (count !== 0) return;
  count = count + 1;
  // 此路径是在项目根目录下执行的，所以读取的为项目中的node_modules
  const generatePagesJsonPath = path.join(__dirname, "./generatePagesJson.js");
  const generatePagesPath = path.join(__dirname, "./generatePages.js");
  execSync(`node ${generatePagesJsonPath} ${folderPath}`);
  execSync(`node ${generatePagesPath} ${folderPath}`);
};

module.exports = (folderPath) => ({
  name: "pages-generator",
  buildStart() {
    exec(folderPath);
  }
});
