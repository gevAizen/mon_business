import React from "react";

interface PageWrapperProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, header }) => {
  return (
    <div className="h-dvh flex flex-col bg-linear-to-b from-blue-50 to-white pb-18 mb-6">
      {header && (
        <div className="shrink-0 p-6 border-b border-gray-300">{header}</div>
      )}
      <div className="px-6 space-y-6 flex-1 pt-6 pb-4 overflow-auto">
        {children}
        <div className="h-5" />
      </div>
    </div>
  );
};

export default PageWrapper;
