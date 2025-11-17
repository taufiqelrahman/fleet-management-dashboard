import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.trip.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleared existing data");

  // Create users
  const adminPassword = await bcrypt.hash("password123", 10);
  const operatorPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@nextfleet.com",
      password: adminPassword,
      name: "Admin NextFleet",
      role: "ADMIN",
    },
  });

  const operator = await prisma.user.create({
    data: {
      email: "operator@nextfleet.com",
      password: operatorPassword,
      name: "Operator NextFleet",
      role: "OPERATOR",
    },
  });

  console.log("✅ Created users:", admin.email, operator.email);

  // Create vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        name: "Toyota Avanza",
        type: "SEDAN",
        licensePlate: "B1234ABC",
        status: "ACTIVE",
        driverId: "d1",
        driverName: "Budi Santoso",
        lastMaintenance: new Date("2024-10-15"),
        nextMaintenance: new Date("2025-01-15"),
        mileage: 45200,
        fuelConsumption: 8.5,
      },
    }),
    prisma.vehicle.create({
      data: {
        name: "Daihatsu Gran Max",
        type: "VAN",
        licensePlate: "B5678XYZ",
        status: "ACTIVE",
        driverId: "d2",
        driverName: "Siti Nurhaliza",
        lastMaintenance: new Date("2024-09-20"),
        nextMaintenance: new Date("2024-12-20"),
        mileage: 62800,
        fuelConsumption: 12.3,
      },
    }),
    prisma.vehicle.create({
      data: {
        name: "Mitsubishi Colt Diesel",
        type: "TRUCK",
        licensePlate: "B9012TRK",
        status: "MAINTENANCE",
        driverId: "d3",
        driverName: "Ahmad Hidayat",
        lastMaintenance: new Date("2024-11-01"),
        nextMaintenance: new Date("2024-11-20"),
        mileage: 98500,
        fuelConsumption: 18.7,
      },
    }),
    prisma.vehicle.create({
      data: {
        name: "Toyota Fortuner",
        type: "SUV",
        licensePlate: "B3456DEF",
        status: "ACTIVE",
        driverId: "d4",
        driverName: "Dewi Lestari",
        lastMaintenance: new Date("2024-08-10"),
        nextMaintenance: new Date("2024-12-10"),
        mileage: 34100,
        fuelConsumption: 11.2,
      },
    }),
    prisma.vehicle.create({
      data: {
        name: "Honda City",
        type: "SEDAN",
        licensePlate: "B7890GHI",
        status: "INACTIVE",
        driverId: "d5",
        driverName: "Rudi Hermawan",
        lastMaintenance: new Date("2024-07-25"),
        nextMaintenance: new Date("2024-11-25"),
        mileage: 28900,
        fuelConsumption: 7.8,
      },
    }),
    prisma.vehicle.create({
      data: {
        name: "Suzuki Carry",
        type: "VAN",
        licensePlate: "B2345JKL",
        status: "ACTIVE",
        driverId: "d6",
        driverName: "Rina Wijaya",
        lastMaintenance: new Date("2024-10-05"),
        nextMaintenance: new Date("2025-01-05"),
        mileage: 51200,
        fuelConsumption: 13.1,
      },
    }),
  ]);

  console.log("✅ Created", vehicles.length, "vehicles");

  // Helper function to get random date within last 6 months
  const getRandomDateLast6Months = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 12) + 6); // Random hour between 6am-6pm
    date.setMinutes(Math.floor(Math.random() * 60));
    return date;
  };

  const addHours = (date: Date, hours: number) => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  };

  // Create trips for each vehicle (spread over last 6 months)
  const trips = [];

  // Avanza trips (most recent)
  trips.push(
    await prisma.trip.create({
      data: {
        vehicleId: vehicles[0].id,
        startDate: getRandomDateLast6Months(3),
        endDate: addHours(getRandomDateLast6Months(3), 4.5),
        distance: 125,
        fuelUsed: 10.5,
        destination: "Kantor Pusat Jakarta",
        driverName: "Budi Santoso",
      },
    }),
    await prisma.trip.create({
      data: {
        vehicleId: vehicles[0].id,
        startDate: getRandomDateLast6Months(10),
        endDate: addHours(getRandomDateLast6Months(10), 5.5),
        distance: 98,
        fuelUsed: 8.2,
        destination: "Meeting Klien - Jakarta Utara",
        driverName: "Budi Santoso",
      },
    }),
    await prisma.trip.create({
      data: {
        vehicleId: vehicles[0].id,
        startDate: getRandomDateLast6Months(25),
        endDate: addHours(getRandomDateLast6Months(25), 4.5),
        distance: 87,
        fuelUsed: 7.5,
        destination: "Bandara Soekarno-Hatta",
        driverName: "Budi Santoso",
      },
    })
  );

  // Gran Max trips
  const granMaxTrip1Start = getRandomDateLast6Months(7);
  const granMaxTrip2Start = getRandomDateLast6Months(15);

  trips.push(
    await prisma.trip.create({
      data: {
        vehicleId: vehicles[1].id,
        startDate: granMaxTrip1Start,
        endDate: addHours(granMaxTrip1Start, 11.5),
        distance: 245,
        fuelUsed: 30.1,
        destination: "Pengiriman Barang - Bekasi",
        driverName: "Siti Nurhaliza",
      },
    }),
    await prisma.trip.create({
      data: {
        vehicleId: vehicles[1].id,
        startDate: granMaxTrip2Start,
        endDate: addHours(granMaxTrip2Start, 14.5),
        distance: 312,
        fuelUsed: 38.5,
        destination: "Gudang Tangerang",
        driverName: "Siti Nurhaliza",
      },
    })
  );

  // Colt Diesel trips
  const coltDieselStart = getRandomDateLast6Months(45);

  trips.push(
    await prisma.trip.create({
      data: {
        vehicleId: vehicles[2].id,
        startDate: coltDieselStart,
        endDate: addHours(coltDieselStart, 18),
        distance: 456,
        fuelUsed: 85.3,
        destination: "Pengiriman Antar Kota - Bandung",
        driverName: "Ahmad Hidayat",
      },
    })
  );

  // Fortuner trips
  const fortunerTrip1Start = getRandomDateLast6Months(5);
  const fortunerTrip2Start = getRandomDateLast6Months(20);

  trips.push(
    await prisma.trip.create({
      data: {
        vehicleId: vehicles[3].id,
        startDate: fortunerTrip1Start,
        endDate: addHours(fortunerTrip1Start, 9),
        distance: 156,
        fuelUsed: 17.5,
        destination: "Inspeksi Cabang Bogor",
        driverName: "Dewi Lestari",
      },
    }),
    await prisma.trip.create({
      data: {
        vehicleId: vehicles[3].id,
        startDate: fortunerTrip2Start,
        endDate: addHours(fortunerTrip2Start, 6),
        distance: 123,
        fuelUsed: 13.8,
        destination: "Meeting Puncak",
        driverName: "Dewi Lestari",
      },
    })
  );

  // Suzuki Carry trips
  const suzukiCarryStart = getRandomDateLast6Months(4);

  trips.push(
    await prisma.trip.create({
      data: {
        vehicleId: vehicles[5].id,
        startDate: suzukiCarryStart,
        endDate: addHours(suzukiCarryStart, 8),
        distance: 178,
        fuelUsed: 23.3,
        destination: "Distribusi Pasar Tanah Abang",
        driverName: "Rina Wijaya",
      },
    })
  );

  console.log("✅ Created", trips.length, "trips");
  console.log("📅 All trips are distributed within the last 6 months");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
