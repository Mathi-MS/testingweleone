import { Box, TextField, Tooltip, Typography, Autocomplete, InputAdornment } from "@mui/material";
import { Controller } from "react-hook-form";
import get from "lodash/get";
import { CustomInputStyles, labelStyle } from "./CustomStyles";
import { ChevronsUpDown } from "lucide-react";

interface CustomAutocompleteProps {
  name: string;
  control: any;
  label?: string;
  required?: boolean;
  placeholder?: string;
  options: any[];
  errors?: any;
  boxSx?: any;
  disabled?: boolean;
  multiple?: boolean;
  onInputChange?: (value: string) => void;
  freeSolo?: boolean;
  disableClearable?: boolean;
  rules?: any; 
  limitTags?: number;
  value?:any;
  onChange?:any;
}

export const CustomAutocomplete = ({
  name,
  control,
  label,
  required,
  placeholder,
  options,
  errors,
  boxSx,
  disabled,
  multiple = false,
  onInputChange,
  freeSolo = false,
  disableClearable = false,
  rules,
  limitTags,
  value,
  onChange,
}: CustomAutocompleteProps) => {
  const errorMessage = get(errors, `${name}.message`, null);

  return (
    <Box sx={{
      ...CustomInputStyles, "& .MuiInputBase-root": {
        paddingRight: "8px !important",
      }, ...boxSx
    }}>
      {/* Label + Tooltip */}
      {label && (
        <>
          <Tooltip title={label} arrow>
            <Typography sx={{ ...labelStyle }} component={"span"}>
              {label.length > 20 ? label.slice(0, 20) + "..." : label}
            </Typography>
          </Tooltip>
          {required && (
            <Box component={"span"} color={"var(--error)"} ml={0.5}>
              *
            </Box>
          )}
        </>
      )}

      {/* Controller Wrapper */}
      <Controller
        name={name}
        control={control}
        rules={rules} 
        defaultValue={multiple ? [] : null}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            multiple={multiple}
            freeSolo={freeSolo}
            disablePortal
            limitTags={limitTags}
            disabled={disabled}
            options={options}
            popupIcon={null}
            disableClearable={disableClearable}
            sx={{
              "& .MuiOutlinedInput-root .MuiAutocomplete-input": {
                padding: "3px",
              },
            }}
            value={multiple
              ? options.filter((opt) => value?.includes(opt.value)) || []
              : options.find((opt) => opt.value === value) || value || null
            }
            onInputChange={(_, newInputValue) => {
              if (onInputChange) {
                onInputChange(newInputValue);
              }
              if (freeSolo && !multiple) {
                onChange(newInputValue);
              }
            }}
            onChange={(_, selected) => {
              if (multiple) {
                onChange(Array.isArray(selected) ? selected.map(item => typeof item === 'string' ? item : item.value) : []);
              } else {
                if (typeof selected === 'string') {
                  onChange(selected);
                } else {
                  onChange(selected ? selected.value : null);
                }
              }
            }}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option.label || "";
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={placeholder}
                error={!!errorMessage}
                helperText={errorMessage ? errorMessage.toString() : ""}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      <InputAdornment
                        position="start"
                        sx={{ pointerEvents: 'none', }}
                      >
                        <ChevronsUpDown size={16} />
                      </InputAdornment>
                      {/* {params.InputProps.startAdornment} */}
                    </>
                  ),
                }}
              />
            )}
          />
        )}
      />
    </Box>
  );
};