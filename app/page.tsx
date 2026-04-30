// 'use client';

// import { useState } from "react";
// import { sendOtp, verifyOtp } from "@/lib/actions/auth";

// export default function Home() {
//   const [email, setEmail] = useState("");
//   const [otp, setOTP] = useState("");
//   const [isOTPSent, setIsOTPSent] = useState(false);

//   // 1. Send OTP Handler
//   const handleSendOtp = async (): Promise<void> => {
//     if (!email) {
//       alert("Enter email first");
//       return;
//     }

//     try {
//       const response = await fetch("/api/auth/send-otp", { // Corrected path hyphen
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, role: "candidate" }), // Added role required by your service
//       });

//       if (response.ok) {
//         setIsOTPSent(true);
//       } else {
//         const errorData = await response.json();
//         alert(`Error: ${errorData.error || "Failed to send OTP"}`);
//       }
//     } catch (error) {
//       alert("Network error. Please try again.");
//     }
//   };

//   // 2. Verify OTP Handler
//   const handleVerifyOtp = async (): Promise<void> => {
//     if (!otp) {
//       alert("Please enter the code");
//       return;
//     }

//     try {
//       const response = await fetch("/api/auth/verify-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otpCode: otp }),
//       });

//       if (response.ok) {
//         // Redirect to main page/dashboard upon success
//         window.location.href = "/dashboard"; 
//       } else {
//         alert("Invalid or expired OTP code.");
//       }
//     } catch (error) {
//       alert("Verification failed. Please try again.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-6">
//       <div className="bg-white shadow-xl rounded-2xl p-8 max-w-xl w-full space-y-6">
        
//         {/* Header */}
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-gray-800">
//             Welcome CV-Collector
//           </h1>
//         </div>

//         {/* Description */}
//         <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
//           <p>
//             Here you can upload your CV and let us do the rest. We will analyze your CV and provide insights to improve your chances of landing your dream job.
//           </p>
//           <p>
//             Click on <span className="font-medium">"Upload CV"</span> and select your file.
//           </p>
//         </div>

//         {/* Login/OTP Section */}
//         {!isOTPSent ? (
//           <div className="border-t pt-6 space-y-4">
//             <h2 className="text-xl font-semibold text-gray-800 text-center">
//               Login or Register
//             </h2>
//             <div className="space-y-2">
//               <label className="text-sm text-gray-600">Email</label>
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#052e02]"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             <button
//               className="w-full py-2 rounded-lg text-white bg-[#052e02] hover:bg-[#064003] transition"
//               onClick={handleSendOtp}
//             >
//               Continue with Email
//             </button>
//           </div>
//         ) : (
//           <div className="border-t pt-6 space-y-4">
//             <h2 className="text-xl font-semibold text-gray-800 text-center">
//               Enter Verification Code
//             </h2>
//             <p className="text-center text-sm text-gray-500">
//               We sent a 6-digit code to <strong>{email}</strong>
//             </p>
//             <div className="space-y-2">
//               <label className="text-sm text-gray-600">OTP Code</label>
//               <input
//                 type="text"
//                 maxLength={6}
//                 placeholder="000000"
//                 className="w-full px-4 py-2 border rounded-lg text-center text-2xl tracking-[10px] focus:outline-none focus:ring-2 focus:ring-[#052e02]"
//                 value={otp}
//                 onChange={(e) => setOTP(e.target.value)}
//               />
//             </div>
//             <button
//               className="w-full py-2 rounded-lg text-white bg-[#052e02] hover:bg-[#064003] transition"
//               onClick={handleVerifyOtp}
//             >
//               Verify & Login
//             </button>
//             <button 
//               className="w-full text-sm text-gray-500 hover:underline"
//               onClick={() => setIsOTPSent(false)}
//             >
//               Back to Email
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useState } from "react";
import { sendOtp, verifyOtp } from "@/lib/actions/auth";

export default function Home() {
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Send OTP Handler (UPDATED)
  const handleSendOtp = async (): Promise<void> => {
    if (!email) {
      alert("Enter email first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendOtp(email, "candidate"); // ✅ use your action
      setIsOTPSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP Handler (UPDATED)
  const handleVerifyOtp = async (): Promise<void> => {
    if (!otp) {
      alert("Please enter the code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyOtp(email, otp); // ✅ use your action
      // redirect handled inside verifyOtp
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired OTP");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-xl w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome CV-Collector
          </h1>
        </div>

        {/* Description */}
        <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
          <p>
            Here you can upload your CV and let us do the rest. We will analyze your CV and provide insights to improve your chances of landing your dream job.
          </p>
          <p>
            Click on <span className="font-medium">"Upload CV"</span> and select your file.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        {/* Login/OTP Section */}
        {!isOTPSent ? (
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Login or Register
            </h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#052e02]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              className="w-full py-2 rounded-lg text-white bg-[#052e02] hover:bg-[#064003] transition"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? "Sending..." : "Continue with Email"}
            </button>
          </div>
        ) : (
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Enter Verification Code
            </h2>
            <p className="text-center text-sm text-gray-500">
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">OTP Code</label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                className="w-full px-4 py-2 border rounded-lg text-center text-2xl tracking-[10px] focus:outline-none focus:ring-2 focus:ring-[#052e02]"
                value={otp}
                onChange={(e) => setOTP(e.target.value)}
              />
            </div>
            <button
              className="w-full py-2 rounded-lg text-white bg-[#052e02] hover:bg-[#064003] transition"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button 
              className="w-full text-sm text-gray-500 hover:underline"
              onClick={() => {
                setIsOTPSent(false);
                setOTP("");
                setError("");
              }}
            >
              Back to Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}