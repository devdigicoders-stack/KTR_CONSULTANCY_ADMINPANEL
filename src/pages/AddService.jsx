import { PlusSquare, AlertCircle } from 'lucide-react';

const AddService = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <PlusSquare className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-black text-[#081326] mb-3">Add / Edit Services</h1>
      <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
        This module is currently under development. Soon you will be able to add new services or modify existing ones from here.
      </p>
      <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-bold text-sm border border-orange-100">
        <AlertCircle className="w-4 h-4" /> Coming Soon
      </div>
    </div>
  );
};

export default AddService;
