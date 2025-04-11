import React, { useState, useEffect } from 'react';
import { Copy, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Coupon {
  id: string;
  id: string;
  title: string;
  code: string;
  discount: number | null;
  discount_en?: string;
  validity_date?: string;
  memex_payment?: boolean;
  description?: string;
  image_url?: string;
  category?: string;
  country?: string;
  approved?: boolean;
  user_id?: string;
  brand?: string;
  website_link?: string;
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
    try {
      navigator.clipboard.writeText(coupon.code)
        .then(() => {
          toast.success('Code copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          fallbackCopyTextToClipboard(coupon.code);
        });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      fallbackCopyTextToClipboard(coupon.code);
    }
  };

  function fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      const msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
      toast.success('Code copied to clipboard!');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      toast.error('Failed to copy code!');
    }

    document.body.removeChild(textArea);
  }

  if (timeLeft.expired) {
    return null;
  }

  return (
    <div className="coupon-card hover:scale-105 transition-transform duration-200 relative flex flex-row justify-between">
      {activeTab !== 'admin' && activeTab !== 'home' && (
        <></>
      )}
      <img
        src={coupon.image_url || 'https://cdn.glitch.global/c0240ef5-b1d3-409c-a790-588d18d5cf32/discount.png'}
        alt="Coupon"
        className="coupon-image"
      />
      <div className="coupon-card-content">
        <h3 className="coupon-title">{coupon.title}</h3>
        <p className="coupon-description">{coupon.description}</p>
        <div className="coupon-code-container">
          <div>
            <span className="coupon-code-label">Code:</span>
            <div className="collapsible-code">
              <button className="collapsible-code-button-small green-button" onClick={() => setIsCodeVisible(!isCodeVisible)}>
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
            <span className="coupon-discount-label">
              {coupon.discount_en ? 'Campaign Earnings:' : 'Discount:'}
            </span>
            <span className="coupon-discount" style={{ color: coupon.discount_en ? 'green' : coupon.discount !== null ? 'orange' : 'inherit', fontWeight: 'bold', fontSize: '2em' }}>
              {coupon.discount_en ? `$${coupon.discount_en}` : coupon.discount !== null ? `${coupon.discount}%` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
      <div className="coupon-details flex flex-col"></div>
      <div className="mt-auto flex flex-col">
        {coupon.website_link ? (
          <div className="flex justify-center mt-2 h-12">
            <a
              href={coupon.website_link}
              target="_blank"
              rel="noopener noreferrer"
              className="go-to-website-button"
            >
              Go to Website
            </a>
          </div>
        ) : (
          <div className="h-12" />
        )}
        <div className="flip-clock-container">
          <div className="flip-clock-row">
            <div className="flip-clock-item">
              <span className="flip-clock-label">Gün</span>
              <span className="flip-clock-value">{timeLeft.days}</span>
            </div>
            <div className="flip-clock-item">
              <span className="flip-clock-label">Saat</span>
              <span className="flip-clock-value">{timeLeft.hours}</span>
            </div>
            <div className="flip-clock-item">
              <span className="flip-clock-label">Dakika</span>
              <span className="flip-clock-value">{timeLeft.minutes}</span>
            </div>
            <div className="flip-clock-item">
              <span className="flip-clock-label">Saniye</span>
              <span className="flip-clock-value">{timeLeft.seconds}</span>
            </div>
          </div>
        </div>
        {activeTab === 'profile' && startEditing && handleDelete && (
          <div className="flex flex-col items-center space-y-2 coupon-content">
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => startEditing(coupon)}
                className="edit-button coupon-button"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(coupon.id)}
                className="delete-button coupon-button"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponCard;
