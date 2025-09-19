'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Footer from '@/components/footer/Footer';
import Header20 from '@/components/header/Header20';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // --- Email/Password Login Handler ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsUnverified(false);
    setResendMessage('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.non_field_errors?.includes("E-mail is not verified.")) {
          setError('Your email is not verified. Please check your inbox.');
          setIsUnverified(true);
        } else {
          setError(data.non_field_errors?.[0] || 'Invalid credentials.');
        }
        setIsLoading(false);
        return;
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch (err) {
      console.error('Login request failed:', err);
      setError('Could not connect to the server. Please try again later.');
      setIsLoading(false);
    }
  };

  // --- Google Login Handlers ---
  const handleGoogleLoginSuccess = async (codeResponse) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeResponse.code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.non_field_errors?.[0] || 'Google login failed. Please try again.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch (err) {
      console.error('Google login request failed:', err);
      setError('Could not connect to the server for Google login.');
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: () => setError('Google login failed. Please try again.'),
    flow: 'auth-code',
  });

  const handleResendVerification = async () => {
    if (!email) {
      setError("Please ensure your email is entered in the field above.");
      return;
    }
    setResendMessage('Sending...');
    setIsLoading(true);

    try {
      await fetch(`http://127.0.0.1:8000/api/auth/registration/resend-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResendMessage("A new verification email has been sent to your inbox.");
      setIsUnverified(false); // Hide the resend link after success
    } catch (err) {
      setResendMessage("Failed to send email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bgc-thm4">
      <Header20 />

      <section className="our-login">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 m-auto wow fadeInUp" data-wow-delay="300ms">
              <div className="main-title text-center">
                <h2 className="title">Log In</h2>
                <p className="paragraph">
                  Give your visitor a smooth online experience with a solid UX design
                </p>
              </div>
            </div>
          </div>

          <div className="row wow fadeInRight" data-wow-delay="300ms">
            <div className="col-xl-6 mx-auto">
              <div className="log-reg-form form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
                <div className="mb30">
                  <h4>Welcome Back!</h4>
                  <p className="text">
                    Don’t have an account?{' '}
                    <Link href="/register" className="text-thm">
                      Sign Up!
                    </Link>
                  </p>
                </div>

                <form onSubmit={handleLogin}>
                  {/* Email */}
                  <div className="mb20">
                    <label className="form-label fw600 dark-color">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password */}
                  <div className="mb15">
                    <label className="form-label fw600 dark-color">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* --- DYNAMIC ERROR AND RESEND UI --- */}
                  {error && <p className="text-danger text-center mb-2">{error}</p>}

                  {isUnverified && (
                    <div className="d-grid my-2">
                      <button
                        type="button"
                        className="btn btn-link text-thm"
                        onClick={handleResendVerification}
                        disabled={isLoading}
                      >
                        Resend verification email
                      </button>
                    </div>
                  )}

                  {resendMessage && <p className="text-success text-center mb-2">{resendMessage}</p>}

                  {/* Remember Me and Lost Password */}
                  <div className="checkbox-style1 d-flex align-items-center justify-content-between mb20">
                    <label className="custom_checkbox fz14 ff-heading">
                      Remember me
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                    <Link href="/forgot-password" className="fz14 ff-heading text-thm">
                      Lost your password?
                    </Link>
                  </div>

                  {/* Login Button */}
                  <div className="d-grid mb20">
                    <button className="ud-btn btn-thm" type="submit" disabled={isLoading}>
                      {isLoading ? 'Processing...' : 'Log In'} <i className="fal fa-arrow-right-long" />
                    </button>
                  </div>
                </form>

                <div className="hr_content mb20">
                  <hr />
                  <span className="hr_top_text">OR</span>
                </div>

                {/* Social Logins */}
                <div className="d-md-flex justify-content-between gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100 mb-2 mb-md-0 d-flex align-items-center justify-content-center"
                    onClick={() => googleLogin()}
                    disabled={isLoading}
                  >
                    <i className="fab fa-google me-2" />
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                    onClick={() => alert('LinkedIn login not implemented')}
                  >
                    <i className="fab fa-linkedin me-2" />
                    Continue with LinkedIn
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}