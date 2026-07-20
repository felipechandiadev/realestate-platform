import React from "react";

interface DropdownListProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}

const DropdownList: React.FC<DropdownListProps> = ({ open, children, className = "", style, testId }) => {
  if (!open) return null;
  return (
    <ul
      className={`absolute z-30 w-full bg-white rounded shadow-lg mt-1 max-h-56 overflow-auto ${className}`}
      style={style}
      data-test-id={testId || "dropdown-list"}
    >
      {children}
    </ul>
  );
};

export default DropdownList;
