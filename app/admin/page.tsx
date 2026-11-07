'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  UserPlus,
  Users,
  KeyRound,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Lock,
  Edit2,
  AlertTriangle,
  X,
  Search,
  ExternalLink,
  FolderPlus,
  Eye,
  Clock,
  Activity,
  Layers,
} from 'lucide-react';

interface UserItem {
  id: string;
  username: string;
  role: 'admin' | 'user';
  allowedRooms: string[];
  createdRooms?: string[];
  accessedRooms?: string[];
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [activityModalUser, setActivityModalUser] = useState<UserItem | null>(null);

  // Add user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [newAccessType, setNewAccessType] = useState<'all' | 'custom'>('all');
  const [newCustomRooms, setNewCustomRooms] = useState('');

  // Edit user form
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editStatus, setEditStatus] = useState<'active' | 'disabled'>('active');
  const [editAccessType, setEditAccessType] = useState<'all' | 'custom'>('all');
  const [editCustomRooms, setEditCustomRooms] = useState('');

  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Check auth and fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.authenticated || meData.user?.role !== 'admin') {
        router.push('/login?from=/admin');
        return;
      }
      setCurrentUser(meData.user);

      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      if (usersData.success && usersData.users) {
        setUsers(usersData.users);
      } else {
        showFeedback(usersData.error || 'Failed to load users', 'error');
      }
    } catch (e) {
      showFeedback('Network error loading admin panel', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      showFeedback('Username and password are required', 'error');
      return;
    }

    const rooms = newAccessType === 'all' ? ['*'] : newCustomRooms.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword.trim(),
          role: newRole,
          allowedRooms: rooms,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showFeedback(`User '${newUsername}' created successfully!`, 'success');
        setShowAddModal(false);
        setNewUsername('');
        setNewPassword('');
        setNewCustomRooms('');
        fetchUsers();
      } else {
        showFeedback(data.error || 'Failed to create user', 'error');
      }
    } catch {
      showFeedback('Error submitting new user', 'error');
    }
  };

  const handleOpenEdit = (user: UserItem) => {
    setSelectedUser(user);
    setEditPassword('');
    setEditRole(user.role);
    setEditStatus(user.status);
    const isAll = user.allowedRooms.includes('*');
    setEditAccessType(isAll ? 'all' : 'custom');
    setEditCustomRooms(isAll ? '' : user.allowedRooms.join(', '));
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const rooms = editAccessType === 'all' ? ['*'] : editCustomRooms.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: editPassword.trim() || undefined,
          role: editRole,
          status: editStatus,
          allowedRooms: rooms,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showFeedback(`User '${selectedUser.username}' updated successfully!`, 'success');
        setShowEditModal(false);
        fetchUsers();
      } else {
        showFeedback(data.error || 'Failed to update user', 'error');
      }
    } catch {
      showFeedback('Error saving user updates', 'error');
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Are you sure you want to delete user '${username}'? They will be immediately locked out.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${username}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`User '${username}' deleted.`, 'success');
        fetchUsers();
      } else {
        showFeedback(data.error || 'Failed to delete user', 'error');
      }
    } catch {
      showFeedback('Error deleting user', 'error');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute aggregated stats
  const totalCreatedRooms = Array.from(new Set(users.flatMap((u) => u.createdRooms || []))).length;
  const totalAccessedRooms = Array.from(new Set(users.flatMap((u) => u.accessedRooms || []))).length;

  return (
    <div className="min-h-screen w-full bg-[#090a0f] text-zinc-100 font-sans selection:bg-[#ff5a1f]/30 selection:text-[#ff5a1f]">
      {/* Top Header Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ff5a1f]/10 border border-[#ff5a1f]/30 flex items-center justify-center text-[#ff5a1f]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Access Control & User Registry
              </h1>
              <p className="text-[10px] font-mono text-zinc-500">
                Logged in as <span className="text-[#ff5a1f]">{currentUser?.username || 'admin'}</span> (Superadmin)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#ff5a1f] hover:bg-[#ff6d36] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-[#ff5a1f]/20 hover:scale-[1.02] cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Approve New User</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Feedback alert */}
        {feedbackMessage && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between animate-fade-in ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/50 border-red-500/40 text-red-300'
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button onClick={() => setFeedbackMessage(null)} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Approved Users</div>
            <div className="text-2xl font-black text-white">{users.length}</div>
            <div className="text-[11px] text-zinc-400 mt-1">Controlled User Allowlist</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Active Accounts</div>
            <div className="text-2xl font-black text-emerald-400">
              {users.filter((u) => u.status === 'active').length}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">Permitted system access</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Rooms Activity</div>
            <div className="text-2xl font-black text-cyan-400 flex items-baseline gap-2">
              <span>{totalCreatedRooms}</span>
              <span className="text-xs font-normal text-zinc-400">created /</span>
              <span>{totalAccessedRooms}</span>
              <span className="text-xs font-normal text-zinc-400">visited</span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">Tracked across all accounts</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Session Lifetime</div>
            <div className="text-base font-bold text-[#ff5a1f] mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#ff5a1f]" />
              <span>30 Days Persistent</span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">No relogin needed on active devices</div>
          </div>
        </div>

        {/* Search & List Card */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <span>Approved User Allowlist & Activity</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Users, their access permissions, and live tracking of rooms created and accessed.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#ff5a1f]/70"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase">
                  <th className="pb-3 pl-2">User</th>
                  <th className="pb-3">Role & Status</th>
                  <th className="pb-3">Allowed Scope</th>
                  <th className="pb-3">Rooms Created</th>
                  <th className="pb-3">Rooms Accessed</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                      Loading user registry from Redis...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isAllRooms = user.allowedRooms.includes('*');
                    const isSelf = currentUser?.username === user.username;
                    const created = user.createdRooms || [];
                    const accessed = user.accessedRooms || [];

                    return (
                      <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                        {/* User column */}
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-200 text-sm">{user.username}</span>
                            {isSelf && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                                You
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Role & Status */}
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                                user.role === 'admin'
                                  ? 'bg-[#ff5a1f]/15 text-[#ff5a1f] border border-[#ff5a1f]/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {user.role}
                            </span>
                            {user.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-400 text-[10px]">
                                <XCircle className="w-3 h-3" />
                                <span>Disabled</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Allowed Scope */}
                        <td className="py-3.5">
                          {isAllRooms ? (
                            <span className="text-emerald-400 text-[11px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                              All Rooms (*)
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                              {user.allowedRooms.map((room) => (
                                <span
                                  key={room}
                                  className="text-zinc-300 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px]"
                                >
                                  /{room}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Rooms Created */}
                        <td className="py-3.5">
                          {created.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5 max-w-[220px]">
                              {created.slice(0, 3).map((room) => (
                                <a
                                  key={room}
                                  href={`/clip/${room}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[#ff5a1f] bg-[#ff5a1f]/10 hover:bg-[#ff5a1f]/20 px-2 py-0.5 rounded-md border border-[#ff5a1f]/30 text-[10px] transition-colors group"
                                  title={`Open created room /${room}`}
                                >
                                  <span>/{room}</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                                </a>
                              ))}
                              {created.length > 3 && (
                                <button
                                  onClick={() => setActivityModalUser(user)}
                                  className="text-[10px] text-zinc-400 hover:text-white bg-zinc-800 px-1.5 py-0.5 rounded hover:bg-zinc-700 transition-colors"
                                  title="View all created rooms"
                                >
                                  +{created.length - 3} more
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-[10px] italic">0 created</span>
                          )}
                        </td>

                        {/* Rooms Accessed */}
                        <td className="py-3.5">
                          {accessed.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5 max-w-[260px]">
                              {accessed.slice(0, 3).map((room) => (
                                <a
                                  key={room}
                                  href={`/clip/${room}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/40 px-2 py-0.5 rounded-md border border-cyan-500/30 text-[10px] transition-colors group"
                                  title={`Open accessed room /${room}`}
                                >
                                  <span>/{room}</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                                </a>
                              ))}
                              {accessed.length > 3 && (
                                <button
                                  onClick={() => setActivityModalUser(user)}
                                  className="text-[10px] text-cyan-400 hover:text-cyan-200 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/50 transition-colors"
                                  title="View all visited rooms"
                                >
                                  +{accessed.length - 3} more
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-[10px] italic">None visited</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pr-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(created.length > 0 || accessed.length > 0) && (
                              <button
                                onClick={() => setActivityModalUser(user)}
                                className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 hover:text-cyan-100 border border-cyan-800/40 transition-colors"
                                title="Inspect room activity"
                              >
                                <Activity className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                              title="Edit user & permissions"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {user.username !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(user.username)}
                                className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* =========================================================================
          MODAL: USER ACTIVITY DETAILS
          ========================================================================= */}
      {activityModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#0c0d12] border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setActivityModalUser(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Room Activity:</span>
                  <span className="text-[#ff5a1f]">{activityModalUser.username}</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Detailed record of rooms created and accessed by this account.
                </p>
              </div>
            </div>

            <div className="overflow-y-auto space-y-5 pr-1 flex-1">
              {/* Created Rooms Section */}
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff5a1f]">
                    <FolderPlus className="w-4 h-4" />
                    <span>Rooms Created ({activityModalUser.createdRooms?.length || 0})</span>
                  </div>
                </div>
                {activityModalUser.createdRooms && activityModalUser.createdRooms.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {activityModalUser.createdRooms.map((room) => (
                      <a
                        key={room}
                        href={`/clip/${room}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#ff5a1f]/10 hover:bg-[#ff5a1f]/20 border border-[#ff5a1f]/30 text-xs font-mono text-zinc-200 hover:text-white transition-all group"
                      >
                        <span className="font-semibold text-[#ff5a1f]">/{room}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic mt-1">This user has not created any rooms yet.</p>
                )}
              </div>

              {/* Accessed Rooms Section */}
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <Eye className="w-4 h-4" />
                    <span>Rooms Accessed / Visited ({activityModalUser.accessedRooms?.length || 0})</span>
                  </div>
                </div>
                {activityModalUser.accessedRooms && activityModalUser.accessedRooms.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {activityModalUser.accessedRooms.map((room) => (
                      <a
                        key={room}
                        href={`/clip/${room}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30 text-xs font-mono text-zinc-200 hover:text-white transition-all group"
                      >
                        <span className="font-semibold text-cyan-300">/{room}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic mt-1">This user has not visited any rooms yet.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/80 mt-4 flex justify-end">
              <button
                onClick={() => setActivityModalUser(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors"
              >
                Close Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD APPROVED USER
          ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0c0d12] border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#ff5a1f]/10 border border-[#ff5a1f]/30 flex items-center justify-center text-[#ff5a1f] mb-3">
              <UserPlus className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Approve New User</h3>
            <p className="text-xs text-zinc-400 mb-5">
              Approved users can log in and access their designated clipboard rooms.
            </p>

            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. alex"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono focus:outline-none focus:border-[#ff5a1f]/70"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Assign user password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono focus:outline-none focus:border-[#ff5a1f]/70"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono focus:outline-none focus:border-[#ff5a1f]/70"
                >
                  <option value="user">Regular User (Access restricted to allowed rooms)</option>
                  <option value="admin">Administrator (Full control & user management)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Room Access Scope</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setNewAccessType('all')}
                    className={`py-2 px-3 rounded-xl text-xs font-mono border transition-all ${
                      newAccessType === 'all'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    All Rooms (*)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAccessType('custom')}
                    className={`py-2 px-3 rounded-xl text-xs font-mono border transition-all ${
                      newAccessType === 'custom'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Specific Rooms
                  </button>
                </div>

                {newAccessType === 'custom' && (
                  <input
                    type="text"
                    placeholder="e.g. project-a, team-alpha, qwe"
                    value={newCustomRooms}
                    onChange={(e) => setNewCustomRooms(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/70"
                  />
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#ff5a1f] hover:bg-[#ff6d36] text-white font-semibold text-xs transition-colors"
                >
                  Create & Approve User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EDIT USER & PERMISSIONS
          ========================================================================= */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0c0d12] border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-0.5">
              Edit User: <span className="text-[#ff5a1f]">{selectedUser.username}</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-5">Update credentials, status, or room authorizations.</p>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Change Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="New password..."
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono focus:outline-none focus:border-[#ff5a1f]/70"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'active' | 'disabled')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono focus:outline-none focus:border-[#ff5a1f]/70"
                >
                  <option value="active">Active (Permitted to log in)</option>
                  <option value="disabled">Disabled (Immediately blocked)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'user' | 'admin')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono focus:outline-none focus:border-[#ff5a1f]/70"
                >
                  <option value="user">Regular User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Room Access Scope</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setEditAccessType('all')}
                    className={`py-2 px-3 rounded-xl text-xs font-mono border transition-all ${
                      editAccessType === 'all'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    All Rooms (*)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditAccessType('custom')}
                    className={`py-2 px-3 rounded-xl text-xs font-mono border transition-all ${
                      editAccessType === 'custom'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Specific Rooms
                  </button>
                </div>

                {editAccessType === 'custom' && (
                  <input
                    type="text"
                    placeholder="e.g. project-a, team-alpha, qwe"
                    value={editCustomRooms}
                    onChange={(e) => setEditCustomRooms(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/70"
                  />
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors cursor-pointer"
                >
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
