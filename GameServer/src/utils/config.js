const fs = require('fs');
const path = require('path');
const configs = {};

/**
 * Read all config files and store them in memory.
 */
const loadAllConfigs = () => {
  const traverseDirectory = (currentPath) => {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const fileStats = fs.statSync(filePath);

      if (fileStats.isDirectory()) {
        // Recursively traverse subdirectories
        traverseDirectory(filePath);
      } else if (file.endsWith('.json')) {
        // Read and parse JSON files
        try {
          const fileName = path.basename(file, '.json');
          configs[fileName] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
          console.error(`Error reading or parsing ${filePath}: ${error}`);
        }
      }
    }
  };

  traverseDirectory('./config');
};

/**
 * Helper function to get a specific config from memory.
 *
 * @param {string} name The name of the config file.
 * @param {?string} path Path for the nested config object.
 * @return {object|null}
 */
const getConfig = (name, path = '') => {
  if (!path) {
    return configs[name];
  }
  try {
    const data = configs[name];

    // Split the dot-separated path into an array of keys
    const keys = path.split('.');

    // Traverse the JSON object using the keys
    let result = data;
    for (const key of keys) {
      if (key in result) {
        result = result[key];
      } else {
        return null;
      }
    }

    return result;
  } catch (error) {
    console.error(`Error reading or parsing config '${name}': ${error}`);
    return null;
  }
};

module.exports = {
  loadAllConfigs,
  getConfig
};
