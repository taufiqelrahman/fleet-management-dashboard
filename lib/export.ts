import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import type { Vehicle } from "@/lib/types";

export function exportToCSV(vehicles: Vehicle[], filename = "vehicles") {
  const data = vehicles.map((vehicle) => ({
    Name: vehicle.name,
    Type: vehicle.type,
    "License Plate": vehicle.licensePlate,
    Status: vehicle.status,
    Driver: vehicle.driverName || "-",
    "Mileage (km)": vehicle.mileage,
    "Fuel Consumption (L/100km)": vehicle.fuelConsumption,
    "Last Maintenance": vehicle.lastMaintenance
      ? new Date(vehicle.lastMaintenance).toLocaleDateString()
      : "-",
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(vehicles: Vehicle[], filename = "vehicles") {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Fleet Vehicles Report", 14, 22);

  // Date
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

  // Table
  const tableData = vehicles.map((vehicle) => [
    vehicle.name,
    vehicle.type,
    vehicle.licensePlate,
    vehicle.status,
    vehicle.driverName || "-",
    vehicle.mileage.toString(),
    vehicle.fuelConsumption.toFixed(2),
    vehicle.lastMaintenance
      ? new Date(vehicle.lastMaintenance).toLocaleDateString()
      : "-",
  ]);

  autoTable(doc, {
    head: [
      [
        "Name",
        "Type",
        "Plate",
        "Status",
        "Driver",
        "Mileage",
        "Fuel (L/100km)",
        "Last Maintenance",
      ],
    ],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`${filename}.pdf`);
}
