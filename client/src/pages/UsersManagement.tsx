import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Edit2, Trash2, Save, X } from "lucide-react";
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
    onError: (error) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
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

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      await deleteMutation.mutateAsync({ id });
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
      <h2 className="font-display text-2xl text-[#F2F0EB] mb-6">User Management</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#222220]">
              <th className="text-left py-3 px-4 font-medium text-[#8A8880] text-sm">Name</th>
              <th className="text-left py-3 px-4 font-medium text-[#8A8880] text-sm">Email</th>
              <th className="text-left py-3 px-4 font-medium text-[#8A8880] text-sm">Role</th>
              <th className="text-left py-3 px-4 font-medium text-[#8A8880] text-sm">Joined</th>
              <th className="text-left py-3 px-4 font-medium text-[#8A8880] text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-b border-[#1C1C1A] hover:bg-[#1C1C1A] transition-colors">
                {editingId === user.id && editingData ? (
                  <>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={editingData.name}
                        onChange={(e) =>
                          setEditingData({ ...editingData, name: e.target.value })
                        }
                        className="w-full bg-[#0F0F0E] border border-[#222220] rounded px-2 py-1 text-[#F2F0EB] text-sm"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="email"
                        value={editingData.email}
                        onChange={(e) =>
                          setEditingData({ ...editingData, email: e.target.value })
                        }
                        className="w-full bg-[#0F0F0E] border border-[#222220] rounded px-2 py-1 text-[#F2F0EB] text-sm"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={editingData.role}
                        onChange={(e) =>
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
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-1 bg-[#27AE60] hover:bg-[#229954] text-white text-xs px-3 py-1 rounded transition-colors disabled:opacity-50"
                      >
                        <Save size={14} />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingData(null);
                        }}
                        className="flex items-center gap-1 bg-[#8A8880] hover:bg-[#6B6B63] text-white text-xs px-3 py-1 rounded transition-colors"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4 text-[#F2F0EB] text-sm">{user.name || "-"}</td>
                    <td className="py-3 px-4 text-[#D4D0C8] text-sm">{user.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          user.role === "admin"
                            ? "bg-[#E8A020] text-[#0F0F0E]"
                            : "bg-[#1C1C1A] text-[#8A8880]"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#8A8880] text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex items-center gap-1 bg-[#2980B9] hover:bg-[#1F5A8F] text-white text-xs px-3 py-1 rounded transition-colors"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-1 bg-[#C0392B] hover:bg-[#A93226] text-white text-xs px-3 py-1 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#8A8880]">No users found</p>
        </div>
      )}
    </div>
  );
}
