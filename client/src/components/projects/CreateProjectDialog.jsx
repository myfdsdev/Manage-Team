import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from "react-hot-toast";

const columnOptions = [
  { id: 'owner', label: 'Owner', description: 'Assign task to team member' },
  { id: 'status', label: 'Status', description: 'Track progress status' },
  { id: 'due_date', label: 'Due Date', description: 'Set deadlines' },
  { id: 'priority', label: 'Priority', description: 'Task priority level' },
  { id: 'files', label: 'Files', description: 'Attach files' },
  { id: 'notes', label: 'Notes', description: 'Additional information' },
];

const colors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#06b6d4'
];

const dialogClass = "bg-[#020806] border border-lime-400/20 text-white";
const labelClass = "text-white/80";
const inputClass = "mt-2 border-lime-400/15 bg-black text-white placeholder:text-white/30";
const checkboxClass =
  "border-lime-400/30 data-[state=checked]:bg-lime-400 data-[state=checked]:text-black data-[state=checked]:border-lime-400";

export default function CreateProjectDialog({ open, onClose, currentUser }) {
  const [formData, setFormData] = useState({
    project_name: '',
    enabled_columns: ['owner', 'status', 'due_date', 'priority', 'notes'],
    color: '#6366f1',
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberPopupOpen, setMemberPopupOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [tempSelectedMembers, setTempSelectedMembers] = useState([]);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch all users for member selection
  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: open,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data) => {
      // Create project
      const project = await base44.entities.Project.create({
        ...data,
        created_by: currentUser.id,
        created_by_name: currentUser.full_name,
      });

      // Add selected members to project
      if (selectedMembers.length > 0) {
        await Promise.all(
          selectedMembers.map(member =>
            base44.entities.ProjectMember.create({
              project_id: project.id,
              project_name: project.project_name,
              user_id: member.id,
              user_email: member.email,
              user_name: member.full_name,
              added_by: currentUser.id,
            })
          )
        );
      }

      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-members'] });

      // Navigate to project board with Add Task dialog open
      navigate(createPageUrl('ProjectBoard') + `?projectId=${project.id}&openAddTask=true`);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.project_name.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    createProjectMutation.mutate({
      ...formData,
      project_name: formData.project_name.trim(),
    });
  };

  const toggleColumn = (columnId) => {
    setFormData(prev => ({
      ...prev,
      enabled_columns: prev.enabled_columns.includes(columnId)
        ? prev.enabled_columns.filter(c => c !== columnId)
        : [...prev.enabled_columns, columnId]
    }));
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== userId));
  };

  const handleOpenMemberPopup = () => {
    setTempSelectedMembers([...selectedMembers]);
    setMemberPopupOpen(true);
  };

  const handleToggleMember = (user) => {
    const isSelected = tempSelectedMembers.find(m => m.id === user.id);
    if (isSelected) {
      setTempSelectedMembers(tempSelectedMembers.filter(m => m.id !== user.id));
    } else {
      setTempSelectedMembers([...tempSelectedMembers, user]);
    }
  };

  const handleSaveMembers = () => {
    setSelectedMembers([...tempSelectedMembers]);
    setMemberPopupOpen(false);
    setMemberSearch('');
  };

  const filteredUsers = allUsers.filter(user =>
    user.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className={`max-w-2xl ${dialogClass}`}>
          <DialogHeader>
            <DialogTitle className="text-white">Create New Project</DialogTitle>
          </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <Label className={labelClass}>Project Name *</Label>
            <Input
              value={formData.project_name}
              onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              placeholder="Enter project name"
              className={inputClass}
            />
          </div>

          <div>
            <Label className={labelClass}>Add Members</Label>
            <button
              type="button"
              onClick={handleOpenMemberPopup}
              className="mt-2 w-full border border-lime-400/15 rounded-lg p-3 bg-black text-left hover:bg-lime-400/[0.04] transition-colors min-h-[60px] flex flex-wrap gap-2 items-center"
            >
              {selectedMembers.length === 0 ? (
                <span className="text-white/40 text-sm">Click to add members...</span>
              ) : (
                selectedMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-1 bg-lime-400/10 text-lime-300 border border-lime-400/20 px-3 py-1 rounded-full text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMember(member.id);
                    }}
                  >
                    <span>{member.full_name}</span>
                    <X className="w-3 h-3 cursor-pointer hover:text-lime-100" />
                  </div>
                ))
              )}
            </button>
          </div>

          <div>
            <Label className={labelClass}>Project Color</Label>
            <div className="flex gap-2 mt-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-lime-400 ring-offset-[#020806]' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className={`mb-3 block ${labelClass}`}>Select Columns</Label>
            <div className="grid grid-cols-2 gap-4">
              {columnOptions.map((option) => (
                <div key={option.id} className="flex items-start gap-3 p-3 rounded-lg border border-lime-400/15 bg-black/40">
                  <Checkbox
                    checked={formData.enabled_columns.includes(option.id)}
                    onCheckedChange={() => toggleColumn(option.id)}
                    className={checkboxClass}
                  />
                  <div>
                    <div className="font-medium text-sm text-white">{option.label}</div>
                    <div className="text-xs text-white/50">{option.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-lime-400/20 bg-transparent text-white hover:bg-lime-400/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProjectMutation.isPending}
              className="bg-lime-400 text-black hover:bg-lime-300"
            >
              {createProjectMutation.isPending ? 'Creating...' : 'Next'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Member Selection Popup */}
    <Dialog open={memberPopupOpen} onOpenChange={setMemberPopupOpen}>
      <DialogContent className={`max-w-lg max-h-[80vh] flex flex-col ${dialogClass}`}>
        <DialogHeader>
          <DialogTitle className="text-white">Add Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
          {/* Search Input */}
          <Input
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full border-lime-400/15 bg-black text-white placeholder:text-white/30"
          />

          {/* Members List */}
          <div className="flex-1 overflow-y-auto border border-lime-400/15 rounded-lg">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-white/50">No members found</div>
            ) : (
              <div className="divide-y divide-lime-400/10">
                {filteredUsers.map(user => {
                  const isSelected = !!tempSelectedMembers.find(m => m.id === user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleToggleMember(user)}
                      className={`w-full p-3 hover:bg-lime-400/[0.04] flex items-center gap-3 text-left transition-colors ${isSelected ? 'bg-lime-400/10 border-l-4 border-lime-400' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-lime-400/15 text-lime-300 flex items-center justify-center font-medium text-sm shrink-0">
                        {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-white">{user.full_name}</div>
                        <div className="text-xs text-white/50 truncate">{user.email}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-lime-400/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMemberPopupOpen(false);
                setMemberSearch('');
              }}
              className="border-lime-400/20 bg-transparent text-white hover:bg-lime-400/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveMembers}
              className="bg-lime-400 text-black hover:bg-lime-300"
            >
              Done ({tempSelectedMembers.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
