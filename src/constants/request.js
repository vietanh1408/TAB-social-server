module.exports.ServerError = () => {
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
