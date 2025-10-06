import { FinancialRecord, FinancialSummary } from '@/types/expenditure';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

// CSV Export Functions
export const exportToCSV = (
  records: FinancialRecord[],
  summary?: FinancialSummary,
  activeTab?: string,
  filters?: any
) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
  const filename = `expenditure-${activeTab || 'all'}-${timestamp}.csv`;

  // Create CSV headers
  const headers = [
    'Date',
    'Type',
    'Title',
    'Description',
    'Amount',
    'Currency',
    'Category',
    'Status',
    'Submitted By',
    'Date Submitted',
    'Date Approved',
    'Date Paid',
    'Approved By'
  ];

 
  const escapeCSVValue = (value: string | number | undefined | null): string => {
    if (value === null || value === undefined) return '';
    const stringValue = value.toString();
    // Escape quotes by doubling them and wrap in quotes if contains comma, quote, or newline
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Helper function to format date safely
  const formatDateSafely = (date: string | Date | undefined | null): string => {
    if (!date) return '';
    try {
      return format(new Date(date), 'yyyy-MM-dd');
    } catch (error) {
      console.warn('Invalid date format:', date);
      return '';
    }
  };

  // Convert records to CSV rows
  const csvRows = records.map(record => [
    escapeCSVValue(formatDateSafely(record.date)),
    escapeCSVValue(record.type),
    escapeCSVValue(record.title),
    escapeCSVValue(record.description),
    escapeCSVValue(record.amount),
    escapeCSVValue(record.currency),
    escapeCSVValue(record.category),
    escapeCSVValue(record.status),
    escapeCSVValue(record.submittedBy),
    escapeCSVValue(formatDateSafely(record.dateSubmitted)),
    escapeCSVValue(formatDateSafely(record.dateApproved)),
    escapeCSVValue(formatDateSafely(record.datePaid)),
    escapeCSVValue(record.approvedBy)
  ]);

  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  // Add summary information as comments if available
  if (summary) {
    csvContent += `# Financial Summary\n`;
    csvContent += `# Total Income: ${summary.totalIncome}\n`;
    csvContent += `# Total Expenses: ${summary.totalExpenditure}\n`;
    csvContent += `# Net Balance: ${summary.balance}\n`;
    csvContent += `# Available Budget: ${summary.availableBudget}\n`;
    csvContent += `# Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n`;
    csvContent += `# Active Tab: ${activeTab || 'All'}\n`;
    csvContent += `# Total Records: ${records.length}\n\n`;
  }

  csvContent += csvRows.map(row => row.join(',')).join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};

// PDF Export Functions
export const exportToPDF = async (
  records: FinancialRecord[],
  summary?: FinancialSummary,
  activeTab?: string,
  filters?: any
) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
  const filename = `expenditure-report-${activeTab || 'all'}-${timestamp}.pdf`;
  const tabTitle = activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : 'All';
  const currentDate = format(new Date(), 'MMMM dd, yyyy');

  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set up colors - using RGB values (0-255)
    const primaryColor: [number, number, number] = [31, 41, 55]; // gray-800
    const secondaryColor: [number, number, number] = [107, 114, 128]; // gray-500
    const greenColor: [number, number, number] = [5, 150, 105]; // green-600
    const redColor: [number, number, number] = [220, 38, 38]; // red-600
    const orangeColor: [number, number, number] = [217, 119, 6]; // orange-600
    const purpleColor: [number, number, number] = [124, 58, 237]; // purple-600
    
    // Helper function to format date safely for PDF
    const formatDateForPDF = (date: string | Date | undefined | null): string => {
      if (!date) return 'N/A';
      try {
        return format(new Date(date), 'MMM dd, yyyy');
      } catch (error) {
        console.warn('Invalid date format:', date);
        return 'Invalid Date';
      }
    };

    // Helper function to truncate text
    const truncateText = (text: string | undefined | null, maxLength: number): string => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Helper function to format currency
    const formatCurrency = (amount: number | undefined | null): string => {
      if (amount === null || amount === undefined) return '$0';
      return `$${amount.toLocaleString()}`;
    };
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(...primaryColor);
    doc.text(`Financial Report - ${tabTitle}`, 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(...secondaryColor);
    doc.text(`Generated on ${currentDate}`, 105, 30, { align: 'center' });
    doc.text(`Total Records: ${records.length}`, 105, 38, { align: 'center' });
    
    // Add line separator
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 45, 190, 45);
    
    let yPosition = 55;
    
    // Add summary section if available
    if (summary) {
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.text('Financial Summary', 20, yPosition);
      yPosition += 10;
      
      // Summary cards in a 2x2 grid
      const summaryData: Array<[string, string, [number, number, number]]> = [
        ['Total Income', formatCurrency(summary.totalIncome), greenColor],
        ['Total Expenses', formatCurrency(summary.totalExpenditure), redColor],
        ['Net Balance', formatCurrency(summary.balance), summary.balance   >= 0 ? greenColor : redColor],
        ['Available Budget', formatCurrency(summary.availableBudget), primaryColor]
      ];
      
      summaryData.forEach((item, index) => {
        const x = index % 2 === 0 ? 20 : 105;
        const y = yPosition + Math.floor(index / 2) * 20;
        
        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        doc.text(item[0], x, y);
        
        doc.setFontSize(14);
        doc.setTextColor(...item[2]);
        doc.text(item[1], x, y + 8);
      });
      
      yPosition += 50;
    }
    
    // Add transactions table
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text('Transaction Details', 20, yPosition);
    yPosition += 15;
    
    // Table configuration
    const tableHeaders = ['Date', 'Type', 'Title', 'Amount', 'Category', 'Status'];
    const colWidths = [30, 25, 60, 30, 30, 25]; // Column widths
    const rowHeight = 8;
    const startX = 20;
    let currentY = yPosition;
    
    // Function to draw table header
    const drawTableHeader = (y: number) => {
      doc.setFillColor(249, 250, 251); // Light gray background
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      
      let currentX = startX;
      tableHeaders.forEach((header, index) => {
        doc.text(header, currentX + 2, y + 5);
        currentX += colWidths[index];
      });
    };
    
    // Draw initial table header
    drawTableHeader(currentY);
    currentY += rowHeight;
    
    // Draw table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    records.forEach((record, rowIndex) => {
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
        
        // Redraw header on new page
        drawTableHeader(currentY);
        currentY += rowHeight;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
      }
      
      // Set row background color based on type
      if (record.type === 'income') {
        doc.setFillColor(240, 253, 244); // green-50
      } else {
        doc.setFillColor(254, 242, 242); // red-50
      }
      doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
      
      // Draw cell borders
      doc.setDrawColor(229, 231, 235);
      let currentX = startX;
      colWidths.forEach(width => {
        doc.line(currentX, currentY, currentX, currentY + rowHeight);
        currentX += width;
      });
      doc.line(startX, currentY + rowHeight, startX + colWidths.reduce((a, b) => a + b, 0), currentY + rowHeight);
      
      // Add row data
      const rowData = [
        formatDateForPDF(record.date),
        record.type ? record.type.charAt(0).toUpperCase() + record.type.slice(1) : 'N/A',
        truncateText(record.title, 20),
        formatCurrency(record.amount),
        truncateText(record.category, 12),
        record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'N/A'
      ];
      
      currentX = startX;
      rowData.forEach((cellData, colIndex) => {
        // Set color for status column
        if (colIndex === 5) {
          const status = record.status;
          if (status === 'approved') {
            doc.setTextColor(...greenColor);
          } else if (status === 'pending') {
            doc.setTextColor(...orangeColor);
          } else if (status === 'paid') {
            doc.setTextColor(...purpleColor);
          } else {
            doc.setTextColor(...primaryColor);
          }
        } else {
          doc.setTextColor(...primaryColor);
        }
        
        // Right align amount column
        if (colIndex === 3) {
          doc.text(cellData, currentX + colWidths[colIndex] - 2, currentY + 5, { align: 'right' });
        } else {
          doc.text(cellData, currentX + 2, currentY + 5);
        }
        currentX += colWidths[colIndex];
      });
      
      currentY += rowHeight;
    });
    
    // Draw final table border
    doc.setDrawColor(229, 231, 235);
    doc.rect(startX, yPosition, colWidths.reduce((a, b) => a + b, 0), currentY - yPosition);
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...secondaryColor);
      doc.text('Generated by Luna Admin System', 20, 285);
      doc.text(`Report ID: ${timestamp}`, 20, 292);
      doc.text(`Page ${i} of ${pageCount}`, 190, 292, { align: 'right' });
    }
    
    // Save the PDF
    doc.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report. Please try again.');
  }
};

// Utility function to get filtered data based on active tab
export const getExportData = (
  records: FinancialRecord[],
  activeTab: string
): FinancialRecord[] => {
  if (!records || !Array.isArray(records)) {
    console.warn('Invalid records array provided to getExportData');
    return [];
  }

  switch (activeTab) {
    case 'income':
      return records.filter(record => record?.type === 'income');
    case 'expenses':
      return records.filter(record => record?.type === 'expenditure');
    case 'approval':
      return records.filter(record => record?.status === 'pending');
    default:
      return records;
  }
};