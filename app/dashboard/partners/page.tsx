import PartnersTable from '@/components/admin/PartnersTable';
import React from 'react'


type Partner = {
  _id: string;
  companyName: string;
  status: "approved" | "pending" | "reviewing" | "rejected";
  industry: "retail" | "other" | "healthcare" | "ecommerce" | "logistics" | "food" ;
  submittedAt: Date;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: "b2c" | "b2b" | "both";
  location: string;
  createdAt: Date;
  updatedAt: Date;
};

const partners: Partner[] = [
  {
    _id: "1",
    companyName: "Naivas Supermarket",
    status: "approved",
    industry: "retail",
    submittedAt: new Date("2024-01-15"),
    contactPerson: "John Doe",
    email: "john@naivas.com",
    phone: "+254700000000",
    businessType: "b2c",
    location: "Nairobi",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    companyName: "Safaricom Ltd",
    status: "pending",
    industry: "other",
    submittedAt: new Date("2024-01-14"),
    contactPerson: "Jane Smith",
    email: "jane@safaricom.com",
    phone: "+254700000001",
    businessType: "b2b",
    location: "Nairobi",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export default function Patners(): React.ReactNode {
  return <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
    <div className="p-4 lg:p-6 border-b">
      <h3 className="text-lg font-semibold">
        Partner Applications
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        Manage and review partnership requests
      </p>
    </div>
    <PartnersTable partners={partners} />
  </div>;
}

