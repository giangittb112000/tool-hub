import type { Hono } from "hono";
import type { CoreContext, ToolHubModule } from "@toolhub/shared";
import { randomUUID } from "node:crypto";

// ─── Types ───────────────────────────────────────────────────
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface MockEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  statusCode: number;
  responseBody: string;
  contentType: string;
  delay: number;
  description: string;
  createdAt: string;
  hits: number;
}

interface CreateEndpointBody {
  method: HttpMethod;
  path: string;
  statusCode?: number;
  responseBody: string;
  contentType?: string;
  delay?: number;
  description?: string;
}

const VALID_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

// ─── Module ──────────────────────────────────────────────────
export class MockApiModule implements ToolHubModule {
  id = "module-mock-api";
  name = "Mock API Module";
  version = "1.0.0";
  autorun = true;

  private ctx!: CoreContext;
  private endpoints: Map<string, MockEndpoint> = new Map();

  async onInit(ctx: CoreContext): Promise<void> {
    this.ctx = ctx;
    this.ctx.logger.info("Mock API Module initialized.");
  }

  async onStart(): Promise<boolean> {
    this.ctx.logger.info("Mock API Module started.");
    return true;
  }

  async onStop(): Promise<boolean> {
    this.ctx.logger.info("Mock API Module stopped.");
    return true;
  }

  private normalizePath(p: string): string {
    let cleaned = p.trim();
    if (!cleaned.startsWith("/")) cleaned = "/" + cleaned;
    if (cleaned.endsWith("/") && cleaned.length > 1)
      cleaned = cleaned.slice(0, -1);
    return cleaned.toLowerCase();
  }

  private validateJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  registerRoutes(app: Hono) {
    // ─── CRUD: List all endpoints ────────────────────────────
    app.get("/api/mock/endpoints", (c) => {
      const list = Array.from(this.endpoints.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      return c.json(list);
    });

    // ─── CRUD: Create endpoint ───────────────────────────────
    app.post("/api/mock/endpoints", async (c) => {
      try {
        const body = (await c.req.json()) as CreateEndpointBody;

        if (!body.method || !VALID_METHODS.includes(body.method)) {
          return c.json(
            { error: `Invalid method. Allowed: ${VALID_METHODS.join(", ")}` },
            400,
          );
        }

        if (!body.path || !body.path.trim()) {
          return c.json({ error: "Path is required." }, 400);
        }

        if (!body.responseBody && body.responseBody !== "") {
          return c.json({ error: "Response body is required." }, 400);
        }

        // Validate JSON if content type is json
        const contentType = body.contentType || "application/json";
        if (
          contentType === "application/json" &&
          body.responseBody.trim() &&
          !this.validateJson(body.responseBody)
        ) {
          return c.json({ error: "Response body is not valid JSON." }, 400);
        }

        const normalizedPath = this.normalizePath(body.path);

        // Check duplicate
        const duplicate = Array.from(this.endpoints.values()).find(
          (ep) => ep.method === body.method && ep.path === normalizedPath,
        );
        if (duplicate) {
          return c.json(
            {
              error: `Endpoint ${body.method} ${normalizedPath} already exists.`,
            },
            409,
          );
        }

        const endpoint: MockEndpoint = {
          id: randomUUID(),
          method: body.method,
          path: normalizedPath,
          statusCode: body.statusCode || 200,
          responseBody: body.responseBody,
          contentType,
          delay: Math.max(0, Math.min(body.delay || 0, 30000)),
          description: body.description || "",
          createdAt: new Date().toISOString(),
          hits: 0,
        };

        this.endpoints.set(endpoint.id, endpoint);
        this.ctx.logger.info(
          `Mock endpoint created: ${endpoint.method} /mock${endpoint.path}`,
        );
        return c.json(endpoint, 201);
      } catch (e: any) {
        return c.json({ error: e.message || "Invalid request body." }, 400);
      }
    });

    // ─── CRUD: Update endpoint ───────────────────────────────
    app.put("/api/mock/endpoints/:id", async (c) => {
      const id = c.req.param("id");
      const existing = this.endpoints.get(id);
      if (!existing) {
        return c.json({ error: "Endpoint not found." }, 404);
      }

      try {
        const body = (await c.req.json()) as Partial<CreateEndpointBody>;

        if (body.method && !VALID_METHODS.includes(body.method)) {
          return c.json(
            { error: `Invalid method. Allowed: ${VALID_METHODS.join(", ")}` },
            400,
          );
        }

        const contentType = body.contentType || existing.contentType;

        if (
          body.responseBody !== undefined &&
          contentType === "application/json" &&
          body.responseBody.trim() &&
          !this.validateJson(body.responseBody)
        ) {
          return c.json({ error: "Response body is not valid JSON." }, 400);
        }

        const normalizedPath = body.path
          ? this.normalizePath(body.path)
          : existing.path;
        const method = body.method || existing.method;

        // Check duplicate (exclude self)
        const duplicate = Array.from(this.endpoints.values()).find(
          (ep) =>
            ep.id !== id && ep.method === method && ep.path === normalizedPath,
        );
        if (duplicate) {
          return c.json(
            { error: `Endpoint ${method} ${normalizedPath} already exists.` },
            409,
          );
        }

        const updated: MockEndpoint = {
          ...existing,
          method,
          path: normalizedPath,
          statusCode: body.statusCode ?? existing.statusCode,
          responseBody:
            body.responseBody !== undefined
              ? body.responseBody
              : existing.responseBody,
          contentType,
          delay:
            body.delay !== undefined
              ? Math.max(0, Math.min(body.delay, 30000))
              : existing.delay,
          description:
            body.description !== undefined
              ? body.description
              : existing.description,
        };

        this.endpoints.set(id, updated);
        this.ctx.logger.info(
          `Mock endpoint updated: ${updated.method} /mock${updated.path}`,
        );
        return c.json(updated);
      } catch (e: any) {
        return c.json({ error: e.message || "Invalid request body." }, 400);
      }
    });

    // ─── CRUD: Delete endpoint ───────────────────────────────
    app.delete("/api/mock/endpoints/:id", (c) => {
      const id = c.req.param("id");
      const existing = this.endpoints.get(id);
      if (!existing) {
        return c.json({ error: "Endpoint not found." }, 404);
      }

      this.endpoints.delete(id);
      this.ctx.logger.info(
        `Mock endpoint deleted: ${existing.method} /mock${existing.path}`,
      );
      return c.json({ success: true });
    });

    // ─── CRUD: Delete all endpoints ──────────────────────────
    app.delete("/api/mock/endpoints", (c) => {
      const count = this.endpoints.size;
      this.endpoints.clear();
      this.ctx.logger.info(`All ${count} mock endpoints cleared.`);
      return c.json({ success: true, deleted: count });
    });

    // ─── Dynamic Mock Handler ────────────────────────────────
    // Catch-all: /mock/* matches incoming requests to saved endpoints
    app.all("/mock/*", async (c) => {
      const reqPath = this.normalizePath(
        c.req.path.replace(/^\/mock/, "") || "/",
      );
      const reqMethod = c.req.method.toUpperCase() as HttpMethod;

      const match = Array.from(this.endpoints.values()).find(
        (ep) => ep.method === reqMethod && ep.path === reqPath,
      );

      if (!match) {
        return c.json(
          {
            error: "No mock endpoint found.",
            method: reqMethod,
            path: reqPath,
            hint: `Create one via POST /api/mock/endpoints`,
          },
          404,
        );
      }

      // Increment hit counter
      match.hits++;

      // Apply delay if configured
      if (match.delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, match.delay));
      }

      // Return the configured response
      if (match.contentType === "application/json") {
        try {
          const parsed = JSON.parse(match.responseBody);
          return c.json(parsed, match.statusCode as any);
        } catch {
          return new Response(match.responseBody, {
            status: match.statusCode,
            headers: { "Content-Type": match.contentType },
          });
        }
      }

      return new Response(match.responseBody, {
        status: match.statusCode,
        headers: { "Content-Type": match.contentType },
      });
    });
  }
}

export const mockApiModule = new MockApiModule();
