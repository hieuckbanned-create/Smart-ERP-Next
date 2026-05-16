import React from 'react';

export const ToastContainer = ({ className = '' }: any) => (
  <div className={`fixed bottom-4 right-4 z-50 flex flex-col gap-2 ${className}`}>
    {/* Toast items will be injected by a provider or hook */ }
  </div>
);

export const Toast = () => null;