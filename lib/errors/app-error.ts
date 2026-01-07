export class AppError extends Error {
  constructor(
    public code: string,
    public status: string,
    message: string,
  ) {
    super(message);
  }
}
