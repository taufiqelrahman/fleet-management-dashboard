import {
  formatDate,
  formatCurrency,
  formatNumber,
  calculatePercentage,
} from "@/lib/utils";

describe("Utility Functions", () => {
  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2024-01-15");
      const formatted = formatDate(date);
      expect(formatted).toContain("Jan");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2024");
    });

    it("should handle string dates", () => {
      const formatted = formatDate("2024-01-15");
      expect(formatted).toContain("Jan");
    });
  });

  describe("formatCurrency", () => {
    it("should format currency with dollar sign", () => {
      const formatted = formatCurrency(1234.56);
      expect(formatted).toBe("$1,234.56");
    });

    it("should handle zero", () => {
      const formatted = formatCurrency(0);
      expect(formatted).toBe("$0.00");
    });

    it("should handle negative numbers", () => {
      const formatted = formatCurrency(-100);
      expect(formatted).toContain("-");
      expect(formatted).toContain("100");
    });
  });

  describe("formatNumber", () => {
    it("should format number with no decimals by default", () => {
      const formatted = formatNumber(1234.56);
      expect(formatted).toBe("1,235");
    });

    it("should format number with specified decimals", () => {
      const formatted = formatNumber(1234.567, 2);
      expect(formatted).toBe("1,234.57");
    });

    it("should handle zero", () => {
      const formatted = formatNumber(0);
      expect(formatted).toBe("0");
    });
  });

  describe("calculatePercentage", () => {
    it("should calculate percentage correctly", () => {
      const percentage = calculatePercentage(25, 100);
      expect(percentage).toBe(25);
    });

    it("should handle zero total", () => {
      const percentage = calculatePercentage(10, 0);
      expect(percentage).toBe(0);
    });

    it("should handle decimal results", () => {
      const percentage = calculatePercentage(1, 3);
      expect(percentage).toBeCloseTo(33.33, 2);
    });
  });
});
