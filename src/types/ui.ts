import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'custom' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

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

export type SortDirection = 'asc' | 'desc' | null;

export interface FilterGroup {
  title: string;
  items: FilterItem[];
}

export interface FilterItem {
  id: string;
  name: string;
  selected: boolean;
}

export interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterGroups: FilterGroup[];
  onSelectionChange: (groupTitle: string, selectedIds: string[]) => void;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
