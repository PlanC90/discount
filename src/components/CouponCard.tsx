import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Coupon {
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
  discount_type?: 'discount' | 'campaign';
}

interface CouponCardProps {
  coupon: Coupon;
  activeTab?: string;
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
    navigator.clipboard.writeText(coupon.code)
      .then(() => toast.success('Code copied to clipboard!'))
      .catch(() => fallbackCopyTextToClipboard(coupon.code));
  };

  function fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      toast.success('Code copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy code!');
    }

    document.body.removeChild(textArea);
  }

  const formatNumber = (number: number | null) => {
    if (number === null) return '';
    return number.toLocaleString('tr-TR');
  };

  if (timeLeft.expired) return null;

  return (
    <div className="relative bg-zinc-900 text-white shadow-lg rounded-lg p-4 flex flex-row gap-4">
      {/* Image on the left */}
      <div className="w-44 h-44 flex-shrink-0 relative">
        <img
          src={coupon.image_url || 'https://cdn.glitch.global/c0240ef5-b1d3-409c-a790-588d18d5cf32/discount.png'}
          alt="Coupon"
          className="w-full h-full object-contain rounded-lg"
        />
        {/* Website link */}
        {coupon.website_link && (
          <a
            href={coupon.website_link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 left-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-2 rounded-lg shadow hover:shadow-md text-xs font-semibold transition-all duration-200 flex items-center justify-center"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              right: '2px' // Add this line
            }}
          >
            🌐 Go to Website
          </a>
        )}
      </div>

      <div className="flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-xl font-bold mb-2">{coupon.title}</h3>
          <p className="text-gray-300 text-sm mb-2">{coupon.description}</p>

          <div className="mb-2">
            <span className="text-gray-400 text-sm">Code:</span>
            <button
              onClick={() => setIsCodeVisible(!isCodeVisible)}
              className="ml-2 px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200"
            >
              {isCodeVisible ? 'Hide Code' : 'Show Code'}
            </button>
            {isCodeVisible && (
              <div className="mt-1 flex items-center gap-2">
                <code className="text-sm font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">{coupon.code}</code>
                <button
                  onClick={handleCopyCode}
                  className="text-xs text-blue-600 hover:underline flex items-center"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </button>
              </div>
            )}
          </div>
        </div>

        {activeTab === 'profile' && startEditing && handleDelete && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => startEditing(coupon)}
              className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(coupon.id)}
              className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Discount badge */}
      <div className="absolute top-2 right-2" style={{ width: '11rem', textAlign: 'right' }}>
        {coupon.discount_type === 'campaign' ? (
          <div style={{
            width: '11rem',
            textAlign: 'center',
            color: 'orange',
            fontSize: '2rem',
            fontWeight: 'bold',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
            {formatNumber(coupon.discount)}
          </div>
        ) : (
          coupon.discount !== null && coupon.discount !== undefined ? (
            <span className="text-2xl font-bold" style={{ color: 'orange' }}>
              {`${coupon.discount}%`}
            </span>
          ) : null
        )}
      </div>

      {/* Timer */}
      <div className="absolute bottom-2 right-2 flex gap-2">
        {[
          { label: 'DAYS', value: timeLeft.days },
          { label: 'HOURS', value: timeLeft.hours },
          { label: 'MINUTES', value: timeLeft.minutes },
          { label: 'SECONDS', value: timeLeft.seconds },
        ].map((item, index) => (
          <div key={index} className="bg-zinc-800 text-white text-center px-2 py-1 rounded-md shadow-sm">
            <div className="text-[8px] text-gray-400">{item.label}</div>
            <div className="text-sm font-bold">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponCard;
