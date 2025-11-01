"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import Navigation from "./Navigation";
import MobileNavigation2 from "./MobileNavigation2";

export default function Header20() {
    const path = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthStatus = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                setMessage("Authentication error. Please log in again.");
                setLoading(false);
                router.push("/login");
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:8000/api/profile/check-auth/", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.isAuthenticated) {
                        setIsAuthenticated(true);
                    }
                }
            } catch (error) {
                console.error('Error checking authentication status:', error);
            }
        };

        checkAuthStatus();
    }, []);

    return (
        <>
            <header className="header-nav nav-innerpage-style main-menu  ">
                <nav className="posr">
                    <div className="container-fluid posr menu_bdrt1">
                        <div className="row align-items-center justify-content-between">
                            <div className="col-auto pe-0">
                                <div className="d-flex align-items-center">
                                    <Link
                                        className="header-logo bdrr1 pr30 pr5-xl"
                                        href="/home-20"
                                    >
                                        <Image
                                            height={40}
                                            width={133}
                                            className="w-100 h-100 object-fit-contain"
                                            src="/images/header-logo-dark.svg"
                                            alt="Header Logo"
                                        />
                                    </Link>
                                    <div className="home1_style">

                                    </div>
                                </div>
                            </div>
                            <div className="col-auto">
                                <div className="d-flex align-items-center gap-3">
                                    <Navigation />

                                    {/* Conditionally render Sign In and Join buttons */}
                                    {!isAuthenticated && (
                                        <>
                                            {/* Sign In Link */}
                                            <Link
                                                className={`login-info small-text ${path === "/login" ? "ui-active" : ""
                                                    }`}
                                                href="/login"
                                            >
                                                Sign in
                                            </Link>

                                            {/* Join Button */}
                                            <Link
                                                className="ud-btn btn-thm btn-sm join-btn"
                                                href="/register"
                                            >
                                                Join
                                            </Link>
                                        </>
                                    )}

                                    {/* You can optionally show a user profile or a sign out button if authenticated */}
                                    {isAuthenticated && (
                                        <div>
                                            {/* Example: Link to a dashboard and a sign out button */}
                                            <Link href="/dashboard" className="login-info small-text">My Account</Link>
                                            {/* Add a sign out button with its logic here */}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
            <MobileNavigation2 />
        </>
    );
}