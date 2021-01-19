const path = require("path");
const fs = require("fs");
const colors = require("colors");

const checkConfig = async (configPath, basepath) => {
  const dirname = path.join(basepath, configPath);
  try {
    const content = fs.readFileSync(dirname, "utf8");
    return JSON.parse(content);
  } catch (e) {
    console.log("SORRY, YOUR CONFIG IS NOT VALID".red, e);
    return false;
  }
};

module.exports = checkConfig;
