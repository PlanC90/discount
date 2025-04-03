import React, { useEffect, useState } from 'react';
import { Plus, X, Check, Loader2, Lock, Home, User, Settings, Eye, EyeOff } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { hashPassword, verifyPassword } from './lib/auth';

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
    discount_en: '',
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

  useEffect(() => {
    // Uygulama başlangıcında oturum kontrolü
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchCoupons();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('coupons')
        .insert([{
          title: formData.title,
          code: formData.code,
          discount: formData.discount,
          discount_en: formData.discount_en,
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
      setFormData({ title: '', code: '', discount: 0, discount_en: '', validity_date: '', memex_payment: false, description: '', image_url: '', website_link: '', category: '', country: '' });
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
          discount_en: formData.discount_en || '',
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
      discount_en: coupon.discount_en || '',
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
    toast.success('Başarıyla çıkış yaptınız');
  };

  const CouponCard = ({ coupon }: { coupon: Coupon }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

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

    return (
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
        <img
          src={coupon.image_url || 'https://cdn.glitch.global/c0240ef5-b1d3-409c-a790-588d18d5cf32/discount.png'}
          alt="Coupon"
          className="coupon-image"
        />
        <div className="coupon-expiration flip-clock-container">
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
    );
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

  const Auth = ({ type }: { type: 'signIn' | 'signUp' }) => {
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [country, setCountry] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [telegramUsername, setTelegramUsername] = useState('');
    const [signInTelegramUsername, setSignInTelegramUsername] = useState('');

    const handleSignUp = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        // Şifreyi hashle
        const passwordHash = await hashPassword(password);

        console.log('Şifre hashlendi:', passwordHash); // Şifre hash'ini logla

        // Kullanıcıyı veritabanına ekle
        const { data, error } = await supabase
          .from('custom_users')
          .insert([{
            telegram_username: telegramUsername,
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            country: country
          }])
          .select(); // Verileri almayı dene

        if (error) {
          console.error('Kayıt hatası:', error);
          if (error.code === '23505') {
            toast.error('Bu Telegram kullanıcı adı zaten kullanılıyor');
          } else {
            toast.error('Kayıt sırasında bir hata oluştu');
          }
          return;
        }

        console.log('Kayıt başarılı:', data); // Başarılı kayıt durumunda verileri logla

        toast.success('Başarıyla kaydoldunuz');
        setActiveTab('signIn');
      } catch (err) {
        console.error('Kayıt hatası:', err);
        toast.error('Kayıt sırasında bir hata oluştu');
      }
    };

    const handleSignIn = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        // Kullanıcıyı bul
        const { data, error } = await supabase
          .from('custom_users')
          .select('*')
          .eq('telegram_username', signInTelegramUsername)
          .single();

        if (error) {
          toast.error('Kullanıcı bulunamadı');
          return;
        }

        // Şifreyi doğrula
        const isPasswordValid = await verifyPassword(password, data.password_hash);

        if (!isPasswordValid) {
          toast.error('Hatalı şifre');
          return;
        }

        // Kullanıcı oturumunu yerel depolamada sakla
        const userData = {
          id: data.id,
          telegram_username: data.telegram_username,
          first_name: data.first_name,
          last_name: data.last_name,
          country: data.country
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));
        setUser(userData);

        toast.success('Başarıyla giriş yaptınız');
        setActiveTab('profile');
      } catch (err) {
        console.error('Giriş hatası:', err);
        toast.error('Giriş sırasında bir hata oluştu');
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

    return (
      <div className="form-container">
        <h2 className="form-title">{type === 'signIn' ? 'Sign In' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'signUp' && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="form-input"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="form-input"
                required
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
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
                placeholder="Telegram Username"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                className="form-input"
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
                className="form-input"
                required
              />
            </>
          )}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer"
              onClick={toggleShowPassword}
            >
              {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
            </button>
          </div>
          <button type="submit" className="form-submit-button">
            {type === 'signIn' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
      </div>
    );
  };

  const handleProfileEdit = () => {
    setShowEditProfile(true);
    setProfileFormData({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      country: user?.country || '',
      telegramUsername: user?.telegram_username || '',
    });
  };

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileFormData({
      ...profileFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Update local storage and state with new user data
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
                Add Coupon
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigateToAuth('signIn')}
                  className={`nav-button mr-2`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigateToAuth('signUp')}
                  className={`nav-button mr-2`}
                >
                  Register
                </button>
                <button
                  onClick={() => navigateToAuth('signIn')}
                  className={`nav-button mr-2`}
                >
                  <User className="w-5 h-5 mr-1" />
                  Add Coupon
                </button>
              </>
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
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
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
                <Lock className="w-4 h-4 mr-2" />
                Admin Login
              </button>
            )}
            {user && (
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                onClick={handleSignOut}
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {activeTab === 'signIn' && <Auth type="signIn" />}
        {activeTab === 'signUp' && <Auth type="signUp" />}

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

        {activeTab === 'profile' && user && (
          <div className="form-container">
            <div className="user-info-summary">
              <div className="user-info-card">
                <h3 className="user-info-title">Welcome, {user.first_name}</h3>
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
              <div className="edit-profile-form">
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
                      type="text"
                      placeholder="Discount (EN)"
                      value={formData.discount_en || ''}
                      onChange={(e) => setFormData({ ...formData, discount_en: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-grid">
                    <input
                      type="date"
                      placeholder="Validity Date"
                      value={formData.validity_date || ''}
                      onChange={(e) => setFormData({ ...formData, validity_date: e.target.value })}
                      className="form-input"
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="memex_payment"
                        checked={formData.memex_payment || false}
                        onChange={(e) => setFormData({ ...formData, memex_payment: e.target.checked })}
                        className="form-checkbox"
                      />
                      <label htmlFor="memex_payment" className="ml-2 text-sm">Memex Payment</label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 space-y-4">
                    <input
                      type="url"
                      placeholder="Image URL"
                      value={formData.image_url}
                      onChange={(e) => setFormData({... formData, image_url: e.target.value })}
                      className="form-input"
                    />
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
                          setFormData({ title: '', code: '', discount: 0, discount_en: '', validity_date:'', memex_payment: false, description: '', image_url: '', website_link: '', category: '', country: '' });
                          setImagePreview(null);
                          setActiveTab('profile');
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
                  />
                ))
              )}
            </div>
          </div>
        )}

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
                  />
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
                            className={`admin-table-approve-button ${coupon.approved ?'bg-green-5500 text-white' : 'bg-red-500 text-white'}`}
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
                            onClick={() => handleDelete(coupon.id)}
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
