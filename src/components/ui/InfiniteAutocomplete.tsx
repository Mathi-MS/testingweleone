import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { useEffect, useRef, useState, useMemo } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// ============= TYPES =============
export interface InfiniteScrollAutocompleteProps<T> {
  label: string;
  focused:any
  placeholder?: string;
  value: T | null;
  onChange: (value: T | null) => void;
  options: T[];
  getOptionLabel: (option: T) => string;
  fetchData: (page: number, size: number, search: string) => void;
  loading?: boolean;
  hasNext?: boolean;
  pageSize?: number;
  debounceDelay?: number;
  error?: boolean;
  helperText?: string;
  renderOption?: (props: any, option: T) => React.ReactNode;
  inputStyle?: any;
  freeSolo?: boolean;
  disabled?: boolean;
}

// ============= DEBOUNCE HOOK =============
function useDebouncedValue<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

// ============= COMPONENT =============
export default function InfiniteScrollAutocomplete<T>({
  label,
  placeholder,
  focused,
  value,
  onChange,
  options,
  getOptionLabel,
  fetchData,
  loading = false,
  hasNext = false,
  pageSize = 10,
  debounceDelay = 350,
  error = false,
  helperText = "",
  renderOption,
  // inputStyle,
  freeSolo = false,
  disabled = false,
}: InfiniteScrollAutocompleteProps<T>) {
  const [page, setPage] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const debouncedInput = useDebouncedValue(inputValue, debounceDelay);
  const listRef = useRef<HTMLUListElement>(null);

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => options || [], [options]);

  // ============= EFFECTS =============
  // Initial load + search change
  useEffect(() => {
    setPage(1);
    fetchData(1, pageSize, debouncedInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  // Pagination
  useEffect(() => {
    if (page === 1) return; // Already loaded in debounced effect
    fetchData(page, pageSize, debouncedInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ============= HANDLERS =============
  const handleListboxScroll = (event: React.SyntheticEvent) => {
    const node = event.currentTarget as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = node;
    const bottom = scrollHeight - scrollTop <= clientHeight + 20;

    if (bottom && !loading && hasNext) {
      setPage((p) => p + 1);
    }
  };

  const handleInputChange = (_: any, newInput: string) => {
    setInputValue(newInput);
    setPage(1);
  };
const inputStyle = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: "8px",
    height: "48px",

    "& fieldset": {
      border: "1.31px solid #CED4DA",
    },
    "&:hover fieldset": {
      border: "1.31px solid #CED4DA",
    },
    "&.Mui-focused fieldset": {
      border: "1.31px solid #CED4DA !important",
    },
  },

  // 🔴 ERROR BORDER
  "& .MuiOutlinedInput-root.Mui-error fieldset": {
    borderColor: "#ff0000 !important",
  },

  "& .MuiFormLabel-root": {
    color: "#6B7280",
    fontSize: "14px",
  },

  "& .MuiFormLabel-root.Mui-focused": {
    color: "#6B7280 !important",
  },

  // 🔴 ERROR LABEL COLOR
  "& .MuiFormLabel-root.Mui-error": {
    color: "#ff0000 !important",
  },

  "& .MuiInputBase-input": {
    fontSize: "14px",
    padding: "12px 14px",
    color: "#333",
    "&::placeholder": {
      fontSize: "14px",
      color: "#0000004D",
      opacity: 1,
    },
  },

  // 🔴 Placeholder when error
  "& .MuiInputBase-input.Mui-error::placeholder": {
    color: "#ff0000 !important",
  },

  "& .MuiFormHelperText-root.Mui-error": {
    color: "#ff0000  !important",
    fontSize: "12px",
    marginLeft: "0px",
  },
};
  // ============= DEFAULT STYLES =============
  const defaultInputStyle = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#fff",
      borderRadius: "8px",
      height: "48px",
      "& fieldset": {
        border: "1.31px solid #CED4DA",
      },
      "&:hover fieldset": {
        border: "1.31px solid #CED4DA",
      },
      "&.Mui-focused fieldset": {
        border: "1.31px solid #CED4DA !important",
      },
    },
    "& .MuiOutlinedInput-root.Mui-error fieldset": {
      borderColor: "#ff0000 !important",
    },
    "& .MuiFormLabel-root": {
      color: "#6B7280",
      fontSize: "14px",
    },
    "& .MuiFormLabel-root.Mui-focused": {
      color: "#6B7280 !important",
    },
    "& .MuiFormLabel-root.Mui-error": {
      color: "#ff0000 !important",
    },
    "& .MuiInputBase-input": {
      fontSize: "14px",
      padding: "12px 14px",
      color: "#333",
      "&::placeholder": {
        fontSize: "14px",
        color: "#0000004D",
        opacity: 1,
      },
    },
    "& .MuiInputBase-input.Mui-error::placeholder": {
      color: "#ff0000 !important",
    },
    "& .MuiFormHelperText-root.Mui-error": {
      color: "#ff0000 !important",
      fontSize: "12px",
      marginLeft: "0px",
    },
  };

  // ============= DEFAULT RENDER OPTION =============
  const defaultRenderOption = (props: any, option: T) => (
    <li {...props} key={getOptionLabel(option)}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
       
        <span style={{ fontSize: "14px", color: "#333" }}>
          {getOptionLabel(option)}
        </span>
      </div>
    </li>
  );

  const getOptionLabelWrapper = (option: string | T): string => {
    if (typeof option === 'string') {
      return option;
    }
    return getOptionLabel(option as T);
  };

  // ============= RENDER =============
  return (
    <Autocomplete
      options={memoizedOptions}
      getOptionLabel={getOptionLabelWrapper}
      value={value}
      onChange={(_, newValue) => onChange(newValue as T | null)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      filterOptions={(x) => x} // Prevent MUI internal filtering
      ListboxProps={{
        onScroll: handleListboxScroll,
        ref: listRef,
        style: { maxHeight: 200, overflowY: "auto" },
      }}
      loading={loading}
      clearOnEscape
      freeSolo={freeSolo}
      popupIcon={<ExpandMoreIcon />}
      renderOption={renderOption || defaultRenderOption}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          focused={focused}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          disabled={disabled}
          sx={inputStyle }
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}