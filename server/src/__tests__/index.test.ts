import { describe, it, beforeEach, vi, expect } from "vitest";
import request from "supertest";
import { app } from "../index";
import axios from "axios";
import type { Mock } from "vitest";

vi.mock("axios", () => {
  return {
    default: vi.fn(),
  };
});

const mockedAxios = axios as unknown as Mock;

describe("POST /graphql endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return data when external GraphQL API returns a valid response", async () => {
    const mockResponse = {
      data: {
        data: { hello: "world" },
      },
    };
    mockedAxios.mockResolvedValueOnce(mockResponse);

    const response = await request(app)
      .post("/graphql")
      .send({
        query: "query { hello }",
        variables: {},
      })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse.data);
    expect(mockedAxios).toHaveBeenCalledOnce();
  });

  it("should return 400 if the external GraphQL API returns errors", async () => {
    const mockResponse = {
      data: {
        errors: [{ message: "GraphQL API Error" }],
      },
    };
    mockedAxios.mockResolvedValueOnce(mockResponse);

    const response = await request(app)
      .post("/graphql")
      .send({
        query: "query { hello }",
        variables: {},
      })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(mockedAxios).toHaveBeenCalledOnce();
  });

  it("should return 500 when axios throws an exception", async () => {
    const errorResponse = {
      response: {
        data: {
          errors: [{ message: "Axios Failure" }],
        },
      },
    };
    mockedAxios.mockRejectedValueOnce(errorResponse);

    const response = await request(app)
      .post("/graphql")
      .send({
        query: "query { hello }",
        variables: {},
      })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("errors");
    expect(mockedAxios).toHaveBeenCalledOnce();
  });
});
