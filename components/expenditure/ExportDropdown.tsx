import React, { useState } from 'react';
import { Download, FileText, Table, ChevronDown } from 'lucide-react';
import { FinancialRecord, FinancialSummary } from '@/types/expenditure';
import { exportToCSV, exportToPDF, getExportData } from '@/utils/exportUtils';

interface ExportDropdownProps {
  records: FinancialRecord[];
  filteredRecords: FinancialRecord[];
  summary?: FinancialSummary;
  activeTab: string;
  filters?: any;
}

export default function ExportDropdown({
  records,
  filteredRecords,
  summary,
  activeTab,
  filters
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: 'csv' | 'pdf', useFiltered: boolean = true) => {
    const dataToExport = useFiltered ? filteredRecords : getExportData(records, activeTab);
    
    if (format === 'csv') {
      exportToCSV(dataToExport, summary, activeTab, filters);
    } else if (format === 'pdf') {
      exportToPDF(dataToExport, summary, activeTab, filters);
    }
    
    setIsOpen(false);
  };

  const getTabDisplayName = () => {
    switch (activeTab) {
      case 'overview': return 'All Data';
      case 'income': return 'Income';
      case 'expenses': return 'Expenses';
      case 'approval': return 'Pending Approval';
      default: return 'Data';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
      >
        <Download size={18} />
        Export
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">Export Options</h3>
              <p className="text-sm text-gray-500">
                {filteredRecords.length} records • {getTabDisplayName()}
              </p>
            </div>
            
            <div className="p-2">
              {/* CSV Export Options */}
              <div className="mb-2">
                <button
                  onClick={() => handleExport('csv', true)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Table size={16} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Export as CSV</div>
                    <div className="text-sm text-gray-500">Spreadsheet format</div>
                  </div>
                </button>
              </div>

              {/* PDF Export Options */}
              <div className="mb-2">
                <button
                  onClick={() => handleExport('pdf', true)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText size={16} className="text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Export as PDF</div>
                    <div className="text-sm text-gray-500">Professional report</div>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-2"></div>

              {/* Export All Data Options */}
              <div className="text-xs text-gray-500 px-3 py-1 uppercase tracking-wide font-medium">
                Export All Data
              </div>
              
              <button
                onClick={() => handleExport('csv', false)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors text-sm"
              >
                <Table size={14} className="text-gray-400" />
                <span className="text-gray-600">All records as CSV</span>
              </button>
              
              <button
                onClick={() => handleExport('pdf', false)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors text-sm"
              >
                <FileText size={14} className="text-gray-400" />
                <span className="text-gray-600">All records as PDF</span>
              </button>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
              <p className="text-xs text-gray-500">
                Exports include {activeTab === 'overview' ? 'summary statistics and ' : ''}transaction details
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
