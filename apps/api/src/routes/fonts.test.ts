import { describe, expect, test } from "bun:test";
import { familyParamSchema, listQuerySchema } from "./fonts";

describe("listQuerySchema", () => {
  test("accepts no params", () => {
    expect(listQuerySchema.safeParse({}).success).toBe(true);
  });

  test("accepts category/license/search", () => {
    const result = listQuerySchema.safeParse({
      category: "serif",
      license: "ofl",
      search: "Roboto",
    });
    expect(result.success).toBe(true);
  });

  test("rejects empty string fields", () => {
    expect(listQuerySchema.safeParse({ category: "" }).success).toBe(false);
  });

  test("rejects search longer than 100 chars", () => {
    expect(listQuerySchema.safeParse({ search: "a".repeat(101) }).success).toBe(
      false,
    );
  });
});

describe("familyParamSchema", () => {
  test("requires non-empty family", () => {
    expect(familyParamSchema.safeParse({ family: "" }).success).toBe(false);
  });

  test("accepts valid family slug", () => {
    expect(familyParamSchema.safeParse({ family: "roboto-slab" }).success).toBe(
      true,
    );
  });
});
