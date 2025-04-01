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
  approved?: boolean;
}

function App() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    discount: 0,
    description: '',
    image_url: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [discountSearchTerm, setDiscountSearchTerm] = useState('');

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
          image_url: formData.image_url
        }]);

      if (error) {
        console.error("Error during insert:", error);
        toast.error(`Failed to add coupon: ${error.message}`);
        return;
      }
      
      toast.success('Coupon added successfully');
      setFormData({ title: '', code: '', discount: 0, description: '', image_url: '' });
      fetchCoupons();
    } catch (error) {
      console.error("Error during insert:", error);
      toast.error('Failed to add coupon');
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({
          title: formData.title,
          code: formData.code,
          discount: formData.discount,
          description: formData.description,
          image_url: formData.image_url
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
      image_url: coupon.image_url || ''
    });
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
    <div className="bg-gradient-to-r from-purple-400 to-blue-500 rounded-xl shadow-md overflow-hidden relative hover:shadow-lg transition-shadow duration-300">
      <div className="absolute top-2 right-2 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg rounded-md text-sm px-2 py-1">
        {coupon.approved ? 'Approved' : 'Pending'}
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-white mb-2">{coupon.title}</h3>
        <p className="text-gray-100 mb-4">{coupon.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-white font-semibold">Code:</span>
            <code className="text-yellow-200">{coupon.code}</code>
          </div>
          <div className="text-right">
            <span className="text-white font-semibold">Discount:</span>
            <span className="text-2xl text-green-200 hover:text-green-300 transition-colors duration-200">{coupon.discount}%</span>
          </div>
        </div>
      </div>
      {coupon.image_url && (
        <img
          src={coupon.image_url}
          alt="Coupon"
          className="w-full h-48 object-cover"
        />
      )}
    </div>
  );

  const filteredCoupons = coupons.filter(coupon =>
    coupon.approved &&
    coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()) || true) &&
    (discountSearchTerm === '' || coupon.discount.toString().includes(discountSearchTerm))
  );

  const navigateToAdminLogin = () => {
    setActiveTab('adminLogin');
  };

  return (
    
    <div className="min-h-screen bg-dark-primary py-8 text-dark-text">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center hover:text-blue-500 ${activeTab === 'home' ? 'text-blue-500' : 'text-gray-700'}`}
            >
              <Home className="w-5 h-5 mr-1" />
              Home
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center hover:text-blue-500 ${activeTab === 'profile' ? 'text-blue-500' : 'text-gray-700'}`}
            >
              <User className="w-5 h-5 mr-1" />
              Profile
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center hover:text-blue-500 ${activeTab === 'admin' ? 'text-blue-500' : 'text-gray-700'}`}
              >
                <Settings className="w-5 h-5 mr-1" />
                Admin
              </button>
            )}
          </div>
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
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              onClick={navigateToAdminLogin}
            >
              <Lock className="w-4 h-4 mr-2" />
              Admin Login
            </button>
          )}
        </nav>

        {activeTab === 'adminLogin' && (
          <div className="bg-dark-secondary rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-dark-text mb-4">Admin Login</h2>
            <input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="px-4 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white w-full mb-4"
            />
            <button
              onClick={handleAdminLogin}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Login
            </button>
          </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div className="bg-dark-secondary rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-dark-text mb-4">Admin Panel</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-md p-4">
                <h3 className="text-lg font-medium text-gray-300">Total Coupons</h3>
                <p className="text-2xl font-bold text-white">{coupons.length}</p>
              </div>
              <div className="bg-gray-800 rounded-md p-4">
                <h3 className="text-lg font-medium text-gray-300">Approved Coupons</h3>
                <p className="text-2xl font-bold text-white">{coupons.filter(c => c.approved).length}</p>
              </div>
              <div className="bg-gray-800 rounded-md p-4">
                <h3 className="text-lg font-medium text-gray-300">Pending Coupons</h3>
                <p className="text-2xl font-bold text-white">{coupons.filter(c => !c.approved).length}</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div className="bg-dark-secondary rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-dark-text mb-4">
              {editingId ? 'Edit Coupon' : 'Add New Coupon'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="px-4 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="px-4 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Discount"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                  className="px-4 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                  required
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="px-4 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                />
              </div>
              <div className="grid grid-cols-1">
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="px-4 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Image Preview" className="mt-2 max-h-40" />
                )}
              </div>
              {editingId ? (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(editingId)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ title: '', code: '', discount: 0, description: '', image_url: '' });
                      setImagePreview(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
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
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search coupons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white w-full"
              />
            </div>
            <div className="mb-4">
              <input
                type="number"
                placeholder="Search by discount..."
                value={discountSearchTerm}
                onChange={(e) => setDiscountSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white w-full"
              />
            </div>
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
          <div className="bg-dark-secondary rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Discount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Approval</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-dark-secondary divide-y divide-gray-700">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-white">{coupon.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">{coupon.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">{coupon.discount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">{coupon.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {coupon.image_url && (
                            <img src={coupon.image_url} alt="Coupon" className="h-10 w-10 rounded-full" />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleApprove(coupon.id, !!coupon.approved)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${coupon.approved ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                          >
                            {coupon.approved ? 'Approved' : 'Approve'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
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
      <Toaster position="top-right" />
    </div>
  
  );
}

export default App;
