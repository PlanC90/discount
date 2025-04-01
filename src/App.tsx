import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X, Check, Loader2, Lock, Home, User, Settings, Tag } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './lib/supabase';

interface Coupon {
  id: string;
  title: string;
  code: string;
  discount: number;
  description?: string;
  image_url?: string;
  website_link?: string;
  category?: string;
  country?: string;
  approved?: boolean;
}

const categories = [
  'Food', 'Electronics', 'Clothing', 'Travel', 'Home & Garden', 'Beauty', 'Sports & Outdoors',
  'Books', 'Movies & Music', 'Toys & Games', 'Health & Personal Care', 'Automotive', 'Baby',
  'Pet Supplies', 'Office Supplies', 'School Supplies', 'Arts & Crafts', 'Industrial & Scientific',
  'Other'
];

const countries = [
  'USA', 'Canada', 'UK', 'Germany', 'France', 'Turkey', 'Australia', 'Japan', 'China', 'India',
  'Brazil', 'Mexico', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Russia', 'South Africa', 'Nigeria', 'Egypt', 'Saudi Arabia',
  'United Arab Emirates', 'Singapore', 'South Korea', 'Argentina', 'Colombia', 'Peru', 'Chile',
  'Austria', 'Belgium', 'Ireland', 'Portugal', 'Greece', 'Poland', 'Hungary', 'Czech Republic',
  'Romania', 'Ukraine', 'Vietnam', 'Thailand', 'Indonesia', 'Malaysia', 'Philippines',
  'New Zealand', 'Other'
];

function App() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    discount: 0,
    description: '',
    image_url: '',
    website_link: '',
    category: '',
    country: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (formData.image_url) {
      setImagePreview(formData.image_url);
    } else {
      setImagePreview(null);
    }
  }, [formData.image_url]);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('coupons')
        .insert([{
          title: formData.title,
          code: formData.code,
          discount: formData.discount,
          description: formData.description,
          image_url: formData.image_url,
          website_link: formData.website_link,
          category: formData.category,
          country: formData.country
        }]);

      if (error) {
        console.error("Error during insert:", error);
        toast.error(`Failed to add coupon: ${error.message}`);
        return;
      }
      
      toast.success('Coupon added successfully');
      setFormData({ title: '', code: '', discount: 0, description: '', image_url: '', website_link: '', category: '', country: '' });
      fetchCoupons();
    } catch (error) {
      console.error("Error during insert:", error);
      toast.error('Failed to add coupon');
    }
  };

  const handleEdit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('coupons')
        .update({
          title: formData.title,
          code: formData.code,
          discount: formData.discount,
          description: formData.description,
          image_url: formData.image_url,
          website_link: formData.website_link,
          category: formData.category,
          country: formData.country
        })
        .eq('id', id);

      if (error) {
        console.error("Error during update:", error);
        toast.error(`Failed to update coupon: ${error.message}`);
        return;
      }
      
      toast.success('Coupon updated successfully');
      setEditingId(null);
      fetchCoupons();
    } catch (error) {
      console.error("Error during update:", error);
      toast.error('Failed to update coupon');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error during delete:", error);
        toast.error(`Failed to delete coupon: ${error.message}`);
        return;
      }
      
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      console.error("Error during delete:", error);
      toast.error('Failed to delete coupon');
    }
  };

  const startEditing = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setFormData({
      title: coupon.title,
      code: coupon.code,
      discount: coupon.discount,
      description: coupon.description || '',
      image_url: coupon.image_url || '',
      website_link: coupon.website_link || '',
      category: coupon.category || '',
      country: coupon.country || ''
    });
    setActiveTab('profile');
  };

  const toggleApprove = async (id: string, currentApprovalStatus: boolean) => {
    try {
      const newApprovalStatus = !currentApprovalStatus;
      const { error } = await supabase
        .from('coupons')
        .update({ approved: newApprovalStatus })
        .eq('id', id);

      if (error) {
        console.error("Error during approval toggle:", error);
        toast.error(`Failed to update coupon approval: ${error.message}`);
        return;
      }

      toast.success(`Coupon approval ${newApprovalStatus ? 'approved' : 'unapproved'} successfully`);
      fetchCoupons();
    } catch (error) {
      console.error("Error during approval toggle:", error);
      toast.error('Failed to update coupon approval');
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setActiveTab('admin');
    } else {
      toast.error('Incorrect password');
    }
  };

  const CouponCard = ({ coupon }: { coupon: Coupon }) => (
    
    <div className="coupon-card hover:scale-105 transition-transform duration-200">
      <div className="absolute top-2 right-2 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg rounded-md text-sm px-2 py-1">
        {coupon.approved ? 'Approved' : 'Pending'}
      </div>
      <div className="coupon-card-content">
        <h3 className="coupon-title">{coupon.title}</h3>
        <p className="coupon-description">{coupon.description}</p>
        <div className="coupon-code-container">
          <div>
            <span className="coupon-code-label">Code:</span>
            <code className="coupon-code">{coupon.code}</code>
          </div>
          <div className="coupon-discount-container">
            <span className="coupon-discount-label">Discount:</span>
            <span className="coupon-discount">{coupon.discount}%</span>
          </div>
        </div>
      </div>
      {coupon.image_url && (
        <img
          src={coupon.image_url}
          alt="Coupon"
          className="coupon-image"
        />
      )}
    </div>
  );

  const filteredCoupons = coupons.filter(coupon =>
    coupon.approved &&
    coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()) || true)
  );

  const navigateToAdminLogin = () => {
    setActiveTab('adminLogin');
  };

  const handleBannerLoad = () => {
    setBannerLoaded(true);
  };

  return (
    
    <div className="min-h-screen bg-dark-primary py-8 text-dark-text">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <img
              src="https://cdn.glitch.global/c0240ef5-b1d3-409c-a790-588d18d5cf32/memexlogo-Photoroom.png"
              alt="MemeX Logo"
              className="h-12 w-auto mr-4"
            />
            <span className="text-white font-bold text-lg">MemeX Coupon</span>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setActiveTab('home')}
              className={`nav-button ${activeTab === 'home' ? 'active' : ''} mr-2`}
            >
              <Home className="w-5 h-5 mr-1" />
              Home
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`nav-button ${activeTab === 'profile' ? 'active' : ''} mr-2`}
            >
              <User className="w-5 h-5 mr-1" />
              Profile
            </button>
            {isAdmin ? (
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => {
                  setIsAdmin(false);
                  setAdminPassword('');
                  setActiveTab('home');
                }}
              >
                Logout
              </button>
            ) : (
              <button
                className="admin-login-button"
                onClick={navigateToAdminLogin}
              >
                <Lock className="w-4 h-4 mr-2" />
                Admin Login
              </button>
            )}
          </div>
        </div>

        {activeTab === 'adminLogin' && (
          <div className="form-container">
            <h2 className="form-title">Admin Login</h2>
            <input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="form-input"
            />
            <button
              onClick={handleAdminLogin}
              className="form-submit-button"
            >
              Login
            </button>
          </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div className="admin-panel">
            <h2 className="admin-panel-title">Admin Panel</h2>
            <div className="admin-summary-grid">
              <div className="admin-summary-card">
                <h3 className="admin-summary-title">Total Coupons</h3>
                <p className="admin-summary-value">{coupons.length}</p>
              </div>
              <div className="admin-summary-card">
                <h3 className="admin-summary-title">Approved Coupons</h3>
                <p className="admin-summary-value">{coupons.filter(c => c.approved).length}</p>
              </div>
              <div className="admin-summary-card">
                <h3 className="admin-summary-title">Pending Coupons</h3>
                <p className="admin-summary-value">{coupons.filter(c => !c.approved).length}</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div className="form-container">
            <h2 className="form-title">
              {editingId ? 'Edit Coupon' : 'Add New Coupon'}
            </h2>
            <form onSubmit={editingId ? (e) => handleEdit(e, editingId) : handleSubmit} className="space-y-4">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-grid">
                <input
                  type="number"
                  placeholder="Discount"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                  className="form-input"
                  required
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="grid grid-cols-1 space-y-4">
                <input
                  type="url"
                  placeholder="Website Link"
                  value={formData.website_link}
                  onChange={(e) => setFormData({ ...formData, website_link: e.target.value })}
                  className="form-input"
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-input"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="form-input"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Image Preview" className="form-image-preview" />
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
                      setEditingId(null);
                      setFormData({ title: '', code: '', discount: 0, description: '', image_url: '', website_link: '', category: '', country: '' });
                      setImagePreview(null);
                      setActiveTab('admin');
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

        {activeTab === 'home' && (
          <>
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input mb-4"
            />
            <img
              src="https://cdn.glitch.global/c0240ef5-b1d3-409c-a790-588d18d5cf32/memex-banner2.png"
              alt="Discount Banner"
              className={`coupon-banner mb-4 ${bannerLoaded ? 'loaded' : 'loading'}`}
              onLoad={handleBannerLoad}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : filteredCoupons.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No approved coupons match your search</p>
              ) : (
                filteredCoupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div className="admin-panel">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <table className="admin-table">
                  <thead className="admin-table-header">
                    <tr>
                      <th className="admin-table-header-cell">Title</th>
                      <th className="admin-table-header-cell">Code</th>
                      <th className="admin-table-header-cell">Discount</th>
                      <th className="admin-table-header-cell">Description</th>
                      <th className="admin-table-header-cell">Image</th>
                      <th className="admin-table-header-cell">Approval</th>
                      <th className="admin-table-header-cell text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="admin-table-body">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="admin-table-row">
                        <td className="admin-table-cell">{coupon.title}</td>
                        <td className="admin-table-cell">{coupon.code}</td>
                        <td className="admin-table-cell">{coupon.discount}</td>
                        <td className="admin-table-cell">
                          {coupon.description && coupon.description.length > 20
                            ? `${coupon.description.substring(0, 20)}...`
                            : coupon.description}
                        </td>
                        <td className="admin-table-cell">
                          {coupon.image_url && (
                            <img src={coupon.image_url} alt="Coupon" className="admin-table-image" />
                          )}
                        </td>
                        <td className="admin-table-cell">
                          <button
                            onClick={() => toggleApprove(coupon.id, !!coupon.approved)}
                            className={`admin-table-approve-button ${coupon.approved ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                          >
                            {coupon.approved ? 'Approved' : 'Approve'}
                          </button>
                        </td>
                        <td className="admin-table-cell admin-table-actions">
                          <button
                            onClick={() => startEditing(coupon)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={()={() => handleDelete(coupon.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
      <footer className="bg-dark-secondary text-white py-6 hover:bg-dark-tertiary transition duration-300">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Coupon App. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-brand-yellow">Terms of Service</a>
            <a href="#" className="hover:text-brand-yellow">Privacy Policy</a>
          </div>
        </div>
      </footer>
      <Toaster position="top-right" />
    </div>
  
  );
}

export default App;
