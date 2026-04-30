import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { SortDirection } from '../../types/ui';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  TableWidth: string | number;
  rowSelection?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: T, index: number) => void;
  rowKey: string;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
  emptyMessage?: string;
}

export function Table<T = any>({
  data,
  columns,
  TableWidth,
  rowSelection = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  rowKey,
  loading = false,
  hasMore = false,
  onLoadMore,
  className = '',
  emptyMessage = 'No data available',
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortColumn];
      const bValue = (b as any)[sortColumn];

      if (aValue === bValue) return 0;
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = useCallback(
    (columnKey: string) => {
      if (sortColumn === columnKey) {
        if (sortDirection === 'asc') {
          setSortDirection('desc');
        } else if (sortDirection === 'desc') {
          setSortDirection(null);
          setSortColumn(null);
        } else {
          setSortDirection('asc');
        }
      } else {
        setSortColumn(columnKey);
        setSortDirection('asc');
      }
    },
    [sortColumn, sortDirection]
  );

  const handleRowSelect = useCallback(
    (rowId: string, checked: boolean) => {
      if (!onSelectionChange) return;

      const newSelection = checked
        ? [...selectedRows, rowId]
        : selectedRows.filter((id) => id !== rowId);

      onSelectionChange(newSelection);
    },
    [selectedRows, onSelectionChange]
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!onSelectionChange) return;

      const allIds = data.map((row) => (row as any)[rowKey]);
      onSelectionChange(checked ? allIds : []);
    },
    [data, rowKey, onSelectionChange]
  );

  const isAllSelected = selectedRows.length === data.length && data.length > 0;
  const isIndeterminate =
    selectedRows.length > 0 && selectedRows.length < data.length;

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // CRITICAL FIX: Reset isLoadingMore when loading completes
  useEffect(() => {
    if (!loading && isLoadingMore) {
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [loading, isLoadingMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (
        scrollPercentage > 0.85 &&
        hasMore &&
        !isLoadingMoreRef.current &&
        !loading &&
        onLoadMore
      ) {
        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);
        onLoadMore();
      }
    };

    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, onLoadMore]);

  return (
    <div
      ref={scrollContainerRef}
      style={{
        maxWidth: `calc(100vw - ${TableWidth}px)`,
      }}
      className='border border-border rounded-[10px] max-h-[460px] overflow-x-auto overflow-y-auto relative'
    >
      <table
        className='text-dark-gray bg-white min-w-max w-full border-collapse'
      >
        <thead>
          <tr className='bg-thead'>
            {rowSelection && (
              <th
                className='bg-thead border-b border-table font-semibold w-12 min-w-12 whitespace-nowrap p-[15px] text-center sticky top-[-1px] z-[2]'
              >
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                className='bg-thead text-[14px] border-b border-table font-semibold whitespace-nowrap p-[15px] text-left sticky top-[-1px] z-[2]'
                key={column.key}
                style={{
                  minWidth: column.width,
                  width: column.width,
                  cursor: column.sortable ? 'pointer' : 'default',
                }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className='flex items-center gap-1'>
                  {column.title}
                  {column.sortable && (
                    <span className='text-xs ml-1'>
                      {getSortIcon(column.key)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!loading && sortedData.length === 0 ? (
            <tr className='border-b border-table'>
              <td
                colSpan={columns.length + (rowSelection ? 1 : 0)}
                className='p-[15px] text-center text-sm'
              >
                {emptyMessage}
              </td>
            </tr>
          ) : sortedData.length > 0 ? (
            sortedData.map((row, index) => {
              const id = (row as any)[rowKey];
              const isSelected = selectedRows.includes(id);

              return (
                <tr
                  key={id}
                  style={{
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                  className='border-b border-table transition-colors'
                  onClick={() => onRowClick?.(row, index)}
                >
                  {rowSelection && (
                    <td className='w-12 min-w-12 p-[15px] text-center'>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelect(id, e.target.checked);
                        }}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      style={{
                        minWidth: column.width,
                        width: column.width,
                      }}
                      className='text-dark-gray text-sm p-[15px]'
                    >
                      {column.render
                        ? column.render((row as any)[column.key], row, index)
                        : (row as any)[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : null}
        </tbody>
      </table>
      {loading && (
        <div
          className='p-3 text-center text-xs text-muted'
        >
          Loading...
        </div>
      )}
      {/* {!loading && !hasMore && sortedData.length > 0 && (
        <div
          className='p-3 text-center text-xs text-muted'
        >
          No more data
        </div>
      )} */}
    </div>
  );
}