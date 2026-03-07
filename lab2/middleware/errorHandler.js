const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  // Format the response strictly according to RFC 7807
  const errorResponse = {
    type: err.type || "about:blank",
    title: err.title || "Internal Server Error",
    status: status,
    detail: err.detail || "An unexpected error occurred.",
    instance: req.originalUrl,
  };

  // Log critical server errors for backend debugging
  if (status === 500) {
    console.error("Critical Error:", err);
  }

  res.status(status).type("application/problem+json").json(errorResponse);
};

module.exports = errorHandler;
