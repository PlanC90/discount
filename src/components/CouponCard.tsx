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

  if (timeLeft.expired) return null;

  return (
    <div className="relative bg-zinc-900 text-white shadow-lg rounded-lg p-4 flex gap-4 transition-transform hover:scale-105 duration-300">
      <img
        src={coupon.image_url || 'https://cdn.glitch.global/c0240ef5-b1d3-409c-a790-588d18d5cf32/discount.png'}
        alt="Coupon"
        className="w-44 h-44 object-contain"
      />

      <div className="flex flex-col justify-between w-full">
        <div>
          <h3 className="text-xl font-bold">{coupon.title}</h3>
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
              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-700 border border-blue-300 rounded hover:bg-blue-100"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(coupon.id)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-700 border border-red-300 rounded hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Discount / Campaign Earnings moved to top-right corner */}
      <div className="absolute top-2 right-2 flex flex-col items-end">
        <span className="text-gray-400 text-sm">
          {coupon.discount_en ? 'Campaign Earnings:' : 'Discount:'}
        </span>
        <span
          className="text-lg font-bold"
          style={{ color: coupon.discount_en ? 'green' : 'orange' }}
        >
          {coupon.discount_en
            ? `$${coupon.discount_en}`
            : coupon.discount !== null
              ? `${coupon.discount}%`
              : 'N/A'}
        </span>
      </div>

      {/* Countdown Timer moved 2 rows down */}
      <div className="absolute top-36 right-2 flex gap-2 bg-transparent">
        {[
          { label: 'DAYS', value: timeLeft.days },
          { label: 'HOURS', value: timeLeft.hours },
          { label: 'MINUTES', value: timeLeft.minutes },
          { label: 'SECONDS', value: timeLeft.seconds },
        ].map((item, index) => (
          <div key={index} className="bg-zinc-800 text-white text-center px-3 py-2 rounded-md shadow-sm">
            <div className="text-[10px] text-gray-400">{item.label}</div>
            <div className="text-lg font-bold">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Website Button */}
      {coupon.website_link && (
        <a
          href={coupon.website_link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-20 right-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-2 rounded-lg shadow hover:shadow-md text-xs font-semibold transition-all duration-200"
        >
          🌐 Go to Website
        </a>
      )}
    </div>
  );
};

export default CouponCard;
