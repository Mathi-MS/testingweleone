import { Autocomplete, Box, TextField, Tooltip, Typography } from "@mui/material";
import {
  CustomAutocompleteStyles,
  CustomInputStyles,
  labelStyle,
} from "./CustomStyles";
import get from "lodash/get";
import { Controller } from "react-hook-form";

export type AutoOption = {
  title: string | number;
  label: string;
};

export const CustomInfiniteAutocomplete = ({
  label,
  required,
  limitTags,
  multiple,
  options,
  placeholder,
  name,
  errors,
  control,
  helperText,
  disabled,
  boxSx,
  onScrollEnd,
  onInputChange,
  rules,
  CustomStyles,
  value: externalValue,
  onChange: externalOnChange,
}: any) => {
  const errorMessage = get(errors, `${name}.message`, null);

  const autocompleteProps = (field: any) => ({
    multiple,
    limitTags,
    options: options || [],
    disabled,
    getOptionLabel: (option: AutoOption) => option.label,
    onInputChange: (_: any, value: string) => { if (onInputChange) onInputChange(value); },
    ListboxProps: {
      onScroll: (event: React.UIEvent<HTMLUListElement>) => {
        const list = event.currentTarget;
        if (list.scrollTop + list.clientHeight >= list.scrollHeight - 10) {
          if (onScrollEnd) onScrollEnd();
        }
      },
    },
    renderOption: (props: any, option: AutoOption) => (
      <Box component="li" {...props} sx={{ fontFamily: "Regular_M", fontSize: "14px", padding: "8px 12px !important" }}>
        {option.label}
      </Box>
    ),
    value: multiple
      ? options.filter((opt: any) => field.value?.includes(opt.title))
      : options.find((opt: any) => opt.title === field.value) || null,
    onChange: (_: any, newValue: any) => {
      if (multiple) {
        const titles = Array.isArray(newValue) ? newValue.map((v: AutoOption) => v.title) : [];
        field.onChange(titles);
      } else {
        const title = (newValue as AutoOption | null)?.title ?? "";
        field.onChange(title);
      }
    },
    renderInput: (params: any) => (
      <TextField
        {...params}
        placeholder={placeholder}
        error={!!errorMessage}
        helperText={errorMessage ? errorMessage.toString() : helperText}
        InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
        sx={{ ...CustomStyles }}
      />
    ),
    disablePortal: true,
    sx: { width: "100%" },
  });

  return (
    <>
      <Box sx={{ ...boxSx }}>
        {label && (
          <Tooltip title={label} arrow>
            <Typography sx={{ ...labelStyle }} component={"span"}>
              {label.length > 20 ? label.slice(0, 20) + "..." : label}
            </Typography>
          </Tooltip>
        )}
        {required && (
          <Box component={"span"} color={"var(--error)"}>
            *
          </Box>
        )}
        {control ? (
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => (
              <Autocomplete<AutoOption, boolean, false, false>
                {...autocompleteProps(field)}
              />
            )}
          />
        ) : (
          <Autocomplete<AutoOption, boolean, false, false>
            {...autocompleteProps({
              value: externalValue,
              onChange: externalOnChange ?? (() => {}),
            })}
          />
        )}
      </Box>
    </>
  );
};


