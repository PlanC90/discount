import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Coupon {
  id: string;
  title: string;
  code: string;
  discount: number;
  discount_en?: string;
  validity_date?: string;
  memex_payment?: boolean;
  description?: string;
  image_url?: string;
  website_link?: string;
  category?: string;
  country?: string;
  approved?: boolean;
  user_id?: string;
}

interface CouponCardProps {
  coupon: Coupon;
  activeTab: string;
  startEditing?: (coupon: Coupon) => void;
  handleDelete?: (id: string) => void;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, activeTab, startEditing, handleDelete }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isCodeVisible, setIsCodeVisible] = useState(false);

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timerId);
  }, [coupon.validity_date]);

  function calculateTimeLeft() {
    if (!coupon.validity_date) return { expired: false, days: 0, hours: 0, minutes: 0, seconds: 0 };

    const validityDate = new Date(coupon.validity_date).getTime();
    const now = new Date().getTime();
    const difference = validityDate - now;

    if (difference <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { expired: false, days, hours, minutes, seconds };
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    toast.success('Code copied to clipboard!');
  };

  if (timeLeft.expired) {
    return null;
  }

  return (
    <div className="coupon-card hover:scale-105 transition-transform duration-200 relative">
      {activeTab !== 'home' && (
        <div className="absolute top-2 right-2 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg rounded-md text-sm px-2 py-1">
          {coupon.approved ? 'Approved' : 'Pending'}
        </div>
      )}
      <div className="coupon-card-content">
        <h3 className="coupon-title">{coupon.title}</h3>
        <p className="coupon-description">{coupon.description}</p>
        <div className="coupon-code-container">
          <div>
            <span className="coupon-code-label">Code:</span>
            <div className="collapsible-code">
              <button className="collapsible-code-button-small" onClick={() => setIsCodeVisible(!isCodeVisible)}>
                {isCodeVisible ? 'Hide Code' : 'Show Code'}
              </button>
              {isCodeVisible && (
                <div className="collapsible-code-content">
                  <code className="coupon-code">{coupon.code}</code>
                  <button onClick={handleCopyCode} className="copy-code-button">
                    <Copy className="w-3 h-3 mr-2" />
                    Copy
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="coupon-discount-container">
            <span className="coupon-discount-label">Discount:</span>
            <span className="coupon-discount">{coupon.discount}%</span>
          </div>
        </div>
      </div>
      <img
        src={coupon.image_url || 'https://cdn.glitch.global/c0240ef5-b1d3-409c-a790-588d18d5cf32/discount.png'}
        alt="Coupon"
        className="coupon-image"
      />
      <div className="coupon-expiration flip-clock-container">
        <div className="flip-clock-item">
          <span className="flip-clock-label">Days</span>
          <span className="flip-clock-value">{timeLeft.days}</span>
        </div>
        <div className="flip-clock-item">
          <span className="flip-clock-label">Hours</span>
          <span className="flip-clock-value">{timeLeft.hours}</span>
        </div>
        <div className="flip-clock-item">
          <span className="flip-clock-label">Minutes</span>
          <span className="flip-clock-value">{timeLeft.minutes}</span>
        </div>
        <div className="flip-clock-item">
          <span className="flip-clock-label">Seconds</span>
          <span className="flip-clock-value">{timeLeft.seconds}</span>
        </div>
      </div>
      {coupon.website_link && (
        <div className="flex justify-center mt-2">
          <a
            href={coupon.website_link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-600 transition duration-300 coupon-button"
          >
            Go to Website
          </a>
        </div>
      )}
      {activeTab === 'profile' && startEditing && handleDelete && (
        <div className="flex flex-col items-center space-y-2 coupon-content">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => startEditing(coupon)}
              className="text-blue-600 hover:text-blue-900 coupon-button"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(coupon.id)}
              className="text-red-600 hover:text-red-900 coupon-button"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponCard;
