'use client'
import React, { useState } from "react";
import {
  ChevronDown,
  Download,
  FileText,
  FileSpreadsheet,
  File,
} from "lucide-react";

// You'll need to install these packages:
// npm install @react-pdf/renderer react-pdf

import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink,

} from '@react-pdf/renderer';

// Types
interface LogResponse {
  _id: string;
  action: string;
  entity: string;
  entityId: string;
  performedBy: {
    email: string;
    name: string;
    role: "normal" | "corporate" | "admin" | "super_admin";
    _id: string;
  };
  metadata: {
    old: any;
    reason?: string;
    changes: any[];
  };
  ip: string;
  userAgent: string;
  severity: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
   
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 3,
  },
  logEntry: {
    marginBottom: 15,
    border:'2px',
    borderColor: '#DDDDDD',
    padding: 10,
  },
  logHeader: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    marginBottom: 10,
    margin: -10,
    
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logTitle: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  logDate: {
    fontSize: 9,
    color: '#666666',
  },
  field: {
    flexDirection: 'row',
    marginBottom: 4,
    marginTop:20
  },
  fieldLabel: {
    fontWeight: 'bold',
    minWidth: 80,
    marginRight: 10,
  },
  fieldValue: {
    flex: 1,
  },
  severityCritical: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  severityHigh: {
    color: '#EA580C',
    fontWeight: 'bold',
  },
  severityMedium: {
    color: '#CA8A04',
    fontWeight: 'bold',
  },
  severityLow: {
    color: '#16A34A',
    fontWeight: 'bold',
  },
  changesSection: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F9F9F9',
    
    borderColor: '#E5E5E5',
  },
  changesTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  changesContent: {
    fontSize: 8,
    lineHeight: 1.2,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#666666',
  },
});

// PDF Document Component
const LogsPDFDocument: React.FC<{ logs: LogResponse[] }> = ({ logs }) => {
  const formatDate = (date: Date) => new Date(date).toLocaleString();
  
  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return pdfStyles.severityCritical;
      case 'high': return pdfStyles.severityHigh;
      case 'medium': return pdfStyles.severityMedium;
      case 'low': return pdfStyles.severityLow;
      default: return {};
    }
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Activity Logs Report</Text>
          <Text style={pdfStyles.subtitle}>
            Generated on {new Date().toLocaleString()}
          </Text>
          <Text style={pdfStyles.subtitle}>
            Total Entries: {logs.length}
          </Text>
        </View>

        {/* Log Entries */}
        {logs.map((log, index) => (
          <View key={log._id} style={pdfStyles.logEntry} break={index > 0 && index % 3 === 0}>
            {/* Log Header */}
            <View style={pdfStyles.logHeader}>
              <Text style={pdfStyles.logTitle}>
                {log.action.toUpperCase()} {log.entity}
              </Text>
              <Text style={pdfStyles.logDate}>
                {formatDate(log.createdAt)}
              </Text>
            </View>

            {/* Log Details */}
            <View style={pdfStyles.field}>
              <Text style={pdfStyles.fieldLabel}>Performed By:</Text>
              <Text style={pdfStyles.fieldValue}>
                {log.performedBy.name} ({log.performedBy.email})
              </Text>
            </View>

            <View style={pdfStyles.field}>
              <Text style={pdfStyles.fieldLabel}>Role:</Text>
              <Text style={pdfStyles.fieldValue}>{log.performedBy.role}</Text>
            </View>

            <View style={pdfStyles.field}>
              <Text style={pdfStyles.fieldLabel}>Severity:</Text>
              <Text style={[pdfStyles.fieldValue, getSeverityStyle(log.severity)]}>
                {log.severity}
              </Text>
            </View>

            <View style={pdfStyles.field}>
              <Text style={pdfStyles.fieldLabel}>Status:</Text>
              <Text style={pdfStyles.fieldValue}>{log.status}</Text>
            </View>

            <View style={pdfStyles.field}>
              <Text style={pdfStyles.fieldLabel}>Entity ID:</Text>
              <Text style={pdfStyles.fieldValue}>{log.entityId}</Text>
            </View>

            <View style={pdfStyles.field}>
              <Text style={pdfStyles.fieldLabel}>IP Address:</Text>
              <Text style={pdfStyles.fieldValue}>{log.ip}</Text>
            </View>

            {log.metadata.reason && (
              <View style={pdfStyles.field}>
                <Text style={pdfStyles.fieldLabel}>Reason:</Text>
                <Text style={pdfStyles.fieldValue}>{log.metadata.reason}</Text>
              </View>
            )}

            {log.metadata.changes?.length > 0 && (
              <View style={pdfStyles.changesSection}>
                <Text style={pdfStyles.changesTitle}>Changes:</Text>
                <Text style={pdfStyles.changesContent}>
                  {JSON.stringify(log.metadata.changes, null, 2)}
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Page Numbers */}
        <Text style={pdfStyles.pageNumber} render={({ pageNumber, totalPages }) => 
          `Page ${pageNumber} of ${totalPages}`
        } fixed />
      </Page>
    </Document>
  );
};

// Download utilities (keeping original CSV and TXT functions)
const downloadUtils = {
  // Generate CSV content
  generateCSV: (logs: LogResponse[]) => {
    const headers = [
      "Date",
      "Action",
      "Entity",
      "Entity ID",
      "Performed By",
      "Email",
      "Role",
      "Severity",
      "Status",
      "IP Address",
      "Reason",
      "User Agent",
    ];

    const csvContent = [
      headers.join(","),
      ...logs.map((log) =>
        [
          log.createdAt,
          log.action,
          log.entity,
          log.entityId,
          `"${log.performedBy.name}"`,
          log.performedBy.email,
          log.performedBy.role,
          log.severity,
          log.status,
          log.ip,
          `"${log.metadata.reason || "Not-provided"}"`,
          `"${log.userAgent || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    return csvContent;
  },

  // Generate TXT content
  generateTXT: (logs: LogResponse[]) => {
    return logs
      .map((log) => {
        return `
LOG ENTRY: ${log._id}
=====================================
Date: ${new Date(log.createdAt).toLocaleString()}
Action: ${log.action}
Entity: ${log.entity}
Entity ID: ${log.entityId}
Performed By: ${log.performedBy.name} (${log.performedBy.email})
Role: ${log.performedBy.role}
Severity: ${log.severity}
Status: ${log.status}
IP Address: ${log.ip}
${log.metadata.reason ? `Reason: ${log.metadata.reason}` : ""}
User Agent: ${log.userAgent}
${
  log.metadata.changes?.length
    ? `Changes: ${JSON.stringify(log.metadata.changes, null, 2)}`
    : ""
}
=====================================
      `.trim();
      })
      .join("\n\n");
  },

  // Download file
  downloadFile: (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

// Enhanced Download Button Component
export const DownloadButton = ({ logs }:{ logs: LogResponse[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const generateFilename = (extension: string) => {
    const date = new Date().toISOString().split("T")[0];
    return `Luna-activity-logs-${date}.${extension}`;
  };

  const handleDownload = (format: "csv" | "txt") => {
    if (logs.length === 0) {
      return;
    }

    switch (format) {
      case "csv":
        const csvContent = downloadUtils.generateCSV(logs);
        downloadUtils.downloadFile(
          csvContent,
          generateFilename("csv"),
          "text/csv"
        );
        break;

      case "txt":
        const txtContent = downloadUtils.generateTXT(logs);
        downloadUtils.downloadFile(
          txtContent,
          generateFilename("txt"),
          "text/plain"
        );
        break;
    }

    setIsOpen(false);
  };

  if (logs.length === 0) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        No Logs Available
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Download
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-2">
            <button
              onClick={() => handleDownload("csv")}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <div>
                <div className="font-medium">Excel (CSV)</div>
                <div className="text-xs text-gray-500">Spreadsheet format</div>
              </div>
            </button>

            <button
              onClick={() => handleDownload("txt")}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-medium">Text File</div>
                <div className="text-xs text-gray-500">Plain text format</div>
              </div>
            </button>

            {/* PDF Download Link */}
           <div key={'no_other_key_like_this'}>
             <PDFDownloadLink
              document={<LogsPDFDocument logs={logs} />}
              fileName={generateFilename("pdf")}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
              // onClick={() => setIsOpen(false)}

            
            >
              {({ blob, url, loading, error }) => (
                <>
                  <File className="w-4 h-4 text-red-600" />
                  <div>
                    <div className="font-medium">
                      {loading ? 'Generating PDF...' : 'PDF Report'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {loading ? 'Please wait' : 'Professional format'}
                    </div>
                  </div>
                </>
              )}
            </PDFDownloadLink>
           </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};