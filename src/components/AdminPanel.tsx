import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PieController,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { supabase } from '../lib/supabase';
import AdminSummary from './AdminPanel/AdminSummary';
import CouponFilters from './AdminPanel/CouponFilters';
import CouponTable from './AdminPanel/CouponTable';
import MemberFilters from './AdminPanel/MemberFilters';
import MemberTable from './AdminPanel/MemberTable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PieController,
  ArcElement
);

interface AdminPanelProps {
  coupons: any[];
  loading: boolean;
  editingId: string | null;
  formData: any;
  toggleApprove: (id: string, currentApprovalStatus: boolean) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  handleSave: (e: React.FormEvent, id: string) => void;
  handleCancel: () => void;
  memberCount: number;
  startEditing: (coupon: any) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  coupons,
  loading,
  editingId,
  formData,
  toggleApprove,
  handleDelete,
  handleInputChange,
  handleSave,
  handleCancel,
  memberCount,
  startEditing,
}) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState<any>({});
  const [countryData, setCountryData] = useState<any>({});
  const [dailyCouponData, setDailyCouponData] = useState<any>({});

  // Coupon filter states
  const [couponTitleFilter, setCouponTitleFilter] = useState('');
  const [couponCodeFilter, setCouponCodeFilter] = useState('');
  const [couponDiscountFilter, setCouponDiscountFilter] = useState('');
  const [couponDescriptionFilter, setCouponDescriptionFilter] = useState('');

  // User filter states
  const [userFirstNameFilter, setUserFirstNameFilter] = useState('');
  const [userLastNameFilter, setUserLastNameFilter] = useState('');
  const [userTelegramUsernameFilter, setUserTelegramUsernameFilter] = useState('');
  const [userCountryFilter, setUserCountryFilter] = useState('');

  // Brand Autocomplete State
  const [brandFilter, setBrandFilter] = useState('');
  const [availableBrands, setAvailableBrands] = useState<string[]>([ ]);

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const { data, error } = await supabase.from('custom_users').select('*');
        if (error) {
          throw error;
        }
        setUsers(data || []);
      } catch (error: any) {
        toast.error(`Failed to fetch users: ${error.message}`);
      } finally {
        setUsersLoading(false);
      }
    };

    if (activeMenu === 'members') {
      fetchUsers();
    }
  }, [activeMenu]);

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_users')
          .select('country');

        if (error) {
          throw error;
        }

        const countryCounts = data.reduce((acc: { [key: string]: number }, user) => {
          const country = user.country || 'Unknown';
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {});

        setCountryData({
          labels: Object.keys(countryCounts),
          datasets: [
            {
              label: 'Number of Users',
              data: Object.values(countryCounts),
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)',
              ],
            },
          ],
        });
      } catch (error: any) {
        toast.error(`Failed to fetch country data: ${error.message}`);
      }
    };

    const fetchDailyCouponData = async () => {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('created_at');

        if (error) {
          throw error;
        }

        const dailyCounts = data.reduce((acc: { [key: string]: number }, coupon) => {
          const date = coupon.created_at.substring(0, 10); // Extract date part
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        setDailyCouponData({
          labels: Object.keys(dailyCounts),
          datasets: [
            {
              label: 'Number of Coupons Created',
              data: Object.values(dailyCounts),
              backgroundColor: 'rgba(75, 192, 192, 0.8)',
            },
          ],
        });
      } catch (error: any) {
        toast.error(`Failed to fetch daily coupon data: ${error.message}`);
      }
    };

    // Fetch available brands
    const fetchAvailableBrands = async () => {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('brand')
          .not('brand', 'is', null)
          .neq('brand', ''); // Ensure brands are not empty strings

        if (error) {
          throw error;
        }

        // Extract brands and remove duplicates
        const brands = [...new Set(data.map(coupon => coupon.brand))];
        setAvailableBrands(brands);
      } catch (error: any) {
        toast.error(`Failed to fetch brands: ${error.message}`);
      }
    };

    if (activeMenu === 'dashboard') {
      fetchCountryData();
      fetchDailyCouponData();
    }

    if (activeMenu === 'coupons') {
      fetchAvailableBrands();
    }
  }, [activeMenu]);

  // Prepare data for the coupon distribution chart
  const couponCategoryCounts = coupons.reduce((acc: { [key: string]: number }, coupon) => {
    const category = coupon.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(couponCategoryCounts),
    datasets: [
      {
        label: 'Number of Coupons',
        data: Object.values(couponCategoryCounts),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white', // Set legend text color to white
        },
      },
      title: {
        display: true,
        text: 'Coupon Distribution by Category',
        color: 'white', // Set title text color to white
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white', // Set x-axis tick color to white
        },
      },
      y: {
        ticks: {
          color: 'white', // Set y-axis tick color to white
        },
      },
    },
  };

  const countryChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
        },
      },
      title: {
        display: true,
        text: 'User Distribution by Country',
        color: 'white',
      },
    },
  };

  const dailyCouponChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
        },
      },
      title: {
        display: true,
        text: 'Daily Coupon Creation',
        color: 'white',
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
        },
      },
      y: {
        ticks: {
          color: 'white',
        },
      },
    },
  };

  const handleSaveWrapper = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    handleSave(e, id);
  };

  const handleStartUserEditing = (user: any) => {
    setEditingUserId(user.id);
    setUserFormData({ ...user });
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, id: string) => {
    setUserFormData({
      ...userFormData,
      [id]: e.target.value,
    });
  };

  const handleUpdateUser = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('custom_users')
        .update(userFormData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      setUsers(users.map(user => (user.id === id ? { ...user, ...userFormData } : user)));
      setEditingUserId(null);
      toast.success('User updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update user: ${error.message}`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const { error } = await supabase.from('custom_users').delete().eq('id', id);
      if (error) {
        throw error;
      }

      setUsers(users.filter(user => user.id !== id));
      toast.success('User deleted successfully!');
    } catch (error: any) {
      toast.error(`Failed to delete user: ${error.message}`);
    }
  };

  const handleCancelUserEdit = () => {
    setEditingUserId(null);
    setUserFormData({});
  };

  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(userFirstNameFilter.toLowerCase()) &&
    user.last_name?.toLowerCase().includes(userLastNameFilter.toLowerCase()) &&
    user.telegram_username?.toLowerCase().includes(userTelegramUsernameFilter.toLowerCase()) &&
    user.country?.toLowerCase().includes(userCountryFilter.toLowerCase())
  );

  const filteredCoupons = coupons.filter(coupon =>
    coupon.title?.toLowerCase().includes(couponTitleFilter.toLowerCase()) &&
    coupon.code?.toLowerCase().includes(couponCodeFilter.toLowerCase()) &&
    (coupon.discount === null || coupon.discount.toString().includes(couponDiscountFilter.toLowerCase())) &&
    coupon.description?.toLowerCase().includes(couponDescriptionFilter.toLowerCase()) &&
    (brandFilter === '' || coupon.brand?.toLowerCase().includes(brandFilter.toLowerCase()))
  );

  const handleCouponTitleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponTitleFilter(e.target.value);
  };

  const handleCouponCodeFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCodeFilter(e.target.value);
  };

  const handleCouponDiscountFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponDiscountFilter(e.target.value);
  };

  const handleCouponDescriptionFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponDescriptionFilter(e.target.value);
  };

  const handleBrandFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrandFilter(e.target.value);
  };

  const handleUserFirstNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserFirstNameFilter(e.target.value);
  };

  const handleUserLastNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserLastNameFilter(e.target.value);
  };

  const handleUserTelegramUsernameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserTelegramUsernameFilter(e.target.value);
  };

  const handleUserCountryFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserCountryFilter(e.target.value);
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-panel-title">Admin Dashboard</h2>

      <div className="admin-menu flex flex-wrap gap-2 mb-4">
        <button
          className={`nav-button ${activeMenu === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveMenu('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-button ${activeMenu === 'coupons' ? 'active' : ''}`}
          onClick={() => setActiveMenu('coupons')}
        >
          Coupons
        </button>
        <button
          className={`nav-button ${activeMenu === 'members' ? 'active' : ''}`}
          onClick={() => setActiveMenu('members')}
        >
          Members
        </button>
      </div>

      {activeMenu === 'dashboard' && (
        <>
          <AdminSummary coupons={coupons} memberCount={memberCount} />

          <div className="admin-chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="flex">
            <div className="admin-chart-container w-1/2">
              {countryData.labels && countryData.datasets ? (
                <Pie data={countryData} options={countryChartOptions} />
              ) : (
                <p>Loading country data...</p>
              )}
            </div>

            <div className="admin-chart-container w-1/2">
              {dailyCouponData.labels && dailyCouponData.datasets ? (
                <Bar data={dailyCouponData} options={dailyCouponChartOptions} />
              ) : (
                <p>Loading daily coupon data...</p>
              )}
            </div>
          </div>
        </>
      )}

      {activeMenu === 'coupons' && (
        <div className="overflow-x-auto">
          <h3>Your Coupons</h3>
          <button className="add-coupon-button green-button">Add Coupon</button>
          <table className="admin-table">
            <thead className="admin-table-header">
              <tr>
                <CouponFilters
                  couponTitleFilter={couponTitleFilter}
                  couponCodeFilter={couponCodeFilter}
                  couponDiscountFilter={couponDiscountFilter}
                  couponDescriptionFilter={couponDescriptionFilter}
                  brandFilter={brandFilter}
                  availableBrands={availableBrands}
                  handleCouponTitleFilterChange={handleCouponTitleFilterChange}
                  handleCouponCodeFilterChange={handleCouponCodeFilterChange}
                  handleCouponDiscountFilterChange={handleCouponDiscountFilterChange}
                  handleCouponDescriptionFilterChange={handleCouponDescriptionFilterChange}
                  handleBrandFilterChange={handleBrandFilterChange}
                />
                <th className="admin-table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <CouponTable
              coupons={coupons}
              loading={loading}
              toggleApprove={toggleApprove}
              startEditing={startEditing}
              handleDelete={handleDelete}
              filteredCoupons={filteredCoupons}
            />
          </table>
        </div>
      )}

      {activeMenu === 'members' && (
        <div className="overflow-x-auto">
          <h3>Members Content</h3>
          <table className="admin-table">
            <thead className="admin-table-header">
              <tr>
                <MemberFilters
                  userFirstNameFilter={userFirstNameFilter}
                  userLastNameFilter={userLastNameFilter}
                  userTelegramUsernameFilter={userTelegramUsernameFilter}
                  userCountryFilter={userCountryFilter}
                  setUserFirstNameFilter={handleUserFirstNameFilterChange}
                  setUserLastNameFilter={handleUserLastNameFilterChange}
                  setUserTelegramUsernameFilter={handleUserTelegramUsernameFilter}
                  setUserCountryFilter={handleUserCountryFilterChange}
                />
                <th className="admin-table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <MemberTable
              users={users}
              usersLoading={usersLoading}
              editingUserId={editingUserId}
              userFormData={userFormData}
              handleUserInputChange={handleUserInputChange}
              handleUpdateUser={handleUpdateUser}
              handleCancelUserEdit={handleCancelUserEdit}
              handleStartUserEditing={handleStartUserEditing}
              handleDeleteUser={handleDeleteUser}
              filteredUsers={filteredUsers}
            />
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
