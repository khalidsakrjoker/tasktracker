import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError
} from "../../src/shared/errors.js";

describe("Custom App Errors", () => {
  it("should instantiate custom error classes with correct status codes", () => {
    const err = new AppError("Base error", 500);
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);

    const notFound = new NotFoundError("Not found");
    expect(notFound.statusCode).toBe(404);

    const unauth = new UnauthorizedError("Unauthorized");
    expect(unauth.statusCode).toBe(401);

    const forbidden = new ForbiddenError("Forbidden");
    expect(forbidden.statusCode).toBe(403);

    const validation = new ValidationError("Invalid field");
    expect(validation.statusCode).toBe(400);
  });
});
