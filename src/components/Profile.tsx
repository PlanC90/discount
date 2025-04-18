import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Loader2, Lock, Home, User, Settings, Eye, EyeOff, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CouponCard from './CouponCard';
import { supabase } from '../lib/supabase';
import AddCouponForm from './Profile/AddCouponForm';
import UserInfo from './Profile/UserInfo';

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
  country: string;
  approved?: boolean;
  user_id?: string;
  brand?: string;
}

interface ProfileProps {
  user: any;
  userCoupons: Coupon[];
  showEditProfile: boolean;
  profileFormData: {
    firstName: string;
    lastName: string;
    country: string;
    telegramUsername: string;
  };
  countries: string[];
  handleProfileEdit: () => void;
  handleProfileFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setShowEditProfile: (show: boolean) => void;
  showAddCoupon: boolean;
  formData: {
    title: string;
    code: string;
    discount: number;
    validity_date: string;
    memex_payment: boolean;
    description: string;
    image_url: string;
    website_link: string;
    category: string;
    country: string;
    brand: string;
  };
  categories: string[];
  countriesList: string[];
  editingId: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEdit: (e: React.FormEvent, id: string) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, name: string) => void;
  handleSave: (e: React.FormEvent) => Promise<void>;
  setImagePreview: (url: string | null) => void;
  imagePreview: string | null;
  setShowAddCoupon: (show: boolean) => void;
  startEditing: (coupon: Coupon) => void;
  handleDelete: (id: string) => void;
  handleProfileUpdate: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

const Profile: React.FC<ProfileProps> = ({
  user,
  userCoupons,
  showEditProfile,
  profileFormData,
  countries,
  handleProfileEdit,
  handleProfileFormChange,
  setShowEditProfile,
  showAddCoupon,
  formData,
  categories,
  countriesList,
  editingId,
  handleSubmit,
  handleEdit,
  handleInputChange,
  handleSave,
  setImagePreview,
  imagePreview,
  setShowAddCoupon,
  startEditing,
  handleDelete,
  handleProfileUpdate,
  handleCancel
}) => {
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [userBrands, setUserBrands] = useState<string[]>([]);
  const [userSpecificCoupons, setUserSpecificCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    const fetchAvailableBrands = async () => {
      try {
        const brandsSet = new Set<string>();
        if (userCoupons && Array.isArray(userCoupons)) {
          userCoupons.forEach(coupon => {
            if (coupon.brand) {
              brandsSet.add(coupon.brand);
            }
          });
        }

        const { data, error } = await supabase
          .from('coupons')
          .select('brand')
          .not('brand', 'is', null);

        if (error) {
          throw error;
        }

        data.forEach(coupon => {
          if (coupon.brand) {
            brandsSet.add(coupon.brand);
          }
        });

        setAvailableBrands(Array.from(brandsSet));
      } catch (error: any) {
        toast.error(`Failed to fetch brands: ${error.message}`);
      }
    };

    fetchAvailableBrands();
  }, [userCoupons]);

  useEffect(() => {
    const fetchUserBrands = async () => {
      try {
        const brandsSet = new Set<string>();
        if (userCoupons && Array.isArray(userCoupons)) {
          userCoupons.forEach(coupon => {
            if (coupon.brand && coupon.user_id === user.id) {
              brandsSet.add(coupon.brand);
            }
          });
        }
        setUserBrands(Array.from(brandsSet));
      } catch (error: any) {
        toast.error(`Failed to fetch user brands: ${error.message}`);
      }
    };

    fetchUserBrands();
  }, [userCoupons, user.id]);

  useEffect(() => {
    const fetchUserCoupons = async () => {
      if (user && user.id) {
        try {
          const { data: coupons, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('user_id', user.id);

          if (error) {
            throw error;
          }

          setUserSpecificCoupons(coupons || []);
        } catch (error: any) {
          toast.error(`Failed to fetch user coupons: ${error.message}`);
          setUserSpecificCoupons([]);
        }
      } else {
        setUserSpecificCoupons([]);
      }
    };

    fetchUserCoupons();
  }, [user]);

  const handleCancelForm = () => {
    setShowAddCoupon(false);
    handleCancel();
  };

  return (
    <div className="profile-container">
      <UserInfo user={user} handleEditProfile={handleProfileEdit} />

      {showEditProfile && (
        <div className="form-container">
          <h2 className="form-title">Edit Profile</h2>
          <form onSubmit={handleProfileUpdate} className="form-grid">
            <div>
              <label htmlFor="firstName" className="form-label">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileFormData.firstName}
                onChange={handleProfileFormChange}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="form-label">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileFormData.lastName}
                onChange={handleProfileFormChange}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="telegramUsername" className="form-label">Telegram Username:</label>
              <input
                type="text"
                id="telegramUsername"
                name="telegramUsername"
                value={profileFormData.telegramUsername}
                onChange={handleProfileFormChange}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="country" className="form-label">Country:</label>
              <select
                id="country"
                name="country"
                value={profileFormData.country}
                onChange={handleProfileFormChange}
                className="form-input"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex justify-end">
              <button type="submit" className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300">
                Update Profile
              </button>
              <button
                type="button"
                className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 ml-2"
                onClick={() => setShowEditProfile(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Your Coupons</h2>
        <button 
          onClick={() => setShowAddCoupon(!showAddCoupon)}
          className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
        >
          {showAddCoupon ? 'Cancel' : 'Add Coupon'}
        </button>
      </div>

      {showAddCoupon && (
        <AddCouponForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancelForm}
          categories={categories}
          countries={countriesList}
          imagePreview={imagePreview}
          editingId={editingId}
          availableBrands={availableBrands}
        />
      )}

      <div className="coupon-list-container">
        {userSpecificCoupons && Array.isArray(userSpecificCoupons) && userSpecificCoupons.length > 0 ? (
          <ul className="coupon-list">
            {userSpecificCoupons.map((coupon) => (
              <li key={coupon.id} className="coupon-list-item">
                <CouponCard
                  coupon={coupon}
                  activeTab="profile"
                  startEditing={startEditing}
                  handleDelete={handleDelete}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No coupons found.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
