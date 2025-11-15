import { vehicleSchema, loginSchema } from "@/lib/validation";

describe("Validation Schemas", () => {
  describe("vehicleSchema", () => {
    it("should validate a correct vehicle object", () => {
      const validVehicle = {
        name: "Test Vehicle",
        type: "SEDAN",
        licensePlate: "ABC1234",
        status: "ACTIVE",
        mileage: 5000,
        fuelConsumption: 8.5,
      };

      const result = vehicleSchema.safeParse(validVehicle);
      expect(result.success).toBe(true);
    });

    it("should reject vehicle with short name", () => {
      const invalidVehicle = {
        name: "AB",
        type: "SEDAN",
        licensePlate: "ABC1234",
        status: "ACTIVE",
        mileage: 5000,
        fuelConsumption: 8.5,
      };

      const result = vehicleSchema.safeParse(invalidVehicle);
      expect(result.success).toBe(false);
    });

    it("should reject vehicle with invalid type", () => {
      const invalidVehicle = {
        name: "Test Vehicle",
        type: "INVALID",
        licensePlate: "ABC1234",
        status: "ACTIVE",
        mileage: 5000,
        fuelConsumption: 8.5,
      };

      const result = vehicleSchema.safeParse(invalidVehicle);
      expect(result.success).toBe(false);
    });

    it("should reject vehicle with negative mileage", () => {
      const invalidVehicle = {
        name: "Test Vehicle",
        type: "SEDAN",
        licensePlate: "ABC1234",
        status: "ACTIVE",
        mileage: -100,
        fuelConsumption: 8.5,
      };

      const result = vehicleSchema.safeParse(invalidVehicle);
      expect(result.success).toBe(false);
    });

    it("should convert licensePlate to uppercase", () => {
      const vehicle = {
        name: "Test Vehicle",
        type: "SEDAN",
        licensePlate: "abc1234",
        status: "ACTIVE",
        mileage: 5000,
        fuelConsumption: 8.5,
      };

      const result = vehicleSchema.safeParse(vehicle);
      if (result.success) {
        expect(result.data.licensePlate).toBe("ABC1234");
      }
    });
  });

  describe("loginSchema", () => {
    it("should validate correct login credentials", () => {
      const validLogin = {
        email: "user@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidLogin = {
        email: "invalid-email",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const invalidLogin = {
        email: "user@example.com",
        password: "12345",
      };

      const result = loginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });
  });
});
