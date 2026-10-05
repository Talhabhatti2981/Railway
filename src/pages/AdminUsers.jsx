import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { Shield, Users } from 'lucide-react';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [me, setMe] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const current = await userAPI.getMe();
      setMe(current);
      if (current.role !== 'admin') {
        navigate('/');
        return;
      }
      const list = await userAPI.getAll();
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [navigate]);

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-600 text-white">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users table</h1>
            <p className="text-sm text-gray-600">
              Saved in browser storage (free — no serverless / DB billing). Admin:{' '}
              {me?.email}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Loading users…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No users yet. Register from Login page.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-gray-700">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {u.role === 'admin' && <Shield className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {u.role === 'admin' ? 'Built-in account' : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Only one admin: <strong>admin@admin</strong> / password <strong>admin</strong> (name Admin).
          All registrations are normal users.
        </p>
      </div>
    </div>
  );
};

export default AdminUsers;
