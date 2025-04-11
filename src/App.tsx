import React, { useEffect, useState, useRef } from 'react';
import { Plus, X, Check, Loader2, Lock, Home, User, Settings, Eye, EyeOff, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

import { supabase } from './lib/supabase';
import { hashPassword, verifyPassword } from './lib/auth';
import CouponCard from './components/CouponCard';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import QRCode from 'qrcode';
import HomeTab from './components/Home';
import Brands from './components/Brands';

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

const languageToCountryMap: { [key: string]: string } = {
  'en-US': 'USA',
  'en-CA': 'Canada',
  'en-GB': 'UK',
  'de-DE': 'Germany',
  'fr-FR': 'France',
  'tr-TR': 'Turkey',
  'ja-JP': 'Japan',
  'zh-CN': 'China',
  'zh-TW': 'Taiwan',
  'ko-KR': 'South Korea',
  'es-ES': 'Spain',
  'it-IT': 'Italy',
  'nl-NL': 'Netherlands',
  'sv-SE': 'Sweden', 'no-NO': 'Norway',
  'da-DK': 'Denmark',
  'fi-FI': 'Finland',
  'ru-RU': 'Russia',
  'ar-SA': 'Saudi Arabia',
  'pt-BR': 'Brazil',
  'pt-PT': 'Portugal',
  'el-GR': 'Greece',
  'pl-PL': 'Poland',
  'hu-HU': 'Hungary',
  'cs-CZ': 'Czech Republic',
  'ro-RO': 'Romania',
  'uk-UA': 'Ukraine',
  'vi-VN': 'Vietnam',
  'th-TH': 'Thailand',
  'id-ID': 'Indonesia',
  'ms-MY': 'Malaysia',
  'tl-PH': 'Philippines',
  'en-AU': 'Australia',
  'en-NZ': 'New Zealand',
  'es-AR': 'Argentina',
  'es-CO': 'Colombia',
  'es-PE': 'Peru',
  'es-CL': 'Chile',
  'de-AT': 'Austria',
  'fr-BE': 'Belgium',
  'en-IE': 'Ireland',
  'other': 'Other'
};

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
  const [profileFormData, setProfileFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    country: user?.country || '',
    telegramUsername: user?.telegram_username || '',
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
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
  const [featuredCoupons, setFeaturedCoupons] = useState<Coupon[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [couponsPerPage, setCouponsPerPage] = useState(18);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [indexOfFirstCoupon, setIndexOfFirstCoupon] = useState(0);
  const [indexOfLastCoupon, setIndexOfLastCoupon] = useState(couponsPerPage);
  const [detectedCountry, setDetectedCountry] = useState<string>('');
  const [clickedCountry, setClickedCountry] = useState<string>('');

  useEffect(() => {
    // Detect country based on browser language
    const browserLanguage = navigator.language || navigator.languages[0] || 'other';
    const country = languageToCountryMap[browserLanguage] || 'Other';
    setDetectedCountry(country);

    // Uygulama başlangıcında oturum kontrolü
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchCoupons();
    fetchMemberCount();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
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

  useEffect(() => {
    if (coupons.length > 0) {
      const memexCoupons = coupons.filter(coupon => coupon.approved && coupon.memex_payment);
      const otherCoupons = coupons.filter(coupon => coupon.approved && !coupon.memex_payment);
      setFeaturedCoupons([...memexCoupons, ...otherCoupons]);
    }
  }, [coupons]);

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
      const { data, error } = await supabase
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
    (coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()) || true) &&
    (selectedCategory === '' || coupon.category === selectedCategory) &&
    (selectedCountry === '' || coupon.country === selectedCountry) &&
    (clickedCountry === '' || coupon.country === clickedCountry)
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
          lastName: profileFormData.lastName,
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
        lastName: profileFormData.lastName,
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

  const scrollLeft = () => {
    if (isTransitioning) return;
    if (carouselRef.current && featuredCoupons.length > 0) {
      setIsTransitioning(true);
      carouselRef.current.scrollLeft -= carouselRef.current.offsetWidth / (isMobile ? 1: 3);
      setTimeout(() => {
        setIsTransitioning(false);
        if (carouselRef.current) {
          if (carouselRef.current.scrollLeft <= 0) {
            carouselRef.current.scrollLeft = carouselRef.current.scrollWidth - carouselRef.current.offsetWidth;
          }
        }
      }, 500);
    }
  };

  const scrollRight = () => {
    if (isTransitioning) return;
    if (carouselRef.current && featuredCoupons.length > 0) {
      setIsTransitioning(true);
      carouselRef.current.scrollLeft += carouselRef.current.offsetWidth / (isMobile ? 1 : 3);
      setTimeout(() => {
        setIsTransitioning(false);
        if (carouselRef.current) {
          if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth - carouselRef.current.offsetWidth) {
            carouselRef.current.scrollLeft = 0;
          }
        }
      }, 500);
    }
  };

  useEffect(() => {
    setIndexOfFirstCoupon((currentPage - 1) * couponsPerPage);
    setIndexOfLastCoupon(currentPage * couponsPerPage);
  }, [currentPage, couponsPerPage]);

  const currentCoupons = filteredCoupons.slice(indexOfFirstCoupon, indexOfLastCoupon);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredCoupons.length / couponsPerPage); i++) {
    pageNumbers.push(i);
  }

  const goToPreviousFeatured = () => {
    setCurrentFeaturedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : featuredCoupons.length - 1));
  };

  const goToNextFeatured = () => {
    setCurrentFeaturedIndex((prevIndex) => (prevIndex < featuredCoupons.length - 1 ? prevIndex + 1 : 0));
  };

  const getCouponColumns = () => {
    return 'grid-cols-1';
  };

  const handleCountryClick = (country: string) => {
    setClickedCountry(country);
  };

  return (
    <div className="min-h-screen bg-dark-primary py-8 text-dark-text">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex items-center justify-between mb-8">
          <div className="flex items-center">
            <img
              src="https://cdn.glitch.global/c0240ef5-b1d3-409c-a790-588d18d5cf32/memexlogo-Photoroom.png"
              alt="MemeX Logo"
              className="h-12 w-auto mr-4 cursor-pointer"
              onClick={navigateHome}
            />
            <span className="text-white font-bold text-lg">MemeX Coupon</span>
          </div>
          <div className="hidden md:flex items-center">
            <button
              onClick={() => {
                setActiveTab('home');
                setClickedCountry('');
              }}
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
                <Lock className="w-5 h-5 mr-1" />
                Login/Register
              </button>
            )}
            <button
              onClick={() => setActiveTab('brands')}
              className={`nav-button ${activeTab === 'brands' ? 'active' : ''} mr-2`}
            >
              <i className="w-5 h-5 mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mx-auto">
                  <path d="M17.25 6.75a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5h10.5zM21 12.75a.75.75 0 010 1.5H3a.75.75 0 010-1.5h18zM17.25 18.75a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5h10.5z" />
                </svg>
              </i>
              Brands
            </button>
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
                className="nav-button"
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
              className="search-input mb-4 banner-width"
            />
            <img
              src="https://cdn.glitch.global/c0240ef5-b1d3-409c-a790-588d18d5cf32/memex-banner-3.jpg"
              alt="Discount Banner"
              className={`coupon-banner mb-4 ${bannerLoaded ? 'loaded' : 'loading'}`}
              onLoad={handleBannerLoad}
            />

            {/* Category and Country Selectors */}
            <div className="flex justify-between mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input w-1/2 mr-2"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="form-input w-1/2"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Detected Country Display */}
            {detectedCountry && (
              <div className="mb-4">
                <p className="text-white">Detected Country: {detectedCountry}</p>
              </div>
            )}

            <div className={`grid ${getCouponColumns()} gap-6`}>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : currentCoupons.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No approved coupons match your search</p>
              ) : (
                currentCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            <nav className="pagination">
              <ul className="pagination-list">
                {pageNumbers.map(number => (
                  <li key={number} className="pagination-item">
                    <button onClick={() => paginate(number)} className={`pagination-link ${number === 1 ? 'active' : ''}`}>
                      {number}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
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
        {activeTab === 'brands' && (
          <Brands />
        )}

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
            memberCount={memberCount}
          />
        )}

        {activeTab === 'profile' && user && (
          <Profile
                        user={user}
            userCoupon={userCoupons}
            showEditProfile={showEditProfile}
            profileFormData={profileFormData}
            countries={countries}
            handleProfileEdit={handleProfileFormChange}
            handleProfileUpdate={handleProfileUpdate}
            setShowEditProfile={setShowEditProfile}
            showAddCoupon={showAddCoupon}
            formData={formData}
            categories={categories}
            countriesList={countries}
            editingId={editingId}
            handleSubmit={handleSubmit}
            handleEdite={handleEdit}
            handleInputChange={handleInputChange}
            handleSave={handleCancel}
            setImagePreview={setImagePreview}            imagePreview={imagePreview}
            setShowAddCoupon={setShowAddCoupon}
            startEditing={startEditing}
            handleDelete={handleDelete}
          />
        )}
        {activeTab === 'privacyPolicy' && (
          <div className="privacy-policy-container">
            <h2 className="privacy-policy-title">Privacy Policy</h2>
            <p>
              This Privacy Policy describes how MemeX Coupon collects, uses, and shares information about you when you use our app.
            </p>
            <h3>Information We Collect</h3>
            <p>
              We collect informationin the following ways:
            </p>
            <ul>
              <li>
                <strong>Information you provide directly:</strong> When you register, we collect your username, email address, and any additional information you provide in your profile.
              </li>
              <li>
                <strong>Automatically collected information:</strong> We automatically collect certain information about your use of the app, including your IP address, device type, and usage data.
              </li>
            </ul>
            <h3>How We Use Your Information</h3>
            <p>
              We use your information to:
            </p>
            <ul>
              <li>
                <strong>Provide and improve the app.</strong>
              </li>
              <li>
                Personalize your experience.
              </li>
              <li>
                Communicate with you about updates and offers.
              </li>
            </ul>
            <h3>Sharing Your Information</h3>
            <p>
              We may share your information with:
            </p>
            <ul>
              <li>
                Service providers who help us operate the app.
              </li>
              <li>
                Legal authorities when required by law.
              </li>
            </ul>
            <h3>Your Rights</h3>
            <p>
              You have the right to access, correct, or delete your information. You can do this by contacting us at [insert contact email].
            </p>
            <h3>Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on our app.
            </p>
          </div>
        )}

        {activeTab === 'termsOfService' && (
          <div className="terms-of-service-container">
            <h2 className="terms-of-service-title">Terms of Service</h2>
            <p>
              Welcome to MemeX Coupon! These Terms of Service govern your use of our app.
            </p>
            <h3>Acceptance of Terms</h3>
            <p>
              By using MemeXCoupon, you agree to these Terms of Service. If you do not agree, please do not use the app.
            </p>
            <h3>Use of the App</h3>
            <p>
              You agree to use MemeX Coupon only for lawful purposes and in a way that does not infringe the rights of others.
            </p>
            <h3>Couponss and Offers</h3>
            <p>
              MemeX Coupon provides coupons and offers from various merchants. We are not responsible for the availability, accuracy, or quality of these coupons and offers.
            </p>
            <h3>User Accounts</h3>
            <p>
              If you create an account, you are responsible for maintaining the confidentiality of your account and password.
            </p>
            <h3>Intellectual Property</h3>
            <p>
              The content and trademarks on MemeX Coupon are owned by us or our licensors. You may not use our content without our permission.
            </p>
            <h3>Disclaimer of Warranty</h3>
            <p>
              MemeX Coupon is provided "as is" without any warranties. We are not responsible
 for any damages arising from your use of the app.
            </p>
            <h3>Limitation of Liability</h3>
            <p>
              In no event shall MemeX Coupon be liable for any indirect, incidental, or consequential damages.
            </p>
            <h3>Changes to These Terms</h3>
            <p>
              We may update these Terms of Service from time to time. We will notify you of any changes by posting the new policy on our app.
            </p>
          </div>
        )}
      </div>
      <footer className="bg-dark-secondary text-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <p>&copy; {new Date().getFullYear()} MemeX. All rights reserved.</p>
          <div className="flex space-x-4">
            <a
              href="#"
              className="hover:text-brand-yellow"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('termsOfService');
              }}
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="hover:text-brand-yellow"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('privacyPolicy');
              }}
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
      {/* Mobile Menu */}
      <div className="mobile-menu md:hidden fixed bottom-0 left-0 w-full bg-dark-secondary py-2 z-50">
        <div className="flex justify-around items-center">
          <button
            onClick={() => {
              setActiveTab('home');
              setClickedCountry('');
            }}
            className={`mobile-nav-button ${activeTab === 'home' ? 'active' : ''}`}
          >
            <Home className="w-5 h-5 mx-auto" />
            <span className="text-xs">Home</span>
          </button>
          {user ? (
            <button
              onClick={() => setActiveTab('profile')}
              className={`mobile-nav-button ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User className="w-5 h-5 mx-auto" />
              <span className="text-xs">Profile</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('loginRegister')}
              className={`mobile-nav-button ${activeTab === 'loginRegister' ? 'active' : ''}`}
            >
              <Lock className="w-5 h-5 mx-auto" />
              <span className="text-xs">Login/Register</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('brands')}
            className={`mobile-nav-button ${activeTab === 'brands' ? 'active' : ''}`}
          >
            <i className="w-5 h-5 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.25 6.75a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5h10.5zM21 12.75a.75.75 0 010 1.5H3a.75.75 0 010-1.5h18zM17.25 18.75a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5h10.5z" />
              </svg>
            </i>
            <span className="text-xs">Brands</span>
          </button>
          {isAdmin ? (
            <button
              onClick={navigateToAdmin}
              className={`mobile-nav-button ${activeTab === 'admin' ? 'active' : ''}`}
            >
              <Settings className="w-5 h-5 mx-auto" />
              <span className="text-xs">Admin</span>
            </button>
          ) : (
            <button
              className="mobile-nav-button"
              onClick={navigateToAdminLogin}
            >
              <Lock className="w-4 h-4 mx-auto" />
              <span className="text-xs">Admin</span>
            </button>
          )}
          {user && (
            <button
              className="mobile-nav-button"
              onClick={handleSignOut}
            >
              <X className="w-5 h-5 mx-auto" />
              <span className="text-xs">Logout</span>
            </button>
          )}
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;
