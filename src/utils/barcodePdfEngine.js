import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

export { formatRupiah, formatDateIndo } from './formatters';

/**
 * Authentic retail scanner audio beep using Web Audio API (synthesized frequency)
 */
export const playBarcodeBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // Audio autoplay restrictions gracefully handled
  }
};

/**
 * Generate a Barcode image (Data URL) using JsBarcode on an offscreen SVG/canvas
 */
export const generateBarcodeDataUrl = (code, format = 'CODE128') => {
  const canvas = document.createElement('canvas');
  try {
    JsBarcode(canvas, code, {
      format: format,
      width: 2,
      height: 48,
      displayValue: false, // We render clean text manually
      margin: 0,
      background: '#ffffff',
      lineColor: '#000000'
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to generate barcode:', err);
    return null;
  }
};

/**
 * Generate a QR code image (Data URL)
 */
export const generateQrDataUrl = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR:', err);
    return null;
  }
};

/**
 * Export Single or Multiple Labels to Continuous Thermal Roll PDF (50x30mm or 40x30mm)
 * Mode: 2D QR Code Layout (iOS Camera Compatible) & No Physical Price (Cara 1)
 */
export const exportThermalRollPdf = async (units, widthMm = 50, heightMm = 30) => {
  if (!units || units.length === 0) return;

  // Create PDF with custom dimensions matching the thermal label
  const doc = new jsPDF({
    orientation: widthMm >= heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm]
  });

  for (let index = 0; index < units.length; index++) {
    const unit = units[index];
    if (index > 0) {
      doc.addPage([widthMm, heightMm], widthMm >= heightMm ? 'landscape' : 'portrait');
    }

    // Outer border guide
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.rect(1, 1, widthMm - 2, heightMm - 2);

    // Header: Brand & Origin
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(0, 0, 0);
    doc.text('iConicstore', 2.5, 3.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(51, 65, 85); // Slate navy #334155 matching user photo
    const originLabel = unit.signalOrigin.includes('iBox') ? 'Resmi iBox' : unit.signalOrigin.includes('Bea Cukai') ? 'Bea Cukai' : 'All Operator';
    doc.text(originLabel, widthMm - 2.5, 3.8, { align: 'right' });

    // Header Divider Line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.15);
    doc.line(2, 4.6, widthMm - 2, 4.6);

    // Left Column: 2D QR Code (Quickly recognized by native iOS/iPhone & Android camera)
    const qrImg = await generateQrDataUrl(unit.barcodeCode || unit.imei || unit.id);
    if (qrImg) {
      doc.addImage(qrImg, 'PNG', 2.5, 5.5, 17.5, 17.5);
    }

    // Human-readable code underneath QR Code (Single line, centered, no wrap)
    doc.setFont('courier', 'bold');
    doc.setFontSize(4.6);
    doc.setTextColor(0, 0, 0);
    doc.text(unit.barcodeCode || unit.imei, 11.25, 25.0, { align: 'center' });

    // Vertical Divider Line between QR and Details
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.15);
    doc.line(21, 4.6, 21, 28.5);

    // Right Column: Unit Metadata (No prices printed - Cara 1)
    const rightX = 22.5;
    const rightW = widthMm - rightX - 2.5;

    // Model Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(unit.modelName.length > 25 ? 5.5 : 6.2);
    doc.setTextColor(0, 0, 0);
    doc.text(unit.modelName.substring(0, 32), rightX, 8);

    // Color & Specs
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.6);
    doc.setTextColor(70, 70, 70);
    if (unit.color) {
      doc.text(unit.color.substring(0, 28), rightX, 11.2);
    }

    // IMEI Number
    doc.setFont('courier', 'bold');
    doc.setFontSize(4.8);
    doc.setTextColor(0, 0, 0);
    doc.text(`IMEI: ${unit.imei}`, rightX, 14.6);

    // Condition & Battery Health (Fix: prevent truncation of "%)")
    const conditionText = unit.batteryHealth ? `${unit.condition} (BH: ${unit.batteryHealth}%)` : unit.condition;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(conditionText.length > 28 ? 4.1 : 4.6);
    doc.setTextColor(60, 60, 60);
    doc.text(conditionText.substring(0, 36), rightX, 18);

    // Warranty
    const warrantyText = `Garansi: ${unit.storeWarranty}`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(warrantyText.length > 28 ? 4.1 : 4.6);
    doc.setTextColor(70, 70, 70);
    doc.text(warrantyText.substring(0, 36), rightX, 21.2);

    // Callout Pill: Scan QR untuk Info & Harga (NO EMOTICON, light blue rounded pill matching preview)
    doc.setFillColor(239, 246, 255); // #EFF6FF
    doc.setDrawColor(219, 234, 254); // #DBEAFE
    doc.setLineWidth(0.15);
    doc.roundedRect(rightX, 23.3, rightW, 4.4, 0.8, 0.8, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.4);
    doc.setTextColor(29, 78, 216); // #1D4ED8
    doc.text('Scan QR untuk Info & Harga', rightX + (rightW / 2), 26.3, { align: 'center' });
  }

  const fileName = units.length === 1 
    ? `QR_Stiker_${units[0].modelName.replace(/\s+/g, '_')}_${units[0].barcodeCode}.pdf`
    : `Bulk_QR_Stiker_iConicstore_${units.length}_units.pdf`;

  doc.save(fileName);
};

/**
 * Export Multiple Labels to A4 Sheet Grid Sticker PDF (e.g. Tom & Jerry format)
 * Mode: 2D QR Code Layout (iOS Camera Compatible) & No Physical Price (Cara 1)
 */
export const exportA4GridStickerPdf = async (units, cols = 3, rows = 8) => {
  if (!units || units.length === 0) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4' // 210 x 297 mm
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 10;
  const marginTop = 12;
  const colGap = 4;
  const rowGap = 3;

  const cellWidth = (pageWidth - (marginLeft * 2) - ((cols - 1) * colGap)) / cols;
  const cellHeight = (pageHeight - (marginTop * 2) - ((rows - 1) * rowGap)) / rows;

  let currentCol = 0;
  let currentRow = 0;

  for (let index = 0; index < units.length; index++) {
    const unit = units[index];
    // If exceeded cells on page, add new page
    if (currentRow >= rows) {
      doc.addPage('a4', 'portrait');
      currentCol = 0;
      currentRow = 0;
    }

    const x = marginLeft + (currentCol * (cellWidth + colGap));
    const y = marginTop + (currentRow * (cellHeight + rowGap));

    // Cell border guide
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.15);
    doc.rect(x, y, cellWidth, cellHeight);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(0, 0, 0);
    doc.text('iConicstore', x + 2, y + 3.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(51, 65, 85); // Slate navy #334155 matching user photo
    const originLabel = unit.signalOrigin.includes('iBox') ? 'Resmi iBox' : unit.signalOrigin.includes('Bea Cukai') ? 'Bea Cukai' : 'All Operator';
    doc.text(originLabel, x + cellWidth - 2, y + 3.8, { align: 'right' });

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.15);
    doc.line(x + 2, y + 4.6, x + cellWidth - 2, y + 4.6);

    // Left: QR Code (2D scannable by iOS camera)
    const qrImg = await generateQrDataUrl(unit.barcodeCode || unit.imei || unit.id);
    const qrSize = 17.5;
    if (qrImg) {
      doc.addImage(qrImg, 'PNG', x + 2.5, y + 5.5, qrSize, qrSize);
    }

    // Code
    doc.setFont('courier', 'bold');
    doc.setFontSize(4.6);
    doc.setTextColor(0, 0, 0);
    doc.text(unit.barcodeCode || unit.imei, x + 2.5 + (qrSize / 2), y + 25.0, { align: 'center' });

    // Vertical Divider
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.15);
    doc.line(x + 21, y + 4.6, x + 21, y + cellHeight - 1);

    // Right Column: Details without price
    const detailX = x + 22.5;
    const rightW = cellWidth - 24.5;

    // Product Model
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(unit.modelName.length > 25 ? 5.5 : 6.2);
    doc.setTextColor(0, 0, 0);
    doc.text(unit.modelName.substring(0, 32), detailX, y + 8);

    // Color & Specs
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.6);
    doc.setTextColor(70, 70, 70);
    if (unit.color) {
      doc.text(unit.color.substring(0, 28), detailX, y + 11.2);
    }

    // IMEI
    doc.setFont('courier', 'bold');
    doc.setFontSize(4.8);
    doc.setTextColor(0, 0, 0);
    doc.text(`IMEI: ${unit.imei}`, detailX, y + 14.6);

    // Condition (Prevent truncation)
    const conditionText = unit.batteryHealth ? `${unit.condition} (BH: ${unit.batteryHealth}%)` : unit.condition;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(conditionText.length > 28 ? 4.1 : 4.6);
    doc.setTextColor(60, 60, 60);
    doc.text(conditionText.substring(0, 36), detailX, y + 18);

    // Warranty
    const warrantyText = `Garansi: ${unit.storeWarranty}`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(warrantyText.length > 28 ? 4.1 : 4.6);
    doc.setTextColor(70, 70, 70);
    doc.text(warrantyText.substring(0, 36), detailX, y + 21.2);

    // Scan CTA Box (no price printed, NO EMOTICON)
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(219, 234, 254);
    doc.setLineWidth(0.15);
    doc.roundedRect(detailX, y + 23.3, rightW, 4.4, 0.8, 0.8, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.4);
    doc.setTextColor(29, 78, 216);
    doc.text('Scan QR untuk Info & Harga', detailX + (rightW / 2), y + 26.3, { align: 'center' });

    // Move to next cell
    currentCol++;
    if (currentCol >= cols) {
      currentCol = 0;
      currentRow++;
    }
  }

  doc.save(`iConicstore_A4_QR_Stickers_${units.length}_units.pdf`);
};
