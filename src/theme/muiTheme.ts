import { ThemeProvider, createTheme } from '@mui/material/styles'

const muiTheme = createTheme({
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: '10px'
                },
                input: {
                    padding: '16px'
                },
                inputMultiline: {
                    padding: '16px'
                },
                notchedOutline: {
                    borderRadius: '10px'
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                select: {
                    padding: '16px'
                }
            }
        }
    }
})

export default muiTheme