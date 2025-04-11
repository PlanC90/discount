import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Loader2, Lock, Home, User, Settings, Eye, EyeOff, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CouponCard from './CouponCard';
import { supabase } from '../lib/supabase';

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
  const [startDate, setStartDate] = useState<Date | null>(formData.validity_date ? new Date(formData.validity_date) : null);
  const [discountType, setDiscountType] = useState<'discount' | 'campaign'>('discount');
  const [campaignEarnings, setCampaignEarnings] = useState<number | ''>('');
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [userBrands, setUserBrands] = useState<string[]>([]);
  const [userSpecificCoupons, setUserSpecificCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    if (startDate) {
      handleInputChange({ target: { value: startDate.toISOString().split('T')[0], name: 'validity_date' } } as any, 'validity_date');
    }
  }, [startDate]);

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
    // Filter coupons to only show those created by the current user
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

  const handleDiscountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDiscountType(e.target.value as 'discount' | 'campaign');
  };

  const handleCampaignEarningsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCampaignEarnings(e.target.value === '' ? '' : Number(e.target.value));
    handleInputChange({ target: { value: e.target.value, name: 'discount' } } as any, 'discount');
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from('coupons')
        .update({
          title: formData.title,
          code: formData.code,
          discount: formData.discount,
          validity_date: formData.validity_date,
          memex_payment: formData.memex_payment,
          description: formData.description,
          image_url: formData.image_url,
          website_link: formData.website_link,
          category: formData.category,
          country: formData.country,
          brand: formData.brand,
        })
        .eq('id', editingId)

      if (error) {
        throw error;
      }

      toast.success('Coupon updated successfully!');
      handleCancel();
    } catch (error: any) {
      toast.error(`Failed to update coupon: ${error.message}`);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    // Extract only the necessary data from formData
    const couponData = {
      title: formData.title,
      code: formData.code,
      discount: formData.discount,
      validity_date: formData.validity_date,
      memex_payment: formData.memex_payment,
      description: formData.description,
      image_url: formData.image_url,
      website_link: formData.website_link,
      category: formData.category,
      country: formData.country,
      user_id: user.id,
      brand: formData.brand,
    };

    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert([couponData]);

      if (error) {
        throw error;
      }

      toast.success('Coupon added successfully!');
      setShowAddCoupon(false);
    } catch (error: any) {
      toast.error(`Failed to add coupon: ${error.message}`);
    }
  };

  const createBrandPage = (brand: string) => {
    const pageContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Edit Brand: ${brand}</title>
      </head>
      <body>
        <h1>Edit Brand: ${brand}</h1>
        <p>Here you can edit the details for the brand: ${brand}</p>
        <p>This is a placeholder page. Functionality to edit brand details will be added later.</p>
      </body>
      </html>
    `;
    const blob = new Blob([pageContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    return url;
  };

  return (
    <div className="profile-container">
      {/* Added Brands Section */}
      <div className="user-brands-section">
        <h3 className="user-brands-title">Your Brands</h3>
        <div className="user-brands-list">
          {Array.isArray(userBrands) && userBrands.length > 0 ? (
            userBrands.map((brand, index) => {
              const brandPageUrl = createBrandPage(brand);
              return (
                <a key={index} href={brandPageUrl} target="_blank" rel="noopener noreferrer" className="user-brand-item">
                  {brand}
                </a>
              );
            })
          ) : (
            <p>Marka henüz eklenmedi.</p>
          )}
        </div>
      </div>

      <div className="user-info-summary">
        <div className="user-info-card">
          <h3 className="user-info-title">Personal Information</h3>
          <p><strong>First Name:</strong> {user?.first_name}</p>
          <p><strong>Last Name:</strong> {user?.last_name}</p>
          <p><strong>Telegram Username:</strong> {user?.telegram_username}</p>
          <p><strong>Country:</strong> {user?.country}</p>
          <button className="user-edit-button" onClick={() => setShowEditProfile(true)}>
            Edit Profile
          </button>
        </div>

        <div className="user-stats-card">
          <h3 className="user-stats-title">Coupon Statistics</h3>
          <p><strong>Total Coupons:</strong> {userSpecificCoupons?.length}</p>
        </div>
      </div>

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
              <button type="submit" className="form-submit-button">
                Update Profile
              </button>
              <button
                type="button"
                className="form-cancel-button ml-2"
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
        <div className="flex items-center">
          <button className="add-coupon-button" onClick={() => setShowAddCoupon(!showAddCoupon)}>
            {showAddCoupon ? 'Add Coupon' : 'Add Coupon'}
          </button>
          {showAddCoupon && (
            <button className="form-cancel-button ml-2" style={{ backgroundColor: 'red' }} onClick={() => setShowAddCoupon(false)}>
              Cancel Add Coupon
            </button>
          )}
        </div>
      </div>

      {showAddCoupon && (
        <div className="form-container">
          <h2 className="form-title">{editingId ? 'Edit Coupon' : 'Add Coupon'}</h2>
          <form onSubmit={editingId ? (e) => handleSaveCoupon(e) : handleAddCoupon} className="form-grid">
            <div className="col-span-2">
              <label htmlFor="title" className="form-label">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) => handleInputChange(e, 'title')}
                className="form-input"
                required
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="code" className="form-label">Code:</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={(e) => handleInputChange(e, 'code')}
                className="form-input"
                required
              />
            </div>
            <div>
              <label htmlFor="discountType" className="form-label">Discount Type:</label>
              <select
                id="discountType"
                name="discountType"
                value={discountType}
                onChange={handleDiscountTypeChange}
                className="form-input"
              >
                <option value="discount">Discount</option>
                <option value="campaign">Campaign</option>
              </select>
            </div>
            {discountType === 'discount' ? (
              <div>
                <label htmlFor="discount" className="form-label">Discount:</label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={formData.discount}
                  onChange={(e) => handleInputChange(e, 'discount')}
                  className="form-input"
                  required
                />
              </div>
            ) : (
              <div>
                <label htmlFor="campaignEarnings" className="form-label">Campaign Earnings:</label>
                <input
                  type="number"
                  id="campaignEarnings"
                  name="campaignEarnings"
                  value={campaignEarnings}
                  onChange={handleCampaignEarningsChange}
                  className="form-input"
                  required
                />
              </div>
            )}
            <div>
              <div className="flex flex-col">
                <label htmlFor="validity_date" className="form-label">Validity Date:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  dateFormat="dd.MM.yyyy"
                  className="form-input"
                  placeholderText="gg.aa.yyyy"
                />
              </div>
            </div>
            <div>
              <label htmlFor="memex_payment" className="form-label">
                If your business or site accepts payments with MemeX, check this box:
              </label>
              <select
                id="memex_payment"
                name="memex_payment"
                value={formData.memex_payment ? 'true' : 'false'}
                onChange={(e) => handleInputChange(e, 'memex_payment')}
                className="form-input"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div>
              <label htmlFor="description" className="form-label">Description:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => handleInputChange(e, 'description')}
                className="form-input form-textarea"
              />
            </div>
            <div>
              <label htmlFor="image_url" className="form-label">Add Image URL:</label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={(e) => {
                  handleInputChange(e, 'image_url');
                }}
                className="form-input"
              />
              {imagePreview && <img src={imagePreview} alt="Preview" className="form-image-preview" />}
            </div>
            <div>
              <label htmlFor="website_link" className="form-label">Website Link:</label>
              <input
                type="text"
                id="website_link"
                name="website_link"
                value={formData.website_link}
                onChange={(e) => handleInputChange(e, 'website_link')}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="category" className="form-label">Select Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={(e) => handleInputChange(e, 'category')}
                className="form-input"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="country" className="form-label">Select Country</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={(e) => handleInputChange(e, 'country')}
                className="form-input"
              >
                <option value="">Select a country</option>
                <option value="all">Select All Countries</option>
                {countriesList.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="brand" className="form-label">Brand:</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange(e, 'brand')}
                className="form-input"
                list="brandOptions"
              />
              <datalist id="brandOptions">
                {availableBrands.map((brand, index) => (
                  <option key={index} value={brand} />
                ))}
              </datalist>
            </div>
            <div className="col-span-2 flex justify-end">
              <button type="submit" className="form-submit-button">
                {editingId ? 'Save Coupon' : 'Add Coupon'}
              </button>
              {editingId ? (
                <button type="button" className="form-cancel-button ml-2" onClick={handleCancel}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>
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
          <p>Kupon bulunmamaktadır.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
