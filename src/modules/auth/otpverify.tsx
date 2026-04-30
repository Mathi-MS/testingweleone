// import { Box, Typography, Grid, Stack, TextField, Button, InputAdornment } from "@mui/material";
// import loginimg from "../../assets/image/loginimg.svg"; 
// import lockimg from "../../assets/image/lockimg.svg";
// import Header from "../../components/layout/PublicHeader";
// import { useState } from "react";
// import AlertDialogSlide from "../postverify/popup";

// const Otpverify = () => {
//   const [open, setOpen] = useState(false);
  
//   return (
//     <>
//       <Header />
//       <Box
//         sx={{
//           minHeight: "80vh",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           px: { xs: 2, sm: 4, md: 8, lg: 12 },
//         }}
//       >
//         <Grid
//           container
//           spacing={4}
//           sx={{
//             maxWidth: "1100px",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <Grid item xs={12} md={6}>
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "center",
//               }}
//             >
//               <img
//                 src={loginimg}
//                 alt="Illustration"
//                 style={{
//                   width: "180%",
//                   maxWidth: "800px",
//                   height: "auto",
//                 }}
//               />
//             </Box>
//           </Grid>

//           <Grid item xs={12} md={6}>
//             <Box sx={{ width: "100%", maxWidth: 380, mx: "auto", textAlign: "center", mt: 15 }}>
//               <Typography
//                 variant="h4"
//                 fontWeight="bold"
//                 gutterBottom
//                 sx={{ color: "#030303" }}
//               >
//                 Check your inbox
//               </Typography>

//               <Typography sx={{ color: "#636364", mb: 2, fontSize: "16px" }}>
//                 Please enter the code we sent to <b>naveenk@gmail.com</b> to finish your sign up.
//               </Typography>

//               <Stack spacing={2} alignItems="center">
//                 <TextField
//                   label="Enter Code"
//                   variant="outlined"
//                   sx={{ bgcolor: "#FFFFFF", width: "350px" }}
//                   InputProps={{
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <img
//                           src={lockimg}
//                           alt="lockimg"
//                           style={{ width: "20px", height: "20px" }}
//                         />
//                       </InputAdornment>
//                     ),
//                   }}
//                 />
//                 <Button variant="outlined" onClick={() => setOpen(true)}>
//                   Open Popup
//                 </Button>

//                 <AlertDialogSlide open={open} onClose={() => setOpen(false)} />
//                 <Button
//                   variant="contained"
//                   sx={{
//                     mt: 2,
//                     bgcolor: "#0066FF",
//                     textTransform: "none",
//                     borderRadius: "12px",
//                     boxShadow: "none",
//                     fontWeight: 400,
//                     width: "350px",
//                     "&:hover": {
//                       bgcolor: "#0056d6",
//                       boxShadow: "none",
//                     },
//                   }}
//                 >
//                   Verify
//                 </Button>

//                 <Typography sx={{ color: "#636364", mt: 2, fontSize: "12px" }}>
//                   <a href="#" style={{ color: "#005AFF", textDecoration: "none" }}>
//                     Resend code
//                   </a>
//                 </Typography>
//               </Stack>
//             </Box>
//           </Grid>
//         </Grid>
//       </Box>
//     </>
//   );
// };

// export default Otpverify;