import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';

import { supabase } from '../lib/supabase';
import { hashPassword, verifyPassword } from '../lib/auth';

interface AuthProps {
  type: 'signIn' | 'signUp';
  setActiveTab: (tab: string) => void;
  setUser: (user: any) => void;
}

const countries = [
  'USA', 'Canada', 'UK', 'Germany', 'France', 'Turkey', 'Australia', 'Japan', 'China', 'India',
  'Brazil', 'Mexico', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Russia', 'South Africa', 'Nigeria', 'Egypt', 'Saudi Arabia',
  'United Arab Emirates', 'Singapore', 'South Korea', 'Argentina', 'Colombia', 'Peru', 'Chile',
  'Austria', 'Belgium', 'Ireland', 'Portugal', 'Greece', 'Poland', 'Hungary', 'Czech Republic',
  'Romania', 'Ukraine', 'Vietnam', 'Thailand', 'Indonesia', 'Malaysia', 'Philippines',
  'New Zealand', 'Other'
];

// Payment information will be hardcoded for demonstration.
// In a real application, this would come from a server.
const paymentAddress = "xTSNVy4GLEDETscV2HFQ8HoThzpWWmxArP";

const Auth: React.FC<AuthProps> = ({ type, setActiveTab, setUser }) => {
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [signInTelegramUsername, setSignInTelegramUsername] = useState('');
  const [memexPayment, setMemexPayment] = useState(false);
  const [paymentMade, setPaymentMade] = useState(false);
  const [qrCode, setQrCode] = useState('');

  React.useEffect(() => {
    generateQrCode();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Hash the password
      const passwordHash = await hashPassword(password);

      console.log('Password hashed:', passwordHash); // Log the password hash

      // Add user to the database
      const { data, error } = await supabase
        .from('custom_users')
        .insert([{
          telegram_username: telegramUsername,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          country: country,
          memex_payment: memexPayment,
          payment_made: paymentMade,
          payment_method: 'Memex'
        }])
        .select(); // Try to retrieve data

      if (error) {
        console.error('Registration error:', error);
        if (error.code === '23505') {
          toast.error('This Telegram username is already in use');
        } else {
          toast.error('An error occurred during registration');
        }
        return;
      }

      console.log('Registration successful:', data); // Log data on successful registration

      toast.success('Successfully registered');
      setActiveTab('signIn');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('An error occurred during registration');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Find the user
      const { data, error } = await supabase
        .from('custom_users')
        .select('*')
        .eq('telegram_username', signInTelegramUsername)
        .single();

      if (error) {
        toast.error('User not found');
        return;
      }

      // Verify the password
      const isPasswordValid = await verifyPassword(password, data.password_hash);

      if (!isPasswordValid) {
        toast.error('Incorrect password');
        return;
      }

      // Store user session in local storage
      const userData = {
        id: data.id,
        telegram_username: data.telegram_username,
        first_name: data.first_name,
        last_name: data.last_name,
        country: data.country,
        memex_payment: data.memex_payment,
        payment_made: data.payment_made,
        payment_method: data.payment_method
      };

      localStorage.setItem('currentUser', JSON.stringify(userData));
      setUser(userData);

      toast.success('Successfully logged in');
      setActiveTab('profile');
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An error occurred during login');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'signUp') {
      handleSignUp(e);
    } else {
      handleSignIn(e);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const generateQrCode = async () => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(paymentAddress);
      setQrCode(qrCodeDataURL);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error('Failed to generate QR code');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">{type === 'signIn' ? 'Sign In' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {type === 'signUp' && (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="auth-input"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="auth-input"
              required
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="auth-input"
              required
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Telegram Username"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              className="auth-input"
              required
            />
          </>
        )}
        {type === 'signIn' && (
          <>
            <input
              type="text"
              placeholder="Telegram Username"
              value={signInTelegramUsername}
              onChange={(e) => setSignInTelegramUsername(e.target.value)}
              className="auth-input"
              required
            />
          </>
        )}
        <div className="auth-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
          <button
            type="button"
            className="auth-toggle-password"
            onClick={toggleShowPassword}
          >
            {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
          </button>
        </div>
        {type === 'signUp' && (
          <div className="payment-info">
            {qrCode && (
              <img src={qrCode} alt="Payment QR Code" className="payment-qr-code enlarged-qr-code" />
            )}
            <p>Scan to get payment address</p>
            <div className="payment-address">
              Payment Address:
              <br />
              {paymentAddress}
            </div>
            <label className="payment-made-label">
              <input
                type="checkbox"
                checked={paymentMade}
                onChange={(e) => setPaymentMade(e.target.checked)}
                className="payment-made-checkbox"
              />
              Memex Payment Made
            </label>
          </div>
        )}
        <button type="submit" className="auth-submit-button">
          {type === 'signIn' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default Auth;
