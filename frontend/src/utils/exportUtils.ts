import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Tipos para los datos de exportación
export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title?: string;
  subtitle?: string;
  filename?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts?: boolean;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter';
}

// Utilidades de formato
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Exportación a PDF
export const exportToPDF = (data: ExportData, options: ExportOptions = { format: 'pdf' }): void => {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: options.pageSize || 'a4'
  });

  // Configuración de colores Roda
  const rodaYellow: [number, number, number] = [235, 255, 0];
  const rodaBlack: [number, number, number] = [12, 13, 13];
  const rodaGray: [number, number, number] = [107, 114, 128];

  // Header con logo y título
  doc.setFillColor(...rodaYellow);
  doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');
  
  // Título principal
  doc.setTextColor(...rodaBlack);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RODA', 15, 15);
  
  if (data.title) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(data.title, 15, 35);
  }
  
  if (data.subtitle) {
    doc.setTextColor(...rodaGray);
    doc.setFontSize(12);
    doc.text(data.subtitle, 15, 45);
  }

  // Información de generación
  const now = new Date();
  doc.setFontSize(10);
  doc.setTextColor(...rodaGray);
  doc.text(`Generado el: ${formatDateTime(now.toISOString())}`, 15, data.subtitle ? 55 : 50);

  // Tabla de datos
  const startY = data.subtitle ? 65 : 60;
  
  autoTable(doc, {
    head: [data.headers],
    body: data.rows,
    startY: startY,
    theme: 'striped',
    headStyles: {
      fillColor: rodaYellow,
      textColor: rodaBlack,
      fontStyle: 'bold',
      fontSize: 11
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [51, 51, 51]
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    margin: { left: 15, right: 15 },
    styles: {
      cellPadding: 5,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...rodaGray);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      'Hecho con ❤️ por Julian Bastidas',
      15,
      doc.internal.pageSize.height - 10
    );
  }

  // Descargar el archivo
  const filename = data.filename || `reporte_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

// Exportación a Excel
export const exportToExcel = (data: ExportData): void => {
  // Crear un nuevo workbook
  const wb = XLSX.utils.book_new();
  
  // Crear datos con headers
  const wsData = [data.headers, ...data.rows];
  
  // Crear worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Configurar ancho de columnas
  const colWidths = data.headers.map(() => ({ wch: 15 }));
  ws['!cols'] = colWidths;
  
  // Agregar worksheet al workbook
  const sheetName = data.title || 'Reporte';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Generar archivo y descargar
  const filename = data.filename || `reporte_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
};

// Exportación a CSV
export const exportToCSV = (data: ExportData): void => {
  // Crear contenido CSV
  const csvContent = [
    data.headers.join(','),
    ...data.rows.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell}"` 
          : cell
      ).join(',')
    )
  ].join('\n');
  
  // Crear Blob y descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = data.filename || `reporte_${new Date().toISOString().split('T')[0]}.csv`;
  saveAs(blob, filename);
};

// Función principal de exportación
export const exportData = (data: ExportData, options: ExportOptions): void => {
  switch (options.format) {
    case 'pdf':
      exportToPDF(data, options);
      break;
    case 'excel':
      exportToExcel(data);
      break;
    case 'csv':
      exportToCSV(data);
      break;
    default:
      console.error('Formato de exportación no soportado:', options.format);
  }
};

// Utilidades específicas para diferentes tipos de datos
export const prepareScheduleData = (schedules: Array<Record<string, unknown>>): ExportData => {
  return {
    title: 'Cronograma de Pagos',
    subtitle: `Reporte generado el ${formatDateTime(new Date().toISOString())}`,
    headers: [
      'N° Cuota',
      'Producto',
      'Fecha Vencimiento',
      'Valor Cuota',
      'Estado',
      'Crédito ID'
    ],
    rows: schedules.map(schedule => [
      schedule.num_cuota,
      (schedule.credit_info as Record<string, unknown>)?.producto || 'N/A',
      formatDate(schedule.fecha_vencimiento as string),
      formatCurrency(parseFloat(schedule.valor_cuota as string)),
      ((schedule.estado as string).charAt(0).toUpperCase() + (schedule.estado as string).slice(1)),
      (schedule.credit_info as Record<string, unknown>)?.credito_id || 'N/A'
    ]) as (string | number)[][],
    filename: `cronograma_${new Date().toISOString().split('T')[0]}.pdf`
  };
};

export const prepareCreditsData = (credits: Array<Record<string, unknown>>): ExportData => {
  return {
    title: 'Reporte de Créditos',
    subtitle: `Reporte generado el ${formatDateTime(new Date().toISOString())}`,
    headers: [
      'Crédito ID',
      'Producto',
      'Inversión',
      'Cuotas Totales',
      'TEA',
      'Fecha Desembolso',
      'Estado'
    ],
    rows: credits.map(credit => [
      credit.credito_id,
      credit.producto,
      formatCurrency(parseFloat(credit.inversion as string)),
      credit.cuotas_totales,
      `${(parseFloat(credit.tea as string) * 100).toFixed(2)}%`,
      formatDate(credit.fecha_desembolso as string),
      ((credit.estado as string).charAt(0).toUpperCase() + (credit.estado as string).slice(1))
    ]) as (string | number)[][],
    filename: `creditos_${new Date().toISOString().split('T')[0]}.pdf`
  };
};

export const preparePaymentsData = (payments: Array<Record<string, unknown>>): ExportData => {
  return {
    title: 'Reporte de Pagos',
    subtitle: `Reporte generado el ${formatDateTime(new Date().toISOString())}`,
    headers: [
      'Pago ID',
      'Fecha Pago',
      'Monto',
      'Medio',
      'Crédito ID',
      'N° Cuota'
    ],
    rows: payments.map(payment => [
      payment.pago_id,
      formatDate(payment.fecha_pago as string),
      formatCurrency(parseFloat(payment.monto as string)),
      ((payment.medio as string).charAt(0).toUpperCase() + (payment.medio as string).slice(1)),
      payment.credito || 'N/A',
      payment.cuota || 'N/A'
    ]) as (string | number)[][],
    filename: `pagos_${new Date().toISOString().split('T')[0]}.pdf`
  };
};

// Función para compartir datos (WhatsApp, Email, etc.)
export const shareData = (data: ExportData, method: 'whatsapp' | 'email'): void => {
  const summary = `
*${data.title}*
${data.subtitle || ''}

Total de registros: ${data.rows.length}
Generado el: ${formatDateTime(new Date().toISOString())}

_Reporte generado desde la app de Roda_
  `;

  switch (method) {
    case 'whatsapp':
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
      window.open(whatsappUrl, '_blank');
      break;
    case 'email':
      const emailUrl = `mailto:?subject=${encodeURIComponent(data.title || 'Reporte')}&body=${encodeURIComponent(summary)}`;
      window.open(emailUrl, '_blank');
      break;
  }
};
