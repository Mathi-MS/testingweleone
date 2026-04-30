import type { SxProps } from "@mui/material";
import type { ButtonProps } from "@mui/material/Button";
import type { ReactNode } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

export interface CustomButtonProps {
  type: "button" | "submit" | "reset";
  variant?: ButtonProps["variant"];
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  size?: ButtonProps["size"];
  label: string;
  loading?: boolean;
  disabled?: boolean;
  boxSx?: any;
  onClick?: ButtonProps["onClick"];
  sx?: any;
}

export interface CustomInputProps {
  label?: any;
  required?: boolean;
  placeholder?: string;
  type?: string;
  name: string;
  disabled?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  register?: UseFormRegister<any>;
  helperText?: string;
  errors?: FieldErrors;
  value?: string | number;
  boxSx?: SxProps;
  rules?: any;
  minDate?: string;
  maxDate?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface CustomTextareaProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  name: string;
  disabled?: boolean;
  register?: any;
  helperText?: string;
  errors?: any;
  value?: any;
  rows?: number;
  boxSx?: object;
}
// Interface/Custom.ts
export interface CustomFileUploadProps {
  label: string;
  name: string;
  multiple?: boolean;
  errors?: any;
  boxSx?: any;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  setValue: any;
  trigger: any;
}


