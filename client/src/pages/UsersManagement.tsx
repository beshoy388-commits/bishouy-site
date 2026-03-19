import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Edit2, Trash2, Save, X, ShieldAlert, ShieldOff, ShieldCheck, AlertOctagon, Flame, ExternalLink, User, Fingerprint, Activity, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface EditingUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

export default function UsersManagement() {
  const { data: users, isLoading, refetch } = trpc.users.getAll.useQuery();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<EditingUser | null>(null);

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
      setEditingId(null);
      setEditingData(null);
      refetch();
    },
    onError: error => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const deactivateMutation = trpc.users.deactivate.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "User deactivated (Read-Only mode)");
      refetch();
    },
    onError: error => {
      toast.error(error.message || "Failed to deactivate user");
    },
  });

  const banMutation = trpc.users.ban.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "User banned permanently");
      refetch();
    },
    onError: error => {
      toast.error(error.message || "Failed to ban user");
    },
  });

  const purgeMutation = trpc.users.purge.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "User account scheduled for deletion.");
      refetch();
    },
    onError: error => {
      toast.error(error.message || "Failed to schedule purge.");
    },
  });

  const finalPurgeMutation = trpc.users.finalPurge.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "User data physically removed.");
      refetch();
    },
    onError: error => {
      toast.error(error.message || "Failed to finalize purge.");
    },
  });

  const activateMutation = trpc.users.activate.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "User account restored.");
      refetch();
    },
    onError: error => {
      toast.error(error.message || "Failed to restore user");
    },
  });

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setEditingData({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      role: user.role,
    });
  };

  const handleSave = async () => {
    if (!editingData) return;

    await updateMutation.mutateAsync({
      id: editingData.id,
      name: editingData.name,
      email: editingData.email,
      role: editingData.role,
    });
  };

  const handleDeactivate = async (id: number) => {
    const reason = prompt("Deactivate User: Provide a formal reason for this restriction (optional):");
    if (reason !== null) {
      await deactivateMutation.mutateAsync({ id, reason });
    }
  };

  const handleBan = async (id: number) => {
    const reason = prompt("PERMANENT BAN: Provide a formal reason for this ban (optional):");
    if (reason !== null) {
      await banMutation.mutateAsync({ id, reason });
    }
  };

  const handleActivate = async (id: number) => {
    const reason = prompt("RESTORE USER: Provide a formal reason or message for the user (optional):");
    if (reason !== null) {
      await activateMutation.mutateAsync({ id, reason });
    }
  };

  const handlePurge = async (user: any) => {
    if (user.status === 'deleted') {
      if (confirm("FINAL WIPE: This user has already been notified. Do you want to physically DELETE all their data now? This cannot be undone.")) {
        await finalPurgeMutation.mutateAsync({ id: user.id });
      }
    } else {
      const reason = prompt("SCHEDULE PURGE: Provide a final formal reason for account deletion (optional). The user will see this before their session is terminated:");
      if (reason !== null) {
        await purgeMutation.mutateAsync({ id: user.id, reason });
      }
    }
  };

  const impersonateMutation = trpc.users.impersonate.useMutation({
    onSuccess: (data) => {
      window.open(data.redirect, "_blank");
      toast.success("Impersonation sequence initialized in new window.");
    },
    onError: (error) => {
      toast.error("Impersonation failed: " + error.message);
    }
  });

  const handleImpersonate = (id: number) => {
    if (confirm("SECURITY ALERT: You are about to enter this user's profile. All actions will be performed as them. Continue?")) {
      impersonateMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-30">
        <Fingerprint size={48} className="animate-pulse text-[#E8A020]" />
        <p className="text-[10px] font-900 uppercase tracking-[0.4em] font-ui">Scanning Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in relative pb-10">
      {/* Tactical Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 border-b border-[#1C1C1A] pb-8">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                 <div className="px-2 py-0.5 bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-sm">
                    <span className="text-[10px] font-900 text-[#E8A020] uppercase tracking-widest font-ui">Registry: Personnel</span>
                 </div>
            </div>
            <h2 className="text-4xl font-display text-[#F2F0EB] tracking-tighter uppercase leading-[0.8] mt-4">Node <span className="text-[#E8A020]">Registry</span></h2>
            <p className="text-[#555550] text-[10px] font-900 uppercase tracking-[0.3em] font-ui">Overseeing agent identities and access clearance across the global matrix</p>
        </div>
        
        <div className="p-6 bg-[#11110F] border border-[#1C1C1A] relative overflow-hidden flex flex-col items-end">
            <div className="flex items-center gap-3 mb-2">
                 <Activity size={18} className="text-[#22c55e]" />
                 <span className="text-2xl font-display text-[#F2F0EB]">{users?.length || 0}</span>
            </div>
            <p className="text-[9px] font-900 text-[#555550] uppercase tracking-widest font-ui">Active Node Identifiers</p>
        </div>
      </div>

      <div className="bg-[#11110F] border border-[#1C1C1A] overflow-hidden relative shadow-2xl">
        <div className="hidden md:block overflow-x-auto relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8A020]/20 to-transparent" />
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C1C1A] bg-[#141412]">
                <th className="text-left py-4 px-6 font-900 text-[#555550] text-[10px] uppercase tracking-widest font-ui">Identifier</th>
                <th className="text-left py-4 px-6 font-900 text-[#555550] text-[10px] uppercase tracking-widest font-ui">Email Hash</th>
                <th className="text-left py-4 px-6 font-900 text-[#555550] text-[10px] uppercase tracking-widest font-ui text-center">Clearance</th>
                <th className="text-left py-4 px-6 font-900 text-[#555550] text-[10px] uppercase tracking-widest font-ui text-center">Protocol</th>
                <th className="text-left py-4 px-6 font-900 text-[#555550] text-[10px] uppercase tracking-widest font-ui">Creation Date</th>
                <th className="text-right py-4 px-6 font-900 text-[#E8A020] text-[10px] uppercase tracking-widest font-ui">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1A]">
              {users?.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-[#F2F0EB]/[0.02] transition-colors"
                >
                  {editingId === user.id && editingData ? (
                    <>
                      <td className="py-4 px-6">
                        <input
                          type="text"
                          value={editingData.name}
                          onChange={e => setEditingData({ ...editingData, name: e.target.value })}
                          className="w-full bg-[#0A0A09] border border-[#1C1C1A] text-[#E8A020] text-xs font-900 uppercase tracking-widest px-3 py-2 outline-none focus:border-[#E8A020]/40"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="email"
                          value={editingData.email}
                          onChange={e => setEditingData({ ...editingData, email: e.target.value })}
                          className="w-full bg-[#0A0A09] border border-[#1C1C1A] text-[#8A8880] text-xs font-900 uppercase tracking-widest px-3 py-2 outline-none"
                        />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <select
                          value={editingData.role}
                          onChange={e => setEditingData({ ...editingData, role: e.target.value as "user" | "admin" })}
                          className="bg-[#0A0A09] border border-[#1C1C1A] text-[#F2F0EB] text-[10px] font-900 uppercase tracking-widest px-3 py-2 outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-4 px-6" />
                      <td className="py-4 px-6" />
                      <td className="py-4 px-6 flex justify-end gap-2">
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 text-[9px] font-900 uppercase tracking-widest hover:bg-green-500 hover:text-[#0F0F0E] transition-all"
                        >
                          <Save size={12} /> Sync
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditingData(null); }}
                          className="flex items-center gap-2 bg-[#1C1C1A] text-[#555550] border border-[#1C1C1A] px-4 py-2 text-[9px] font-900 uppercase tracking-widest hover:text-[#F2F0EB] transition-all"
                        >
                          <X size={12} /> Abort
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#1C1C1A] text-[#8A8880] flex items-center justify-center text-[10px] font-900 border border-[#222220] uppercase font-display">
                                {user.name?.[0] || 'X'}
                            </div>
                            <span className="text-[11px] font-900 text-[#F2F0EB] uppercase tracking-widest font-ui">{user.name || "SECURE_NODE"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[10px] font-900 text-[#555550] uppercase tracking-tighter font-ui">
                        {(user.email ?? "").replace(/(.{3}).+@(.+)/, "$1***@$2")}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`text-[9px] font-900 uppercase tracking-widest px-3 py-1 border ${user.role === 'admin' ? 'text-[#E8A020] border-[#E8A020]/20 bg-[#E8A020]/5' : 'text-[#333330] border-[#1C1C1A]'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                         <div className="flex items-center justify-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : user.status === 'restricted' ? 'bg-blue-500' : 'bg-red-500 animate-pulse'} `} />
                           <span className={`text-[9px] font-900 uppercase tracking-widest ${user.status === 'active' ? 'text-green-500' : user.status === 'restricted' ? 'text-blue-500' : 'text-red-500'}`}>
                              {user.status || 'active'}
                           </span>
                         </div>
                      </td>
                      <td className="py-4 px-6 text-[10px] font-900 text-[#555550] uppercase tracking-widest font-ui">
                         {new Date(user.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 flex justify-end items-center gap-1 group/actions">
                        <div className="flex items-center gap-1 opacity-40 group-hover/actions:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(user)} className="p-2 text-[#555550] hover:text-[#E8A020] transition-colors"><Edit2 size={16} /></button>
                            {(user.status === 'restricted' || user.status === 'banned') && (
                              <button onClick={() => handleActivate(user.id)} className="p-2 text-green-500/50 hover:text-green-500 transition-colors"><ShieldCheck size={16} /></button>
                            )}
                            {user.status !== 'restricted' && (
                              <button onClick={() => handleDeactivate(user.id)} className="p-2 text-blue-500/50 hover:text-blue-500 transition-colors"><ShieldOff size={16} /></button>
                            )}
                            {user.status !== 'banned' && (
                              <button onClick={() => handleBan(user.id)} className="p-2 text-red-500/50 hover:text-red-500 transition-colors"><AlertOctagon size={16} /></button>
                            )}
                            {user.role !== 'admin' && (
                              <button onClick={() => handleImpersonate(user.id)} className="p-2 text-[#E8A020]/50 hover:text-[#E8A020] transition-colors"><ExternalLink size={16} /></button>
                            )}
                            <button onClick={() => handlePurge(user)} className={`p-2 transition-colors ${user.status === 'deleted' ? 'text-red-500 animate-pulse' : 'text-[#333330] hover:text-white'}`}><Flame size={16} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View with Tactical Cards */}
        <div className="md:hidden divide-y divide-[#1C1C1A]">
            {users?.map(user => (
                <div key={user.id} className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#1C1C1A] text-[#8A8880] flex items-center justify-center text-[10px] font-900 border border-[#222220] uppercase font-display">
                                {user.name?.[0] || 'X'}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-900 text-[#F2F0EB] uppercase tracking-widest font-ui">{user.name || "SECURE_NODE"}</span>
                                <span className="text-[9px] uppercase font-900 text-[#555550] tracking-tighter">ID: {user.id.toString().padStart(4, '0')}</span>
                            </div>
                        </div>
                        <span className={`text-[8px] font-900 uppercase tracking-widest px-2 py-0.5 border ${user.role === 'admin' ? 'text-[#E8A020] border-[#E8A020]/20 bg-[#E8A020]/5' : 'text-[#333330] border-[#1C1C1A]'}`}>
                          {user.role}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-1 h-1 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'} `} />
                            <span className="text-[9px] font-900 text-[#555550] uppercase tracking-widest font-ui">{user.status || 'ACTIVE'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                             <button onClick={() => handleEdit(user)} className="p-2 text-[#333330]"><Edit2 size={14} /></button>
                             <button onClick={() => handleImpersonate(user.id)} className="p-2 text-[#333330]"><ExternalLink size={14} /></button>
                             <button onClick={() => handlePurge(user)} className="p-2 text-[#333330]"><Flame size={14} /></button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
