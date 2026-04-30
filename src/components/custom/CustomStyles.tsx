import { padEnd } from "lodash";

export const CustomInputStyles = {
  mb: 0,
  "& input": {
    padding: "12px",
    fontSize: "14px",
    fontFamily: "Regular_M",
  },
  "& label": {
    fontFamily: "Regular_M",
  },
  "& fieldset": {
    borderRadius: "12px",
  },
  "& .MuiInputBase-adornedStart input, & .MuiInputBase-inputAdornedStart": {
    paddingLeft: "5px",
  },
  "& .MuiFormHelperText-root": { margin: "5px 0px 0px 0px" },
  "& .MuiInputAdornment-root": {
    margin: "0px",
    "& .MuiSvgIcon-root": {
      fontSize: "20px",
      color: "var(--customIcon)",
    },
  },
  "& .MuiTextField-root": {
    width: "100%",
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--border)",
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--border)",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#00BF53",
      borderWidth: "2px",
    },
    "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--error)",
    },
  },
  "& .MuiInputLabel-root": {
    "&.Mui-focused": {
      color: "var(--title)",
    },
    "&.Mui-error": {
      color: "var(--error)",
    },
    "& .MuiBox-root": {
      paddingLeft: "2px",
    },
  },
};

export const labelStyle = {
  fontSize: "14px", fontFamily: "Medium_M", color: "var(--text-primary)", mb: "2px !important", display: "inline-block"
};
export const AccountBoxStyle = {
  display:"flex",
  alignItems:"center",
  gap:"20px",
  justifyContent:"start"
};
export const CustomButtonStyles = {
  width: "100%",
  textTransform: "capitalize",
  fontFamily: "Medium_M",
  borderRadius: "7px",
  fontSize: "12px",
  "& .MuiButton-startIcon": {
    "svg": {
      fontSize: "13px"
    }
  }
};
export const CustomAutocompleteStyles = {
  "& input": {
    padding: "2.8px !important",
    fontSize: "14px",
    fontFamily: "Regular_M",
  },
  "& label": {
    fontSize: "16px",
    fontFamily: "Regular_M",
    color: "var(--title)",
  },
  "& fieldset": {
    borderWidth: "0px !important",
    borderColor: "var(--border) !important",
    borderRadius: "8px",
  },
  "& .Mui-error .MuiOutlinedInput-notchedOutline ": {
    borderWidth: "0px !important",
    borderColor: "var(--error) !important",
    borderRadius: "8px",
    fontSize: "Regular_M"
  },

};
// filterStyles.ts

export const filterContainer = {
  mt: 2,
  width: "100%",
  background: "var(--white)",
  p: 2,
  borderRadius: 2,
};

export const filterHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const selectAllContainer = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const itemRow = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  mt: 1.2,
};

export const viewAllWrapper = {
  textAlign: "right",
};

export const viewAllButton = {
  fontSize: "11px",
  textTransform: "none",
  padding: "5px 10px",
  color: "var(--primary)",
  fontWeight: 900,
};

export const checkboxStyle = {
  padding: 0,
  "& svg": {
    fontSize: 18,
  },
};

export const titleText = {
  fontWeight: 900,
  fontSize: "13px",
  color: "var(--black900)",
  cursor: "pointer",
};

export const titleTextNew = {
  fontWeight: 500,
  fontSize: "12px",
  color: "var(--black)",
  cursor: "pointer",
};

// Input title
export const inputTitle = {
  "& input": {
    fontSize: "25px",
    fontWeight: "bold",
    color: "var(--textone)",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "none"
  },
  "& fieldset": {
    border: "none"
  },
  "& input::placeholder": {
    color: "var(--greytwo)",
  },
};
export const forminput = {
  padding: "0px 30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "start",
  gap: "30px",
  "& h3": {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--black)",
    fontFamily: "DM-Medium !important",
    minWidth: "200px"
  }
}
export const inputForm = {
  minWidth: "300px",
  "& input": {
    fontSize: "14px",
    fontWeight: "400",
    color: "var(--black)",
    padding: "12px 14px"
  },
  "& input::placeholder": {
    color: "var(--black)",
  },
  "& fieldset": {
    borderWidth: "0px !important",
  },
  "& .MuiOutlinedInput-root.Mui-focused": {
    background: "var(--greythree)",
    borderRadius: "5px"
  },
  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
    border: "1px solid var(--greyborder) !important",
    borderRadius: "5px"
  },
  "& .MuiOutlinedInput-root:hover, \
   & .MuiOutlinedInput-root.Mui-focused": {
    background: "var(--greythree)",
    borderRadius: "5px",
  },

  /* 🔹 Hover + Focus border */
  "& .MuiOutlinedInput-root:hover fieldset, \
   & .MuiOutlinedInput-root.Mui-focused fieldset": {
    border: "1px solid transparent !important",
    borderRadius: "5px",
  },

  "& .MuiOutlinedInput-root:hover fieldset ": {
    border: "1px solid transparent !important",
  }
};
export const inputFormNew = {
  minWidth: "300px",
  "& input": {
    fontSize: "14px",
    fontWeight: "400",
    color: "var(--black)",
    padding: "10px 14px",
    background: "var(--greythree)",
    borderRadius:"8px"
  },
  "& input::placeholder": {
    color: "var(--black)",
  },
  "& fieldset": {
    border: "1px solid var(--greyborder) !important",
    // background: "var(--greythree)",
     borderRadius: "8px"
  },
  "& .MuiOutlinedInput-root.Mui-focused": {
    background: "var(--greythree)",
    borderRadius: "8px"
  },
  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
    border: "1px solid var(--greyborder) !important",
    borderRadius: "8px"
  },
  "& .MuiOutlinedInput-root:hover, \
   & .MuiOutlinedInput-root.Mui-focused": {
    background: "var(--greythree)",
    borderRadius: "8px",
  },

  /* 🔹 Hover + Focus border */
  "& .MuiOutlinedInput-root:hover fieldset, \
   & .MuiOutlinedInput-root.Mui-focused fieldset": {
    border: "1px solid var(--greyborder) !important",
    borderRadius: "8px",
  },

  "& .MuiOutlinedInput-root:hover fieldset ": {
    border: "1px solid var(--greyborder) !important",
  }
};

export const onboardingMuiInputStyle = {
  ...CustomInputStyles,
  "& .MuiOutlinedInput-root": {
    padding: "0px !important",
    backgroundColor: "white",
    borderRadius: "12px",
    "& fieldset": {
      borderColor: "#dadada !important",
    },
    "&:hover fieldset": {
      borderColor: "#00BF53 !important",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#00BF53",
      borderWidth: "1px",
    },
  },
  "& .MuiInputBase-input": {
    padding: "12px 14px !important",
    fontSize: "14px",
  },
};
