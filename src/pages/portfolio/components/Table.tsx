import React from 'react';
import './orderbook-scrollbar.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

interface Column {
  key: string;
  title: string;
}

interface TableProps<T> {
  columns: Column[];
  data: T[];
  renderCell?: (row: T, col: Column, rowIndex: number) => React.ReactNode;
  className?: string;
}

function Table<T>({ columns, data, renderCell, className }: TableProps<T>) {
  return (
    <SimpleBar style={{ maxHeight: 320 }} autoHide={false} className="orderbook-simplebar">
      <table className={`min-w-full text-left ${className || ''}`}>
        <thead>
          <tr className="text-[15px] text-light-fg/80 dark:text-dark-brown font-semibold">
            {columns.map(col => (
              <th key={col.key} className="py-2 px-3">{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-all group">
              {columns.map(col => (
                <td key={col.key} className="py-2 px-3">
                  {renderCell ? renderCell(row, col, rowIndex) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </SimpleBar>
  );
}

export default Table; 