import { describe, expect, it } from "vitest";
import {
  buildCsvFileName,
  escapeCsvField,
  formatAmount,
  generateExpenseCsv,
} from "../utils/csvExport";
import { signUpSchema } from "../validation/SignUpValidation";
import { loginSchema } from "../validation/LoginValidation";
import { escapeRegExp } from "../utils/escapeRegExp";
import type { SingleExpensePdf } from "../pages/allPdfs/types";

/** Minimal RFC 4180 reader, used to assert the export's real column layout. */
function parseCsvRow(row: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (inQuotes) {
      if (char === '"') {
        if (row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ";") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

describe("CSV export hardening", () => {
  it("neutralises spreadsheet formulas in user-controlled text", () => {
    expect(escapeCsvField("=cmd|'/c calc'!A0")).toBe("'=cmd|'/c calc'!A0");
    expect(escapeCsvField("+1234;X")).toBe("\"'+1234;X\"");
    expect(escapeCsvField("-1+1")).toBe("'-1+1");
    expect(escapeCsvField("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(escapeCsvField("\t=1+1")).toBe("' =1+1");
  });

  it("keeps genuine numbers numeric, including negative amounts", () => {
    expect(escapeCsvField(formatAmount(-1234.5))).toBe("-1234,50");
    expect(escapeCsvField(formatAmount(1234.5))).toBe("1234,50");
    expect(escapeCsvField(-42)).toBe("-42");
    // ...but an expression that merely starts like a number is still inert
    expect(escapeCsvField("-1+1")).toBe("'-1+1");
  });

  it("leaves ordinary values untouched", () => {
    expect(escapeCsvField("REWE")).toBe("REWE");
    expect(escapeCsvField(12.5)).toBe("12.5");
    expect(escapeCsvField(null)).toBe("");
  });

  it("keeps the delimiter and newlines from breaking the row structure", () => {
    expect(escapeCsvField("Shell; Berlin")).toBe('"Shell; Berlin"');
    expect(escapeCsvField('He said "hi"')).toBe('"He said ""hi"""');
    expect(escapeCsvField("line1\nline2")).toBe("line1 line2");
  });

  it("does not let a vendor name inject extra columns or rows", () => {
    const expenses = [
      {
        id: "1",
        user_id: "u",
        category: "Sonstiges",
        expense_date: "2026-01-15",
        amount: 10,
        vendor_name: "=HYPERLINK(\"http://evil\");999;X\nInjected;Row",
        file_name: "a.pdf",
        image_url: "u/a.pdf",
        products: [],
        created_at: "2026-01-15",
      },
    ] as unknown as SingleExpensePdf[];

    const csv = generateExpenseCsv(expenses);
    const lines = csv.split("\n");

    expect(lines).toHaveLength(2); // header + exactly one data row, no injected row
    expect(parseCsvRow(lines[0])).toHaveLength(5);
    expect(parseCsvRow(lines[1])).toHaveLength(5); // no injected columns
    // The whole hostile value ends up in the last cell, formula-neutralised.
    expect(parseCsvRow(lines[1])[4]).toBe(
      "'=HYPERLINK(\"http://evil\");999;X Injected;Row",
    );
  });

  it("strips path separators from the suggested download filename", () => {
    expect(buildCsvFileName(["../../etc/passwd"])).not.toContain("/");
    expect(buildCsvFileName(["2026", "Mobilität"])).toBe(
      "2026_mobilität_export.csv",
    );
  });
});

describe("credential input validation", () => {
  it("rejects malformed e-mail addresses", () => {
    const result = signUpSchema.safeParse({
      email: "not-an-email",
      password: "Str0ng!pass",
      repeatedPassword: "Str0ng!pass",
    });
    expect(result.success).toBe(false);
  });

  it("enforces the password policy", () => {
    for (const password of ["short1!", "alllowercase!", "NoSpecials123"]) {
      const result = signUpSchema.safeParse({
        email: "person@example.com",
        password,
        repeatedPassword: password,
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects oversized credential payloads", () => {
    expect(
      loginSchema.safeParse({
        email: `${"a".repeat(300)}@example.com`,
        password: "x",
      }).success,
    ).toBe(false);

    expect(
      loginSchema.safeParse({
        email: "person@example.com",
        password: "y".repeat(500),
      }).success,
    ).toBe(false);
  });

  it("accepts a well-formed registration (allowlist is enforced server-side)", () => {
    const result = signUpSchema.safeParse({
      email: "person@example.com",
      password: "Str0ng!pass",
      repeatedPassword: "Str0ng!pass",
    });
    expect(result.success).toBe(true);
  });
});

describe("search-term highlighting", () => {
  it("builds a valid regex from terms that are regex metacharacters", () => {
    for (const term of ["(", "[", "\\", "*", "a{2,", "(a+)+$"]) {
      expect(() => new RegExp(`(${escapeRegExp(term)})`, "gi")).not.toThrow();
    }
  });

  it("matches the term literally rather than as a pattern", () => {
    const literal = new RegExp(`^${escapeRegExp("a.c")}$`, "i");
    expect(literal.test("a.c")).toBe(true);
    expect(literal.test("abc")).toBe(false);
  });

  it("does not let a term match everything", () => {
    const literal = new RegExp(`^${escapeRegExp(".*")}$`, "i");
    expect(literal.test("anything")).toBe(false);
    expect(literal.test(".*")).toBe(true);
  });
});
