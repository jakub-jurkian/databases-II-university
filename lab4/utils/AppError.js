class AppError extends Error {
  constructor(status, type, title, detail) {
    super(detail);
    this.status = status;
    this.type = type;
    this.title = title;
    this.detail = detail;
  }
}

module.exports = AppError;
