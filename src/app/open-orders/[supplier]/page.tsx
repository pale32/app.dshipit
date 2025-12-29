"use client";

import { useParams } from 'next/navigation';
import SupplierOrdersPage from "../openorders-supplier-template";

// Supplier configuration mapping
const supplierConfig = {
  aliexpress: {
    name: "aliexpress",
    displayName: "AliExpress"
  },
  temu: {
    name: "temu", 
    displayName: "Temu"
  },
  alibaba: {
    name: "alibaba",
    displayName: "Alibaba"
  }
} as const;

type SupplierKey = keyof typeof supplierConfig;

export default function DynamicSupplierOrdersPage() {
  const params = useParams();
  const supplier = params?.supplier as string;
  
  // Validate supplier parameter
  if (!supplier || !(supplier in supplierConfig)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Supplier Not Found</h1>
          <p className="text-gray-600">The requested supplier "{supplier}" is not supported.</p>
          <p className="text-sm text-gray-500 mt-2">
            Supported suppliers: {Object.keys(supplierConfig).join(', ')}
          </p>
        </div>
      </div>
    );
  }

  const config = supplierConfig[supplier as SupplierKey];

  return (
    <SupplierOrdersPage 
      supplierName={config.name}
      supplierDisplayName={config.displayName}
    />
  );
}