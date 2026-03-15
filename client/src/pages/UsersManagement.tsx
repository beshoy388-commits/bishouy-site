import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Edit2, Trash2, Save, X, ShieldAlert, ShieldOff, ShieldCheck, AlertOctagon, Flame, ExternalLink } from "lucide-react";
import { toast } from "sonner";

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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-[#E8A020]" size={48} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-[#F2F0EB] mb-6">
        User Management
      </h2>

      <div className="bg-[#1C1C1A] border border-[#222220] rounded-sm overflow-hidden">
        {/* Table - Desktop only */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222220]">
                <th className="text-left py-3 px-4 font-medium text-[#8A8880] text-sm">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-[#8A8880] text-sm">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-medium text-[#8A8880] text-sm">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-medium text-[#8A8880] text-sm text-center">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-[#8A8880] text-sm">
                  Joined On
                </th>
                <th className="text-left py-3 px-4 font-medium text-[#8A8880] text-sm text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.map(user => (
                <tr
                  key={user.id}
                  className="border-b border-[#1C1C1A] hover:bg-[#0F0F0E]/50 transition-colors"
                >
                  {editingId === user.id && editingData ? (
                    <>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editingData.name}
                          onChange={e =>
                            setEditingData({
                              ...editingData,
                              name: e.target.value,
                            })
                          }
                          className="w-full bg-[#0F0F0E] border border-[#222220] rounded px-2 py-1 text-[#F2F0EB] text-sm"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="email"
                          value={editingData.email}
                          onChange={e =>
                            setEditingData({
                              ...editingData,
                              email: e.target.value,
                            })
                          }
                          className="w-full bg-[#0F0F0E] border border-[#222220] rounded px-2 py-1 text-[#F2F0EB] text-sm"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={editingData.role}
                          onChange={e =>
                            setEditingData({
                              ...editingData,
                              role: e.target.value as "user" | "admin",
                            })
                          }
                          className="bg-[#0F0F0E] border border-[#222220] rounded px-2 py-1 text-[#F2F0EB] text-sm"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-[#8A8880] text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 flex justify-end gap-2">
                        <button
                          onClick={handleSave}
                          disabled={updateMutation.isPending}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-600 uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors disabled:opacity-50"
                        >
                          <Save size={12} /> Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingData(null);
                          }}
                          className="flex items-center gap-1 bg-[#2A2A28] hover:bg-[#333330] text-[#8A8880] text-[10px] font-600 uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors border border-[#333330]"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-[#F2F0EB] text-sm font-medium">
                        {user.name || "-"}
                      </td>
                      <td className="py-3 px-4 text-[#8A8880] text-sm">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-600 uppercase tracking-widest ${
                            user.role === "admin"
                              ? "bg-[#E8A020] text-[#0F0F0E]"
                              : "bg-[#2A2A28] text-[#8A8880]"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-600 uppercase tracking-widest ${
                            user.status === "active"
                              ? "bg-green-900/30 text-green-400 border border-green-800/50"
                              : user.status === "restricted"
                              ? "bg-blue-900/30 text-blue-400 border border-blue-800/50"
                              : "bg-red-900/30 text-red-400 border border-red-800/50"
                          }`}
                        >
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#555550] text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-[#8A8880] hover:text-[#E8A020] transition-colors"
                          title="Edit Basic Info"
                        >
                          <Edit2 size={16} />
                        </button>
                        
                        {(user.status === 'restricted' || user.status === 'banned') && (
                          <button
                            onClick={() => handleActivate(user.id)}
                            className="p-1.5 text-[#8A8880] hover:text-green-500 transition-colors"
                            title="Restore Account (Active)"
                          >
                            <ShieldCheck size={16} />
                          </button>
                        )}
                        
                        {user.status !== 'restricted' && (
                          <button
                            onClick={() => handleDeactivate(user.id)}
                            className="p-1.5 text-[#8A8880] hover:text-blue-400 transition-colors"
                            title="Deactivate (Read-Only Mode)"
                          >
                            <ShieldOff size={16} />
                          </button>
                        )}
                        
                        {user.status !== 'banned' && (
                          <button
                            onClick={() => handleBan(user.id)}
                            className="p-1.5 text-[#8A8880] hover:text-orange-500 transition-colors"
                            title="Permanent Ban (No Login)"
                          >
                            <AlertOctagon size={16} />
                          </button>
                        )}

                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleImpersonate(user.id)}
                            className="p-1.5 text-[#8A8880] hover:text-[#E8A020] transition-colors"
                            title="Entra come utente (Impersonate)"
                          >
                            <ExternalLink size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => handlePurge(user)}
                          className={`p-1.5 transition-colors ${user.status === 'deleted' ? 'text-red-500 hover:text-red-700 animate-pulse' : 'text-[#8A8880] hover:text-red-500'}`}
                          title={user.status === 'deleted' ? "Final Physical Wipe (Already Notified)" : "Schedule Purge (Notify User)"}
                        >
                          <Flame size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card Layout - Mobile only */}
        <div className="md:hidden divide-y divide-[#222220]">
          {users?.map(user => (
            <div key={user.id} className="p-4 space-y-3">
              {editingId === user.id && editingData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-[#E8A020] uppercase font-600 tracking-wider">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editingData.name}
                        onChange={e =>
                          setEditingData({
                            ...editingData,
                            name: e.target.value,
                          })
                        }
                        className="w-full bg-[#0F0F0E] border border-[#222220] rounded px-2 py-1.5 text-[#F2F0EB] text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-[#E8A020] uppercase font-600 tracking-wider">
                        Role
                      </label>
                      <select
                        value={editingData.role}
                        onChange={e =>
                          setEditingData({
                            ...editingData,
                            role: e.target.value as "user" | "admin",
                          })
                        }
                        className="w-full bg-[#0F0F0E] border border-[#222220] rounded px-2 py-1.5 text-[#F2F0EB] text-xs"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-[#E8A020] uppercase font-600 tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingData.email}
                      onChange={e =>
                        setEditingData({
                          ...editingData,
                          email: e.target.value,
                        })
                      }
                      className="w-full bg-[#0F0F0E] border border-[#222220] rounded px-2 py-1.5 text-[#F2F0EB] text-xs"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-green-600 py-2 rounded-sm text-white text-[10px] font-600 uppercase tracking-widest"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-[#2A2A28] py-2 rounded-sm text-[#8A8880] text-[10px] font-600 uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="text-[#F2F0EB] font-600 text-sm truncate">
                        {user.name || "Unnamed User"}
                      </p>
                      <p className="text-[#8A8880] text-xs truncate">
                        {user.email}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-600 uppercase tracking-widest flex-shrink-0 ${
                        user.role === "admin"
                          ? "bg-[#E8A020] text-[#0F0F0E]"
                          : "bg-[#2A2A28] text-[#8A8880]"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-[#555550]">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-[#8A8880] hover:text-[#E8A020]"
                        >
                          <Edit2 size={16} />
                        </button>
                        {(user.status === 'restricted' || user.status === 'banned') && (
                          <button
                            onClick={() => handleActivate(user.id)}
                            className="p-2 text-[#8A8880] hover:text-green-500"
                            title="Restore"
                          >
                            <ShieldCheck size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          className="p-2 text-[#8A8880] hover:text-blue-400"
                          title="Restrict"
                        >
                          <ShieldOff size={16} />
                        </button>
                        <button
                          onClick={() => handleBan(user.id)}
                          className="p-2 text-[#8A8880] hover:text-orange-500"
                          title="Ban"
                        >
                          <AlertOctagon size={16} />
                        </button>
                        <button
                          onClick={() => handlePurge(user)}
                          className={`p-2 ${user.status === 'deleted' ? 'text-red-500 animate-pulse' : 'text-[#8A8880]'}`}
                          title={user.status === 'deleted' ? "Final Wipe" : "Purge"}
                        >
                          <Flame size={16} />
                        </button>

                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleImpersonate(user.id)}
                            className="p-2 text-[#8A8880] hover:text-[#E8A020]"
                            title="Impersonate"
                          >
                            <ExternalLink size={16} />
                          </button>
                        )}
                      </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {users?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#8A8880]">No users found</p>
        </div>
      )}
    </div>
  );
}
