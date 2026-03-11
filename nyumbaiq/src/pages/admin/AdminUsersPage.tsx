import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Shell } from '../../components/layout/Shell';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Profile } from '../../store/authStore';
import type { UserRole } from '../../store/authStore';
import { Users, Shield } from 'lucide-react';



export function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers((data ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (userId: string, newRole: UserRole) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
  };

  const toggleActive = async (userId: string, active: boolean) => {
    await supabase.from('profiles').update({ is_active: active }).eq('id', userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: active } : u));
  };

  return (
    <Shell title="User Management" role="admin">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray">{users.length} user{users.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="card p-6 text-center text-gray">Loading...</div>
      ) : users.length === 0 ? (
        <EmptyState icon={<Users size={40} />} title="No users" description="Users will appear here once they register." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-gray">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-bg/50">
                  <td className="py-2.5 pr-4 font-medium">{u.full_name ?? '—'}</td>
                  <td className="py-2.5 pr-4">{u.email ?? '—'}</td>
                  <td className="py-2.5 pr-4">{u.phone ?? '—'}</td>
                  <td className="py-2.5 pr-4">
                    <select
                      className="input py-1 px-2 text-xs"
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                    >
                      {(['admin', 'landlord', 'agent', 'tenant'] as const).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge tone={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="py-2.5 pr-4">
                    <button
                      className="text-xs text-blue hover:underline flex items-center gap-1"
                      onClick={() => toggleActive(u.id, !u.is_active)}
                    >
                      <Shield size={12} />
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}
