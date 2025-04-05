import React from 'react';
import { Plus, X, Check } from 'lucide-react';

import CouponCard from './CouponCard';

interface ProfileProps {
  user: any;
  userCoupons: any[];
  showEditProfile: boolean;
  profileFormData: any;
  countries: string[];
  handleProfileEdit: () => void;
  handleProfileFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleProfileUpdate: (e: React.FormEvent) => Promise<void>;
  setShowEditProfile: (show: boolean) => void;
  showAddCoupon: boolean;
  formData: any;
  categories: string[];
  countriesList: string[];
  editingId: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEdit: (e: React.FormEvent, id: string) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, name: string) => void;
  handleSave: (e: React.FormEvent, id: string) => void;
  handleCancel: () => void;
  setImagePreview: (preview: string | null) => void;
  imagePreview: string | null;
  setShowAddCoupon: (show: boolean) => void;
  startEditing: (coupon: any) => void;
  handleDelete: (id: string) => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({
  user,
  userCoupons,
  showEditProfile,
  profileFormData,
  countries,
  handleProfileEdit,
  handleProfileFormChange,
  handleProfileUpdate,
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
  handleCancel,
  setImagePreview,
  imagePreview,
  setShowAddCoupon,
  startEditing,
  handleDelete,
}) => {
  return (
    <div className="form-container">
      <div className="user-info-summary">
        <div className="user-info-card">
          <h3 className="user-info-title">Welcome, {user?.first_name}</h3>
          <button className="user-edit-button" onClick={handleProfileEdit}>Edit Profile</button>
        </div>
        <div className="user-stats-card">
          <h3 className="user-stats-title">Coupons Added</h3>
          <p className="user-stats-value">{userCoupons.length}</p>
        </div>
        <div className="user-stats-card">
          <h3 className="user-stats-title">Total Clicks</h3>
          <p className="user-stats-value">0</p>
        </div>
      </div>

      {showEditProfile && (
        <div className="edit-profile-form bg-dark-secondary">
          <h2 className="form-title">Edit Profile</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={profileFormData.firstName}
              onChange={handleProfileFormChange}
              className="form-input"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={profileFormData.lastName}
              onChange={handleProfileFormChange}
              className="form-input"
              required
            />
            <select
              name="country"
              value={profileFormData.country}
              onChange={handleProfileFormChange}
              className="form-input"
              required
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <input
              type="text"
              name="telegramUsername"
              placeholder="Telegram Username"
              value={profileFormData.telegramUsername}
              onChange={handleProfileFormChange}
              className="form-input"
              required
            />
            <div className="flex space-x-2">
              <button type="submit" className="form-submit-button">
                <Check className="w-4 h-4 mr-2" />
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="form-cancel-button"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <button className="add-coupon-button" onClick={() => setShowAddCoupon(!showAddCoupon)}>
        {showAddCoupon ? 'Hide Coupon Form' : 'Add New Coupon'}
      </button>

      {showAddCoupon && (
        <div className="add-coupon-form">
          <h2 className="form-title">
            {editingId ? 'Edit Coupon' : 'Add New Coupon'}
          </h2>
          <form onSubmit={editingId ? (e) => handleEdit(e, editingId) : handleSubmit} className="space-y-4">
            <div className="form-grid">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => handleInputChange(e, 'title')}
                className="form-input"
                required
              />
              <input
                type="text"
                name="code"
                placeholder="Code"
                value={formData.code}
                onChange={(e) => handleInputChange(e, 'code')}
                className="form-input"
                required
              />
            </div>
            <div className="form-grid">
              <input
                type="number"
                name="discount"
                placeholder="Discount %"
                value={formData.discount}
                onChange={(e) => handleInputChange(e, 'discount')}
                className="form-input"
                required
              />
            </div>
            <div className="form-grid">
              <input
                type="date"
                name="validity_date"
                placeholder="Validity Date"
                value={formData.validity_date || ''}
                onChange={(e) => handleInputChange(e, 'validity_date')}
                className="form-input"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="memex_payment"
                  name="memex_payment"
                  checked={formData.memex_payment || false}
                  onChange={(e) => handleInputChange(e, 'memex_payment')}
                  className="form-checkbox"
                />
                <label htmlFor="memex_payment" className="ml-2 text-sm">Memex Payment</label>
              </div>
            </div>
            <div className="grid grid-cols-1 space-y-4">
              <input
                type="url"
                name="image_url"
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) => handleInputChange(e, 'image_url')}
                className="form-input"
              />
              <input
                type="url"
                name="website_link"
                placeholder="Website Link"
                value={formData.website_link}
                onChange={(e) => handleInputChange(e, 'website_link')}
                className="form-input"
              />

              <select
                name="category"
                value={formData.category}
                onChange={(e) => handleInputChange(e, 'category')}
                className="form-input"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                name="country"
                value={formData.country}
                onChange={(e) => handleInputChange(e, 'country')}
                className="form-input"
                            >
                <option value="">Select Country</option>
                {countriesList.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => handleInputChange(e, 'description')}
                className="form-textarea"
              />
              {imagePreview && (
                <img src={imagePreview}alt="Image Preview" className="form-image-preview" />
              )}
            </div>
            {editingId ? (
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="form-submit-button"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCancel();
                    setImagePreview(null);
                    setShowAddCoupon(false);
                  }}
                  className="form-cancel-button"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className="form-submit-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Coupon
              </button>
            )}
          </form>
        </div>
      )}

      <h3 className="form-title">My Coupons</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userCoupons.length === 0 ? (
          <p className="text-center py-8 text-gray-500">You haven't added any coupons yet.</p>
        ) : (
          userCoupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              activeTab="profile"
              startEditing={startEditing}
              handleDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
