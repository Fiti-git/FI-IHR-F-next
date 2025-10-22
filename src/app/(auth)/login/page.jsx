"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();

  const GOOGLE_CLIENT_ID = "858134682989-mav50sd3csolb7u8tbc1susrhm5uvk49.apps.googleusercontent.com";

  // Redirect based on user role from backend
  const handleRedirect = (user) => {
    if (user.role === 'employer') {
      router.push('/employer-dashboard');
    } else if (user.role === 'employee') {
      router.push('/employee-dashboard');
    } else {
      router.push('/select-role');
    }
  };

  // Load Google script on mount
  useEffect(() => {
    // Check if the user was just redirected from a successful verification
    if (searchParams.get('verified') === 'true') {
      setMessage("Email verified successfully! Please log in to continue.");
    }
  }, [searchParams]);

  // 1. Handle Email & Password Login
  const handleEmailLogin = async () => {
    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:8000/myapi/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Login failed. Please check your credentials.");
      } else {
        // Store tokens in localStorage
        localStorage.setItem("accessToken", data.tokens.access);
        localStorage.setItem("refreshToken", data.tokens.refresh);
        
        // Decode the access token to extract the user_id
        const decodedUserId = decodeJwt(data.tokens.access);
        localStorage.setItem("user_id", decodedUserId); // Store user_id in localStorage

        handleRedirect(data.user);
      }
    } catch (error) {
      setMessage("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Google Login Response
  const handleGoogleResponse = async (response) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/myapi/google-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Google login failed.");
      } else {
        // Store tokens in localStorage
        localStorage.setItem("accessToken", data.tokens.access);
        localStorage.setItem("refreshToken", data.tokens.refresh);

        // Decode the access token to extract the user_id
        const decodedUserId = decodeJwt(data.tokens.access);
        localStorage.setItem("user_id", decodedUserId); // Store user_id in localStorage

        handleRedirect(data.user);
      }
    } catch (error) {
      setMessage("An error occurred with Google Login.");
    } finally {
      setLoading(false);
    }
  };

  // Decode JWT token (no external libraries)
  const decodeJwt = (token) => {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token");
    }

    const payload = parts[1];
    // Base64 decode the payload and parse it as JSON
    const decodedPayload = JSON.parse(atob(payload));

    // Return the user_id from the decoded payload
    return decodedPayload.user_id; // or any other data you need from the payload
  };

  // Load Google script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-login-btn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    };
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div className="bgc-thm4">
      <Header20 />
      <section className="our-register">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 m-auto text-center">
              <div className="main-title">
                <h2 className="title">Login</h2>
                <p className="paragraph">Welcome back! Please enter your credentials.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-8 mx-auto">
              <div className="log-reg-form form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
                <h4>Welcome Back</h4>
                <p className="text mt20">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-thm">Create one!</Link>
                </p>

                <div className="row">
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500 dark-color">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" />
                  </div>
                  <div className="mb25 col-md-6">
                    <label className="form-label fw500 dark-color">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" />
                  </div>
                </div>

                <div className="d-grid mb20">
                  <button className="ud-btn btn-thm" type="button" onClick={handleEmailLogin} disabled={loading}>
                    {loading ? "Logging in..." : "Login"} <i className="fal fa-arrow-right-long" />
                  </button>
                </div>

                <div style={{ textAlign: "center", marginBottom: 16 }}>— or sign in with —</div>

                <div id="google-login-btn" />

                {message && <div className="alert alert-danger mt-3">{message}</div>}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Footer from "@/components/footer/Footer";
// import Header20 from "@/components/header/Header20";
// import Link from "next/link";
// import { useSearchParams } from "next/navigation";

// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const searchParams = useSearchParams();

//   const [role, setRole] = useState(null); // State to hold the user role
//   const [userId, setUserId] = useState(null); // State to hold user_id

//   useEffect(() => {
//     // Check if the user was just redirected from a successful verification
//     if (searchParams.get('verified') === 'true') {
//       setMessage("Email verified successfully! Please log in to continue.");
//     }
//   }, [searchParams]);

//   // Fetch role after user_id is retrieved from localStorage
//   useEffect(() => {
//     if (userId) {
//       setLoading(true);
//       // Fetch role based on the user_id
//       const fetchRole = async () => {
//         try {
//           const response = await fetch(`http://127.0.0.1:8000/api/user/${userId}/roles/`);
//           const data = await response.json();
          
//           if (response.ok) {
//             setRole(data.roles?.[0] || "freelancer"); // Default to 'freelancer' if no role found
//           } else {
//             setRole("freelancer"); // Fallback role in case of error
//           }
//         } catch (error) {
//           console.error("Error fetching role:", error);
//           setRole("freelancer"); // Fallback role in case of error
//         } finally {
//           setLoading(false); // Stop loading once data is fetched
//         }
//       };

//       fetchRole();
//     }
//   }, [userId]); // Trigger effect when userId changes

//   // Handle the role-based redirection after role is fetched
//   useEffect(() => {
//     if (role) {
//       if (role === "Employer") {
//         router.push("/job-provider");
//       } else if (role === "Employee") {
//         router.push("/freelancer");
//       } else {
//         router.push("/freelancer"); // Default fallback to 'freelancer'
//       }
//     }
//   }, [role, router]); // Trigger navigation when role changes

//   // Handle email login
//   const handleEmailLogin = async () => {
//     if (!email || !password) {
//       setMessage("Please enter both email and password.");
//       return;
//     }
//     setLoading(true);
//     setMessage("");

//     try {
//       const res = await fetch("http://localhost:8000/myapi/login/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });
//       const data = await res.json();
      
//       if (!res.ok) {
//         setMessage(data.error || "Login failed. Please check your credentials.");
//       } else {
//         // Store tokens and user_id in localStorage
//         localStorage.setItem("accessToken", data.tokens.access);
//         localStorage.setItem("refreshToken", data.tokens.refresh);

//         const decodedUserId = decodeJwt(data.tokens.access);
//         localStorage.setItem("user_id", decodedUserId);

//         // Set userId in state, which will trigger role fetching
//         setUserId(decodedUserId); // This triggers the fetchRole effect
//       }
//     } catch (error) {
//       setMessage("An error occurred during login.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Decode JWT token (no external libraries)
//   const decodeJwt = (token) => {
//     const parts = token.split(".");
//     if (parts.length !== 3) {
//       throw new Error("Invalid token");
//     }

//     const payload = parts[1];
//     const decodedPayload = JSON.parse(atob(payload));

//     return decodedPayload.user_id; // Extract user_id from the token
//   };

//   return (
//     <div className="bgc-thm4">
//       <Header20 />
//       <section className="our-register">
//         <div className="container">
//           <div className="row">
//             <div className="col-lg-6 m-auto text-center">
//               <div className="main-title">
//                 <h2 className="title">Login</h2>
//                 <p className="paragraph">Welcome back! Please enter your credentials.</p>
//               </div>
//             </div>
//           </div>
//           <div className="row">
//             <div className="col-xl-8 mx-auto">
//               <div className="log-reg-form form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
//                 <h4>Welcome Back</h4>
//                 <p className="text mt20">
//                   Don't have an account?{" "}
//                   <Link href="/register" className="text-thm">Create one!</Link>
//                 </p>

//                 <div className="row">
//                   <div className="mb25 col-md-6">
//                     <label className="form-label fw500 dark-color">Email</label>
//                     <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" />
//                   </div>
//                   <div className="mb25 col-md-6">
//                     <label className="form-label fw500 dark-color">Password</label>
//                     <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" />
//                   </div>
//                 </div>

//                 <div className="d-grid mb20">
//                   <button className="ud-btn btn-thm" type="button" onClick={handleEmailLogin} disabled={loading}>
//                     {loading ? "Logging in..." : "Login"} <i className="fal fa-arrow-right-long" />
//                   </button>
//                 </div>

//                 <div style={{ textAlign: "center", marginBottom: 16 }}>— or sign in with —</div>

//                 <div id="google-login-btn" />
//                 {message && <div className="alert alert-danger mt-3">{message}</div>}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//       <Footer />
//     </div>
//   );
// }
