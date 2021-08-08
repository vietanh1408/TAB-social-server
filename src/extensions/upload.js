const fs = require("fs");

module.exports.removePathFileUpload = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};
