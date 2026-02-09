const fs = require('fs');
const path = require('path');

module.exports = function beforeAdd(git) {
  const gitignorePath = path.join(git.cwd, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    fs.unlinkSync(gitignorePath);
  }
};
