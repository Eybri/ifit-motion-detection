// import { useState } from "react";
// import { Button, Card, CardContent, Typography } from "@mui/material";
// import { CloudUpload, VideoLibrary } from "@mui/icons-material";
// import { motion } from "framer-motion";

// export default function VideoProcess() {
//   const [referenceVideo, setReferenceVideo] = useState(null);
//   const [imitationVideo, setImitationVideo] = useState(null);

//   const handleFileChange = (event, setVideo) => {
//     setVideo(event.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!referenceVideo || !imitationVideo) {
//       alert("Please select both reference and imitation videos.");
//       return;
//     }
  
//     const formDataRef = new FormData();
//     formDataRef.append("video_type", "reference");
//     formDataRef.append("video_file", referenceVideo);
  
//     const formDataImit = new FormData();
//     formDataImit.append("video_type", "imitation");
//     formDataImit.append("video_file", imitationVideo);
  
//     try {
//       const responseRef = await fetch("http://localhost:8000/videos/upload/", {
//         method: "POST",
//         body: formDataRef,
//       });
  
//       const responseImit = await fetch("http://localhost:8000/videos/upload/", {
//         method: "POST",
//         body: formDataImit,
//       });
  
//       const dataRef = await responseRef.json();
//       const dataImit = await responseImit.json();
  
//       if (responseRef.ok && responseImit.ok) {
//         alert(`Upload successful!\nReference ID: ${dataRef.video_id}\nImitation ID: ${dataImit.video_id}`);
//       } else {
//         alert(`Error: ${dataRef.error || dataImit.error}`);
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       alert("Failed to upload videos.");
//     }
//   };
  

//   return (
//     <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light p-4">
//       <motion.h1
//         className="text-primary fw-bold mb-4"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         Welcome to VideoProcess
//       </motion.h1>

//       <Card className="p-4 shadow-lg w-100" style={{ maxWidth: "600px" }}>
//         <CardContent className="d-flex flex-column align-items-center">
//           <CloudUpload color="primary" style={{ fontSize: 60 }} className="mb-3" />
//           <Typography variant="body1" className="text-secondary mb-3">
//             Upload your reference and imitation videos
//           </Typography>

//           {/* Reference Video Input */}
//           <input
//             type="file"
//             accept="video/*"
//             onChange={(e) => handleFileChange(e, setReferenceVideo)}
//             className="form-control mb-3"
//           />
//           {referenceVideo && (
//             <Typography variant="body2" className="text-dark">
//               Reference: {referenceVideo.name}
//             </Typography>
//           )}

//           {/* Imitation Video Input */}
//           <input
//             type="file"
//             accept="video/*"
//             onChange={(e) => handleFileChange(e, setImitationVideo)}
//             className="form-control mb-3"
//           />
//           {imitationVideo && (
//             <Typography variant="body2" className="text-dark">
//               Imitation: {imitationVideo.name}
//             </Typography>
//           )}

//           {/* Upload Button */}
//           <Button 
//             onClick={handleUpload} 
//             variant="contained" 
//             color="primary" 
//             className="mt-3"
//           >
//             Upload Videos
//           </Button>
//         </CardContent>
//       </Card>

//       <div className="mt-5 text-center">
//         <Typography variant="h4" className="fw-bold text-dark mb-4">
//           Why Choose VideoProcess?
//         </Typography>
//         <div className="row g-3">
//           {["Fast Processing", "High-Quality Output", "Easy to Use"].map((feature, index) => (
//             <div key={index} className="col-md-4">
//               <Card className="p-3 text-center shadow-sm">
//                 <VideoLibrary color="primary" style={{ fontSize: 40 }} className="mb-2" />
//                 <Typography variant="body1" className="text-secondary">
//                   {feature}
//                 </Typography>
//               </Card>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
