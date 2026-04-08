const errorHandler = (err, req, res, next) => {
  const prismaCode = err?.code || err?.cause?.code;

  if (prismaCode === "P2002") {
    return res
      .status(409)
      .type("application/problem+json")
      .json({
        type: "conflict",
        title: "Resource Already Exists",
        status: 409,
        detail: "Unique constraint violation.",
        instance: req.originalUrl,
      });
  }

  if (err?.code === 11000) {
    return res
      .status(409)
      .type("application/problem+json")
      .json({
        type: "conflict",
        title: "Resource Already Exists",
        status: 409,
        detail: "Unique constraint violation.",
        instance: req.originalUrl,
      });
  }

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
