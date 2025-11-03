"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer/Footer";
import Header20 from "@/components/header/Header20";

export default function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Perform logout action when the component mounts
    const logout = () => {
      setLoading(true);
      setMessage("");

      try {
        // Clear all data from localStorage
        localStorage.clear();

        // Set the message
        setMessage("You have been logged out successfully.");
        
        // Redirect the user to the login page
        router.push("/login");
      } catch (error) {
        setMessage("An error occurred during logout.");
      } finally {
        setLoading(false);
      }
    };

    // Call the logout function
    logout();
  }, [router]);

  return (
    <div className="bgc-thm4">
      <Header20 />
      <section className="our-register">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 m-auto text-center">
              <div className="main-title">
                <h2 className="title">Logging out...</h2>
                {loading && <p className="paragraph">Please wait while we log you out.</p>}
                {message && <p className="paragraph">{message}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
