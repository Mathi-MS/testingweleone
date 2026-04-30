import { Dialog, DialogContent, DialogTitle, Box, Typography, Divider, IconButton } from "@mui/material";
import { useForm } from "react-hook-form";
import { CustomInput } from "../../../components/custom/CustomInput";
import CustomButton from "../../../components/custom/CustomButton";
import { inputForm } from "../../../components/custom/CustomStyles";
import { IoClose } from "react-icons/io5";

interface AddAdminFormValues {
    name: string;
    mobile: string;
    email: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onAdd: (admin: { label: string; value: string }) => void;
}

const AddAdminDialog = ({ open, onClose, onAdd }: Props) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<AddAdminFormValues>();

    const onSubmit = (data: AddAdminFormValues) => {
        // Determine the value/id for the new admin. 
        // In a real app this would call an API. 
        // Here we simulate an ID or just use the name as value for display.
        const newAdminOption = {
            label: data.name,
            value: data.name, // Using name as value for now since we don't have IDs
        };
        onAdd(newAdminOption);
        reset();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: "12px",
                    padding: "16px",
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Add Admin</Typography>
                <IconButton onClick={onClose} size="small">
                    <IoClose />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 0 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ display: 'grid', gap: 3, py: 2 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: 2 }}>
                            <Typography sx={{ color: '#444', fontWeight: 500 }}>Name</Typography>
                            <CustomInput
                                name="name"
                                placeholder="Enter Name"
                                register={register}
                                errors={errors}
                                boxSx={{ ...inputForm, mb: 0 }}
                                rules={{ required: "Name is required" }}
                            />
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: 2 }}>
                            <Typography sx={{ color: '#444', fontWeight: 500 }}>Mobile Number</Typography>
                            <CustomInput
                                name="mobile"
                                placeholder="Enter Mobile Number"
                                register={register}
                                errors={errors}
                                boxSx={{ ...inputForm, mb: 0 }}
                                rules={{ required: "Mobile is required" }}
                            />
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: 2 }}>
                            <Typography sx={{ color: '#444', fontWeight: 500 }}>Email ID</Typography>
                            <CustomInput
                                name="email"
                                type="email"
                                placeholder="Enter Email ID"
                                register={register}
                                errors={errors}
                                boxSx={{ ...inputForm, mb: 0 }}
                                rules={{
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 4 }}>
                        <CustomButton
                            type="button"
                            variant="outlined"
                            label="Cancel"
                            onClick={onClose}
                            sx={{
                                borderRadius: "6px",
                                borderColor: "#d0d5dd",
                                color: "#344054",
                                textTransform: 'none',
                                fontWeight: 500
                            }}
                        />
                        <CustomButton
                            type="submit"
                            variant="contained"
                            label="Add"
                            sx={{
                                borderRadius: "6px",
                                background: "#00C853",
                                "&:hover": { background: "#009624" },
                                textTransform: 'none',
                                fontWeight: 500
                            }}
                        />
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AddAdminDialog;
