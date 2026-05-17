function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

function errorPayload(message, code, details) {
  return {
    success: false,
    error: {
      code,
      message,
      details: details || null,
    },
  };
}

module.exports = {
  success,
  errorPayload,
};
