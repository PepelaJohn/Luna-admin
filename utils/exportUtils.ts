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

  // Convert records to CSV rows
  const csvRows = records.map(record => [
    format(new Date(record.date), 'yyyy-MM-dd'),
    record.type,
    `"${record.title}"`,
    `"${record.description}"`,
    record.amount.toString(),
    record.currency,
    record.category,
    record.status,
    record.submittedBy,
    format(new Date(record.dateSubmitted), 'yyyy-MM-dd'),
    record.dateApproved ? format(new Date(record.dateApproved), 'yyyy-MM-dd') : '',
    record.datePaid ? format(new Date(record.datePaid), 'yyyy-MM-dd') : '',
    record.approvedBy || ''
  ]);

  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  // Add summary information as comments if available
  if (summary) {
    csvContent += `# Financial Summary\n`;
    csvContent += `# Total Income: ${summary.totalIncome}\n`;
    csvContent += `# Total Expenses: ${summary.totalExpenses}\n`;
    csvContent += `# Net Balance: ${summary.netBalance}\n`;
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
    
    // Set up colors
    const primaryColor = [31, 41, 55]; // gray-800
    const secondaryColor = [107, 114, 128]; // gray-500
    const greenColor = [5, 150, 105]; // green-600
    const redColor = [220, 38, 38]; // red-600
    
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
      const summaryData = [
        ['Total Income', `$${summary.totalIncome.toLocaleString()}`, greenColor],
        ['Total Expenses', `$${summary.totalExpenses.toLocaleString()}`, redColor],
        ['Net Balance', `$${summary.netBalance.toLocaleString()}`, summary.netBalance >= 0 ? greenColor : redColor],
        ['Available Budget', `$${summary.availableBudget.toLocaleString()}`, primaryColor]
      ];
      
      summaryData.forEach((item, index) => {
        const x = index % 2 === 0 ? 20 : 105;
        const y = yPosition + Math.floor(index / 2) * 20;
        
        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        doc.text(item[0] as string, x, y);
        
        doc.setFontSize(14);
        doc.setTextColor(...(item[2] as number[]));
        doc.text(item[1] as string, x, y + 8);
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
    
    // Draw table header
    doc.setFillColor(249, 250, 251); // Light gray background
    doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    
    let currentX = startX;
    tableHeaders.forEach((header, index) => {
      doc.text(header, currentX + 2, currentY + 5);
      currentX += colWidths[index];
    });
    
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
        doc.setFillColor(249, 250, 251);
        doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        
        currentX = startX;
        tableHeaders.forEach((header, index) => {
          doc.text(header, currentX + 2, currentY + 5);
          currentX += colWidths[index];
        });
        
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
      currentX = startX;
      colWidths.forEach(width => {
        doc.line(currentX, currentY, currentX, currentY + rowHeight);
        currentX += width;
      });
      doc.line(startX, currentY + rowHeight, startX + colWidths.reduce((a, b) => a + b, 0), currentY + rowHeight);
      
      // Add row data
      const rowData = [
        format(new Date(record.date), 'MMM dd, yyyy'),
        record.type.charAt(0).toUpperCase() + record.type.slice(1),
        record.title.length > 20 ? record.title.substring(0, 20) + '...' : record.title,
        `$${record.amount.toLocaleString()}`,
        record.category.length > 12 ? record.category.substring(0, 12) + '...' : record.category,
        record.status.charAt(0).toUpperCase() + record.status.slice(1)
      ];
      
      currentX = startX;
      rowData.forEach((cellData, colIndex) => {
        // Set color for status column
        if (colIndex === 5) {
          const status = record.status;
          if (status === 'approved') {
            doc.setTextColor(...greenColor);
          } else if (status === 'pending') {
            doc.setTextColor(217, 119, 6); // orange-600
          } else if (status === 'paid') {
            doc.setTextColor(124, 58, 237); // purple-600
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
    alert('Error generating PDF. Please try again.');
  }
};


// Utility function to get filtered data based on active tab
export const getExportData = (
  records: FinancialRecord[],
  activeTab: string
): FinancialRecord[] => {
  switch (activeTab) {
    case 'income':
      return records.filter(record => record.type === 'income');
    case 'expenses':
      return records.filter(record => record.type === 'expenditure');
    case 'approval':
      return records.filter(record => record.status === 'pending');
    default:
      return records;
  }
};
