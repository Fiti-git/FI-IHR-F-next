'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Footer from '@/components/footer/Footer';
import Header20 from '@/components/header/Header20';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }

    const lowerEmail = email.toLowerCase();

    // Dummy role check
    if (lowerEmail === 'freelancer@example.com') {
      localStorage.setItem('role', 'freelancer');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userProfilePic', '/images/freelancer.jpg');  // Example profile picture
      router.push('/freelancer');
    } else if (lowerEmail === 'jobprovider@example.com') {
      localStorage.setItem('role', 'job-provider');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userProfilePic', '/images/jobprovider.jpg'); // Example profile picture
      router.push('/job-provider');
    } else {
      alert('Invalid email or password.');
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

                {/* Email */}
                <div className="mb20">
                  <label className="form-label fw600 dark-color">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  />
                </div>

                {/* Remember Me and Lost Password */}
                <div className="checkbox-style1 d-flex align-items-center justify-content-between mb20">
                  <label className="custom_checkbox fz14 ff-heading">
                    Remember me
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkmark" />
                  </label>
                  <Link href="/forgot-password" className="fz14 ff-heading text-thm">
                    Lost your password?
                  </Link>
                </div>

                {/* Login Button */}
                <div className="d-grid mb20">
                  <button className="ud-btn btn-thm" type="button" onClick={handleLogin}>
                    Log In <i className="fal fa-arrow-right-long" />
                  </button>
                </div>

                <div className="hr_content mb20">
                  <hr />
                  <span className="hr_top_text">OR</span>
                </div>

                {/* Dummy Social Logins */}
                <div className="d-md-flex justify-content-between gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100 mb-2 mb-md-0 d-flex align-items-center justify-content-center"
                    onClick={() => alert('Google login not implemented')}
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
