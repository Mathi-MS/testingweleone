import { Box, TextField, Tooltip, Typography } from "@mui/material";
import get from "lodash/get";
import { CustomInputStyles, labelStyle } from "./CustomStyles";
import { CustomInputProps } from "../../theme/Custom";

export const CustomTextarea = ({
    label,
    required,
    placeholder,
    name,
    disabled,
    register,
    helperText,
    errors,
    value,
    boxSx,
    rules,
    rows = 4,
}: CustomInputProps & { rows?: number }) => {
    const errorMessage = get(errors, `${name}.message`, null);
    return (
        <Box
            sx={{
                ...CustomInputStyles,
                ...boxSx,
            }}
        >
            {label && (
                <>
                    <Tooltip title={label} arrow>
                        <Typography sx={{ ...labelStyle }} component={"span"}>
                            {label.length > 50 ? label.slice(0, 50) + "..." : label}
                        </Typography>
                    </Tooltip>
                </>
            )}
            {label && required && (
                <Box component={"span"} color={"var(--error)"}>
                    *
                </Box>
            )}

            <TextField
                placeholder={placeholder}
                color="primary"
                name={name}
                value={value}
                disabled={disabled}
                {...(register && register(name, rules))}
                error={errorMessage ? true : false}
                helperText={errorMessage ? errorMessage.toString() : helperText}
                multiline
                rows={rows}
                fullWidth
            />
        </Box>
    );
};
