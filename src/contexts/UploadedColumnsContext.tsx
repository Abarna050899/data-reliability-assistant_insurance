import { createContext, useContext, useState, ReactNode } from "react";

export interface ColumnInfo {
  name: string;
  dataType: string;
}

interface UploadedColumnsContextValue {
  uploadedColumns: ColumnInfo[];
  setUploadedColumns: React.Dispatch<React.SetStateAction<ColumnInfo[]>>;
}

const UploadedColumnsContext = createContext<UploadedColumnsContextValue | undefined>(undefined);

export const UploadedColumnsProvider = ({ children }: { children: ReactNode }) => {
  const [uploadedColumns, setUploadedColumns] = useState<ColumnInfo[]>([]);

  return (
    <UploadedColumnsContext.Provider value={{ uploadedColumns, setUploadedColumns }}>
      {children}
    </UploadedColumnsContext.Provider>
  );
};

export const useUploadedColumns = () => {
  const ctx = useContext(UploadedColumnsContext);
  if (!ctx) throw new Error("useUploadedColumns must be used within UploadedColumnsProvider");
  return ctx;
};
