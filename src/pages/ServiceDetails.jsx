import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';

const ServiceDetails = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <div className="w-24 h-24 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <FileText className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-black text-[#081326] mb-3">Service Details</h1>
      <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
        This module is currently under development. Soon you will be able to view and manage specific service details from here.
      </p>
      <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-bold text-sm border border-orange-100">
        <AlertCircle className="w-4 h-4" /> Coming Soon
      </div>
    </div>
  );
};

export default ServiceDetails;
