import React from 'react';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import { Inbox, ChevronUp, ChevronDown } from 'lucide-react';

export default function DataTable({ 
  columns, 
  data, 
  loading, 
  emptyTitle = "Nessun dato trovato", 
  emptyDescription = "Non ci sono record da visualizzare al momento.",
  sortKey = null,
  sortDirection = 'asc',
  onSort = () => {},
  rowProps = null
}) {
  if (loading) return <div className="admin-table-container"><LoadingState /></div>;
  
  if (!data || data.length === 0) {
    return (
      <div className="admin-table-container">
        <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th 
                key={i} 
                style={{ 
                  ...col.style, 
                  cursor: col.sortable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
                onClick={() => col.sortable && col.accessor && onSort(col.accessor)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: col.style?.textAlign === 'right' ? 'flex-end' : 'flex-start' }}>
                  {col.header}
                  {col.sortable && col.accessor === sortKey && (
                    sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const extraProps = rowProps ? rowProps(row, rowIndex) : {};
            return (
              <tr key={row.id || rowIndex} {...extraProps}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} style={col.style}>
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
