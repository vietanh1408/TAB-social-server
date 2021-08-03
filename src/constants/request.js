module.exports.ServerFail = () => {
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
