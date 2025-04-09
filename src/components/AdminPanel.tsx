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
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

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
          <div className="admin-summary-grid">
            <div className="admin-summary-card">
              <h3 className="admin-summary-title">Total Coupons</h3>
              <p className="admin-summary-value">{coupons.length}</p>
            </div>
            <div className="admin-summary-card">
              <h3 className="admin-summary-title">Total Members</h3>
              <p className="admin-summary-value">{memberCount}</p>
            </div>
            <div className="admin-summary-card">
              <h3 className="admin-summary-title">Approved Coupons</h3>
              <p className="admin-summary-value">{coupons.filter(coupon => coupon.approved).length}</p>
            </div>
          </div>

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
          <h3>Coupons Content</h3>
          <table className="admin-table">
            <thead className="admin-table-header">
              <tr>
                <th className="admin-table-header-cell">
                  Title
                  <input
                    type="text"
                    placeholder="Filter Title"
                    value={couponTitleFilter}
                    onChange={handleCouponTitleFilterChange}
                    className="admin-input"
                  />
                </th>
                <th className="admin-table-header-cell">
                  Code
                  <input
                    type="text"
                    placeholder="Filter Code"
                    value={couponCodeFilter}
                    onChange={(e) => setCouponCodeFilter(e.target.value)}
                    className="admin-input"
                  />
                </th>
                <th className="admin-table-header-cell">
                  Discount
                  <input
                    type="text"
                    placeholder="Filter Discount"
                    value={couponDiscountFilter}
                    onChange={(e) => setCouponDiscountFilter(e.target.value)}
                    className="admin-input"
                  />
                </th>
                <th className="admin-table-header-cell">
                  Description
                  <input
                    type="text"
                    placeholder="Filter Description"
                    value={couponDescriptionFilter}
                    onChange={handleCouponDescriptionFilterChange}
                    className="admin-input"
                  />
                </th>
                 <th className="admin-table-header-cell">
                  Brand
                  <input
                    type="text"
                    placeholder="Filter Brand"
                    value={brandFilter}
                    onChange={handleBrandFilterChange}
                    className="admin-input"
                    list="brandOptions"
                  />
                  <datalist id="brandOptions">
                    {availableBrands.map((brand, index) => (
                      <option key={index} value={brand} />
                    ))}
                  </datalist>
                </th>
                <th className="admin-table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="admin-table-body">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 inline-block" />
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="admin-table-row">
                    <td className="admin-table-cell">{coupon.title}</td>
                    <td className="admin-table-cell">{coupon.code}</td>
                    <td className="admin-table-cell">{coupon.discount}</td>
                    <td className="admin-table-cell">{coupon.description}</td>
                     <td className="admin-table-cell">{coupon.brand}</td>
                    <td className="admin-table-cell admin-table-actions">
                      <button
                        onClick={() => toggleApprove(coupon.id, coupon.approved)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        {coupon.approved ? 'Unapprove' : 'Approve'}
                      </button>
                      <button
                        onClick={() => startEditing(coupon)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeMenu === 'members' && (
        <div className="overflow-x-auto">
          <h3>Members Content</h3>
          <table className="admin-table">
            <thead className="admin-table-header">
              <tr>
                <th className="admin-table-header-cell">
                  First Name
                  <input
                    type="text"
                    placeholder="Filter First Name"
                    value={userFirstNameFilter}
                    onChange={(e) => setUserFirstNameFilter(e.target.value)}
                    className="admin-input"
                  />
                </th>
                <th className="admin-table-header-cell">
                  Last Name
                  <input
                    type="text"
                    placeholder="Filter Last Name"
                    value={userLastNameFilter}
                    onChange={(e) => setUserLastNameFilter(e.target.value)}
                    className="admin-input"
                  />
                </th>
                <th className="admin-table-header-cell">
                  Telegram Username
                  <input
                    type="text"
                    placeholder="Filter Telegram Username"
                    value={userTelegramUsernameFilter}
                    onChange={(e) => setUserTelegramUsernameFilter(e.target.value)}
                    className="admin-input"
                  />
                </th>
                <th className="admin-table-header-cell">
                  Country
                  <input
                    type="text"
                    placeholder="Filter Country"
                    value={userCountryFilter}
                    onChange={(e) => setUserCountryFilter(e.target.value)}
                    className="admin-input"
                  />
                </th>
                <th className="admin-table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="admin-table-body">
              {usersLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 inline-block" />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="admin-table-row">
                    {editingUserId === user.id ? (
                      <>
                        <td className="admin-table-cell">
                          <input
                            type="text"
                            name="first_name"
                            value={userFormData.first_name}
                            onChange={(e) => handleUserInputChange(e, 'first_name')}
                            className="admin-input"
                          />
                        </td>
                        <td className="admin-table-cell">
                          <input
                            type="text"
                            name="last_name"
                            value={userFormData.last_name}
                            onChange={(e) => handleUserInputChange(e, 'last_name')}
                            className="admin-input"
                          />
                        </td>
                        <td className="admin-table-cell">
                          <input
                            type="text"
                            name="telegram_username"
                            value={userFormData.telegram_username}
                            onChange={(e) => handleUserInputChange(e, 'telegram_username')}
                            className="admin-input"
                          />
                        </td>
                        <td className="admin-table-cell">
                          <input
                            type="text"
                            name="country"
                            value={userFormData.country}
                            onChange={(e) => handleUserInputChange(e, 'country')}
                            className="admin-input"
                          />
                        </td>
                        <td className="admin-table-cell admin-table-actions">
                          <button
                            onClick={(e) => handleUpdateUser(e, user.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelUserEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="admin-table-cell">{user.first_name}</td>
                        <td className="admin-table-cell">{user.last_name}</td>
                        <td className="admin-table-cell">
                          <a
                            href={`https://t.me/${user.telegram_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {user.telegram_username}
                          </a>
                        </td>
                        <td className="admin-table-cell">{user.country}</td>
                        <td className="admin-table-cell admin-table-actions">
                          <button
                            onClick={() => handleStartUserEditing(user)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
