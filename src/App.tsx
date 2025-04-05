import React, { useEffect, useState } from 'react';
import { Plus, X, Check, Loader2, Lock, Home, User, Settings, Eye, EyeOff, Copy } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

import { supabase } from './lib/supabase';
import { hashPassword, verifyPassword } from './lib/auth';
import CouponCard from './components/CouponCard';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import QRCode from 'qrcode';

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

interface UserData {
  id: string;
  telegram_username: string;
  first_name: string;
  last_name: string;
  country: string;
  memex_payment?: boolean;
  payment_made?: boolean;
  payment_method?: string;
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
    validity_date: '',
    memex_payment: false,
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
  const [user, setUser] = useState<any>(null);
  const [userCoupons, setUserCoupons] = useState<Coupon[]>([]);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    country: user?.country || '',
    telegramUsername: user?.telegram_username || '',
  });
  const [memberCount, setMemberCount] = useState(0);
  const [showMemberList, setShowMemberList] = useState(false);
  const [memberList, setMemberList] = useState<UserData[]>([]);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberFormData, setMemberFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    telegramUsername: '',
  });

  useEffect(() => {
    // Uygulama başlangıcında oturum kontrolü
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchCoupons();
    fetchMemberCount();
  }, []);

  useEffect(() => {
    if (formData.image_url) {
      setImagePreview(formData.image_url);
    } else {
      setImagePreview(null);
    }
  }, [formData.image_url]);

  useEffect(() => {
    if (user) {
      fetchUserCoupons();
      setProfileFormData({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        country: user?.country || '',
        telegramUsername: user?.telegram_username || '',
      });
    }
  }, [user]);

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

  const fetchUserCoupons = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching user coupons:", error);
        toast.error('Failed to load user coupons');
        return;
      }

      setUserCoupons(data || []);
    } catch (error) {
      console.error("Error fetching user coupons:", error);
      toast.error('Failed to load user coupons');
    }
  };

  const fetchMemberCount = async () => {
    try {
      const { count, error } = await supabase
        .from('custom_users')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error("Error fetching member count:", error);
        toast.error('Failed to load member count');
        return;
      }

      setMemberCount(count || 0);
    } catch (error) {
      console.error("Error fetching member count:", error);
      toast.error('Failed to load member count');
    }
  };

  const fetchMemberList = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching member list:", error);
        toast.error('Failed to load member list');
        return;
      }

      setMemberList(data || []);
    } catch (error) {
      console.error("Error fetching member list:", error);
      toast.error('Failed to load member list');
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
          validity_date: formData.validity_date,
          memex_payment: formData.memex_payment,
          description: formData.description,
          image_url: formData.image_url,
          website_link: formData.website_link,
          category: formData.category,
          country: formData.country,
          user_id: user?.id
        }]);

      if (error) {
        console.error("Error during insert:", error);
        toast.error(`Failed to add coupon: ${error.message}`);
        return;
      }

      toast.success('Coupon added successfully');
      setFormData({ title: '', code: '', discount: 0, validity_date: '', memex_payment: false, description: '', image_url: '', website_link: '', category: '', country: '' });
      fetchCoupons();
      fetchUserCoupons();
      setShowAddCoupon(false);
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
          validity_date: formData.validity_date || '',
          memex_payment: formData.memex_payment || false,
          description: formData.description || '',
          image_url: formData.image_url || '',
          website_link: formData.website_link || '',
          category: formData.category || '',
          country: formData.country || ''
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
      fetchUserCoupons();
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
      fetchUserCoupons();
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
      validity_date: coupon.validity_date || '',
      memex_payment: coupon.memex_payment || false,
      description: coupon.description || '',
      image_url: coupon.image_url || '',
      website_link: coupon.website_link || '',
      category: coupon.category || '',
      country: coupon.country || ''
    });
    setShowAddCoupon(true);
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
      setActiveTab('home');
    } else {
      toast.error('Incorrect password');
    }
  };

  const navigateToAuth = (type: 'signIn' | 'signUp') => {
    setActiveTab(type);
  };

  const handleSignOut = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setActiveTab('home');
    toast.success('Successfully logged out');
  };

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

  const navigateHome = () => {
    setActiveTab('home');
  };

  const navigateToAdmin = () => {
    setActiveTab('admin');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, name: string) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = (e: React.FormEvent, id: string) => {
    handleEdit(e, id);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: '', code: '', discount: 0, validity_date: '', memex_payment: false, description: '', image_url: '', website_link: '', category: '', country: '' });
  };

  const handleToggleMemberList = async () => {
    setShowMemberList(!showMemberList);
    if (!showMemberList) {
      await fetchMemberList();
    }
  };

  const handleEditMember = (member: UserData) => {
    setEditingMemberId(member.id);
    setMemberFormData({
      firstName: member.first_name,
      lastName: member.lastName,
      country: member.country,
      telegramUsername: member.telegram_username,
    });
  };

  const handleCancelEditMember = () => {
    setEditingMemberId(null);
    setMemberFormData({
      firstName: '',
      lastName: '',
      country: '',
      telegramUsername: '',
    });
  };

  const handleUpdateMember = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('custom_users')
        .update({
          first_name: memberFormData.firstName,
          lastName: memberFormData.lastName,
          country: memberFormData.country,
          telegram_username: memberFormData.telegramUsername,
        })
        .eq('id', id);

      if (error) {
        console.error("Error during member update:", error);
        toast.error(`Failed to update member: ${error.message}`);
        return;
      }

      toast.success('Member updated successfully');
      setEditingMemberId(null);
      fetchMemberList();
    } catch (error) {
      console.error("Error during member update:", error);
      toast.error('Failed to update member');
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error during member delete:", error);
        toast.error(`Failed to delete member: ${error.message}`);
        return;
      }

      toast.success('Member deleted successfully');
      fetchMemberList();
      fetchMemberCount();
    } catch (error) {
      console.error("Error during member delete:", error);
      toast.error('Failed to delete member');
    }
  };

  const handleMemberFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setMemberFormData({
      ...memberFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileEdit = () => {
    setShowEditProfile(true);
  };

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileFormData({
      ...profileFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('custom_users')
        .update({
          first_name: profileFormData.firstName,
          last_name: profileFormData.lastName,
          country: profileFormData.country,
          telegram_username: profileFormData.telegramUsername,
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error during profile update:", error);
        toast.error(`Failed to update profile: ${error.message}`);
        return;
      }

      // Update local storage with new user data
      const updatedUser = {
        ...user,
        first_name: profileFormData.firstName,
        last_name: profileFormData.lastName,
        country: profileFormData.country,
        telegram_username: profileFormData.telegramUsername,
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Profile updated successfully');
      setShowEditProfile(false);
    } catch (error) {
      console.error("Error during profile update:", error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary py-8 text-dark-text">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <img
              src="https://cdn.glitch.global/c0240ef5-b1d3-409c-a790-588d18d5cf32/memexlogo-Photoroom.png"
              alt="MemeX Logo"
              className="h-12 w-auto mr-4 cursor-pointer"
              onClick={navigateHome}
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
            {user ? (
              <button
                onClick={() => setActiveTab('profile')}
                className={`nav-button ${activeTab === 'profile' ? 'active' : ''} mr-2`}
              >
                <User className="w-5 h-5 mr-1" />
                Profile
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('loginRegister')}
                className={`nav-button mr-2 ${activeTab === 'loginRegister' ? 'active' : ''}`}
              >
                Login/Register
              </button>
            )}
            {isAdmin ? (
              <>
                <button
                  onClick={navigateToAdmin}
                  className={`nav-button ${activeTab === 'admin' ? 'active' : ''} mr-2`}
                >
                  <Settings className="w-5 h-5 mr-1" />
                  Admin
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 logout-button mr-2"
                  onClick={() => {
                    setIsAdmin(false);
                    setAdminPassword('');
                    setActiveTab('home');
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                className="admin-login-button"
                onClick={navigateToAdminLogin}
              >
                <Lock className="w-4 h-4 mr-2" />                Admin Login
              </button>
            )}
            {user && (
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 logout-button mr-2"
                onClick={handleSignOut}
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {activeTab === 'home' && (
          <>
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input mb-4 w-full sm:w-auto"
            />
            <img
              src="https://cdn.glitch.global/c0240ef5-b1d3-409c-a790-588d18d5cf32/memex-banner-3.jpg"
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
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    activeTab={activeTab}
                  />
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'loginRegister' && (
          <div className="auth-page-container">
            <Auth type="signIn" setActiveTab={setActiveTab} setUser={setUser} />
            <Auth type="signUp" setActiveTab={setActiveTab} setUser={setUser} />
          </div>
        )}
        {activeTab === 'signIn' && <Auth type="signIn" setActiveTab={setActiveTab} setUser={setUser} />}
        {activeTab === 'signUp' && <Auth type="signUp" setActiveTab={setActiveTab} setUser={setUser} />}

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
              className="form-submit-button mt-4"
            >
              Login
            </button>
          </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <AdminPanel
            coupons={coupons}
            loading={loading}
            editingId={editingId}
            formData={formData}
            toggleApprove={toggleApprove}
            startEditing={startEditing}
            handleDelete={handleDelete}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
            handleCancel={handleCancel}
          />
        )}

        {activeTab === 'profile' && user && (
          <Profile
            user={user}
            userCoupons={userCoupons}
            showEditProfile={showEditProfile}
            profileFormData={profileFormData}
            countries={countries}
            handleProfileEdit={handleProfileEdit}
            handleProfileFormChange={handleProfileFormChange}
            handleProfileUpdate={handleProfileUpdate}
            setShowEditProfile={setShowEditProfile}
            showAddCoupon={showAddCoupon}
            formData={formData}
            categories={categories}
            countriesList={countries}
            editingId={editingId}
            handleSubmit={handleSubmit}
            handleEdit={handleEdit}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
            handleCancel={handleCancel}
            setImagePreview={setImagePreview}
            imagePreview={imagePreview}
            setShowAddCoupon={setShowAddCoupon}
            startEditing={startEditing}
            handleDelete={handleDelete}
          />
        )}
      </div>
      <footer className="bg-dark-secondary text-white py-6 hover:bg-dark-tertiary transition duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
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
