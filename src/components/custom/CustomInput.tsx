import { Box, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import get from "lodash/get";
import { CustomInputStyles, labelStyle } from "./CustomStyles";
import { CustomInputProps } from "../../theme/Custom";

export const CustomInput = ({
  label,
  required,
  placeholder,
  type,
  name,
  disabled,
  startAdornment,
  endAdornment,
  register,
  helperText,
  errors,
  value,
  boxSx,
  rules,
  onKeyDown,
  onChange,
  multiline, // Add multiline prop support
  rows,      // Add rows prop support
  minDate,
  maxDate,
}: CustomInputProps & { multiline?: boolean; rows?: number }) => { // Extend types locally if needed or assume in props
  const errorMessage = get(errors, `${name}.message`, null);
  return (
    <>
      <Box
        sx={{
          ...CustomInputStyles,
          ...boxSx,
        }}
      >
        {
          label && (
            <>
              <Tooltip title={label} arrow>
                <Typography sx={{ ...labelStyle }} component={"span"}>
                  {label.length > 20 ? label.slice(0, 20) + "..." : label}
                </Typography>
              </Tooltip>
            </>
          )
        }
        {label && required && (
          <Box component={"span"} color={"var(--error)"}>
            *
          </Box>
        )}

        <TextField
          placeholder={placeholder}
          color="primary"
          name={name}
          type={type === "number" ? "text" : type}
          disabled={disabled}
          {...(register && register(name, rules))}
          {...(value !== undefined && { value })}
          {...(onChange && { onChange })}
          error={errorMessage ? true : false}
          helperText={errorMessage ? errorMessage.toString() : helperText}
          multiline={multiline} // Pass multiline
          rows={rows}           // Pass rows
          inputProps={
            type === "date"
              ? {
                min: minDate,
                max: maxDate,
              } :
            type === "number"
              ? {
                inputMode: "numeric",
                pattern: "[0-9]*",
                onBeforeInput: (e: any) => {
                  if (!/^\d*$/.test(e.data)) {
                    e.preventDefault();
                  }
                },
              }
              : undefined
          }
          slotProps={{
            input: {
              startAdornment: startAdornment ? (
                <InputAdornment position="start">
                  {startAdornment}
                </InputAdornment>
              ) : undefined,
              endAdornment: endAdornment ? (
                <InputAdornment position="start">{endAdornment}</InputAdornment>
              ) : undefined,
              onWheel: (e: React.WheelEvent<HTMLInputElement>) => {
                if (type === "number") {
                  e.currentTarget.blur();
                }
              },
              onKeyDown: onKeyDown,
            },
          }}
        />
      </Box>
    </>
  );
};
