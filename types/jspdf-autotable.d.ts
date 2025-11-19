declare module "jspdf-autotable" {
  import { jsPDF } from "jspdf";

  interface AutoTableOptions {
    head?: string[][];
    body?: string[][];
    startY?: number;
    styles?: {
      fontSize?: number;
      cellPadding?: number;
      overflow?: string;
    };
    headStyles?: {
      fillColor?: number[];
      textColor?: number[];
      fontStyle?: string;
    };
    bodyStyles?: {
      fillColor?: number[];
      textColor?: number[];
    };
    alternateRowStyles?: {
      fillColor?: number[];
    };
    columnStyles?: Record<number, { cellWidth?: number | "auto" }>;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    theme?: "striped" | "grid" | "plain";
  }

  function autoTable(doc: jsPDF, options: AutoTableOptions): void;

  export default autoTable;
}
