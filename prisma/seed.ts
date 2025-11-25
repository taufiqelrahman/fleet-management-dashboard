import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.shift.deleteMany();
  await prisma.timesheet.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleared existing data");

  // Create users with different roles
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@nextfleet.com",
      password,
      name: "Admin NextFleet",
      role: "ADMIN",
    },
  });

  const operator = await prisma.user.create({
    data: {
      email: "operator@nextfleet.com",
      password,
      name: "Operator NextFleet",
      role: "OPERATOR",
    },
  });

  const employee = await prisma.user.create({
    data: {
      email: "employee@nextfleet.com",
      password,
      name: "Employee John Doe",
      role: "EMPLOYEE",
    },
  });

  const supervisor = await prisma.user.create({
    data: {
      email: "supervisor@nextfleet.com",
      password,
      name: "Supervisor Jane Smith",
      role: "SUPERVISOR",
    },
  });

  const hr = await prisma.user.create({
    data: {
      email: "hr@nextfleet.com",
      password,
      name: "HR Manager Sarah Lee",
      role: "HR",
    },
  });

  console.log("✅ Created users:");
  console.log("  - Admin:", admin.email);
  console.log("  - Operator:", operator.email);
  console.log("  - Employee:", employee.email);
  console.log("  - Supervisor:", supervisor.email);
  console.log("  - HR:", hr.email);

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

  // Create attendance records
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const attendances = await Promise.all([
    // Admin - today (already clocked in)
    prisma.attendance.create({
      data: {
        userId: admin.id,
        date: today,
        clockIn: new Date(today.getTime() + 8 * 60 * 60 * 1000), // 8 AM
        status: "PRESENT",
        location: "Office HQ",
        notes: "Regular attendance",
      },
    }),
    // Operator - today (already clocked out)
    prisma.attendance.create({
      data: {
        userId: operator.id,
        date: today,
        clockIn: new Date(today.getTime() + 9.5 * 60 * 60 * 1000), // 9:30 AM
        clockOut: new Date(today.getTime() + 17 * 60 * 60 * 1000), // 5 PM
        status: "LATE",
        location: "Office HQ",
        notes: "Traffic jam",
      },
    }),
    // Admin - yesterday
    prisma.attendance.create({
      data: {
        userId: admin.id,
        date: yesterday,
        clockIn: new Date(yesterday.getTime() + 8.25 * 60 * 60 * 1000), // 8:15 AM
        clockOut: new Date(yesterday.getTime() + 17.5 * 60 * 60 * 1000), // 5:30 PM
        status: "PRESENT",
        location: "Office HQ",
      },
    }),
    // Operator - yesterday
    prisma.attendance.create({
      data: {
        userId: operator.id,
        date: yesterday,
        clockIn: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000), // 8 AM
        clockOut: new Date(yesterday.getTime() + 16 * 60 * 60 * 1000), // 4 PM
        status: "PRESENT",
        location: "Office HQ",
      },
    }),
  ]);

  console.log("✅ Created", attendances.length, "attendance records");

  // Create timesheets
  const timesheets = await Promise.all([
    // Operator - completed driving activity
    prisma.timesheet.create({
      data: {
        userId: operator.id,
        vehicleId: vehicles[0].id,
        activityType: "DRIVING",
        startTime: new Date(yesterday.getTime() + 9 * 60 * 60 * 1000),
        endTime: new Date(yesterday.getTime() + 13 * 60 * 60 * 1000),
        duration: 240, // 4 hours in minutes
        description: "Delivery route to customer locations",
        location: "Jakarta - Bekasi",
      },
    }),
    // Admin - completed maintenance activity
    prisma.timesheet.create({
      data: {
        userId: admin.id,
        vehicleId: vehicles[2].id,
        activityType: "MAINTENANCE",
        startTime: new Date(yesterday.getTime() + 10 * 60 * 60 * 1000),
        endTime: new Date(yesterday.getTime() + 12 * 60 * 60 * 1000),
        duration: 120, // 2 hours in minutes
        description: "Oil change and tire rotation",
        location: "Service Center A",
      },
    }),
    // Operator - completed fueling activity
    prisma.timesheet.create({
      data: {
        userId: operator.id,
        vehicleId: vehicles[1].id,
        activityType: "FUELING",
        startTime: new Date(yesterday.getTime() + 14 * 60 * 60 * 1000),
        endTime: new Date(yesterday.getTime() + 14.25 * 60 * 60 * 1000),
        duration: 15, // 15 minutes
        description: "Full tank refuel",
        location: "Pertamina Station Sudirman",
      },
    }),
    // Operator - active cleaning (not completed yet)
    prisma.timesheet.create({
      data: {
        userId: operator.id,
        vehicleId: vehicles[3].id,
        activityType: "CLEANING",
        startTime: new Date(today.getTime() + 15 * 60 * 60 * 1000),
        description: "Vehicle cleaning and wash",
        location: "Office Parking",
      },
    }),
  ]);

  console.log("✅ Created", timesheets.length, "timesheet records");

  // Create shifts
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const shifts = await Promise.all([
    // Admin - today morning shift (ongoing)
    prisma.shift.create({
      data: {
        userId: admin.id,
        shiftType: "MORNING",
        startTime: new Date(today.getTime() + 8 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 16 * 60 * 60 * 1000),
        status: "ONGOING",
        notes: "Regular morning shift",
      },
    }),
    // Operator - today afternoon shift (scheduled)
    prisma.shift.create({
      data: {
        userId: operator.id,
        shiftType: "AFTERNOON",
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 22 * 60 * 60 * 1000),
        status: "SCHEDULED",
        notes: "Afternoon coverage",
      },
    }),
    // Admin - tomorrow morning shift
    prisma.shift.create({
      data: {
        userId: admin.id,
        shiftType: "MORNING",
        startTime: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000),
        endTime: new Date(tomorrow.getTime() + 16 * 60 * 60 * 1000),
        status: "SCHEDULED",
      },
    }),
    // Operator - tomorrow night shift
    prisma.shift.create({
      data: {
        userId: operator.id,
        shiftType: "NIGHT",
        startTime: new Date(tomorrow.getTime() + 22 * 60 * 60 * 1000),
        endTime: new Date(dayAfterTomorrow.getTime() + 6 * 60 * 60 * 1000),
        status: "SCHEDULED",
        notes: "Night security shift",
      },
    }),
    // Admin - yesterday completed shift
    prisma.shift.create({
      data: {
        userId: admin.id,
        shiftType: "MORNING",
        startTime: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000),
        endTime: new Date(yesterday.getTime() + 16 * 60 * 60 * 1000),
        status: "COMPLETED",
      },
    }),
  ]);

  console.log("✅ Created", shifts.length, "shift records");

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
