import React from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AdminPanelProps {
  coupons: any[];
  loading: boolean;
  editingId: string | null;
  formData: any;
  toggleApprove: (id: string, currentApprovalStatus: boolean) => Promise<void>;
  startEditing: (coupon: any) => void;
  handleDelete: (id: string) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  handleSave: (e: React.FormEvent, id: string) => void;
  handleCancel: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  coupons,
  loading,
  editingId,
  formData,
  toggleApprove,
  startEditing,
  handleDelete,
  handleInputChange,
  handleSave,
  handleCancel,
}) => {
  return (
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
                  {editingId === coupon.id ? (
                    <>
                      <td className="admin-table-cell">
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange(e, coupon.id)}
                          className="admin-input"
                        />
                      </td>
                      <td className="admin-table-cell">
                        <input
                          type="text"
                          name="code"
                          value={formData.code}
                          onChange={(e) => handleInputChange(e, coupon.id)}
                          className="admin-input"
                        />
                      </td>
                      <td className="admin-table-cell">
                        <input
                          type="number"
                          name="discount"
                          value={formData.discount}
                          onChange={(e) => handleInputChange(e, coupon.id)}
                          className="admin-input"
                        />
                      </td>
                      <td className="admin-table-cell">
                        <input
                          type="text"
                          name="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange(e, coupon.id)}
                          className="admin-input"
                        />
                      </td>
                      <td className="admin-table-cell">
                        <input
                          type="url"
                          name="image_url"
                          value={formData.image_url}
                          onChange={(e) => handleInputChange(e, coupon.id)}
                          className="admin-input"
                        />
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
                          onClick={(e) => handleSave(e, coupon.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
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
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
