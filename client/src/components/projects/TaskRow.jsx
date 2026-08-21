import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, FileText, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import FilesDialog from './FilesDialog';
import NotesPopup from './NotesPopup';

const statusConfig = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
  working_on_it: { label: 'Working on it', color: 'bg-blue-100 text-blue-800' },
  done: { label: 'Done', color: 'bg-green-100 text-green-800' },
  stuck: { label: 'Stuck', color: 'bg-red-100 text-red-800' },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800' },
};

const triggerClass = "h-9 border-lime-400/15 bg-black text-white";
const contentClass = "bg-[#020806] border-lime-400/20 text-white";
const avatarClass = "text-xs bg-lime-400/15 text-lime-300";

export default function TaskRow({ task, project, members, isAdmin, currentUserId, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(task.task_name);
  const [uploading, setUploading] = useState(false);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [showNotesPopup, setShowNotesPopup] = useState(false);

  const canEdit = isAdmin || task.owner_id === currentUserId;

  const handleSaveName = () => {
    if (editedName.trim() !== task.task_name) {
      onUpdate({ task_name: editedName.trim() });
    }
    setIsEditing(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const currentFiles = task.files || [];
      onUpdate({ files: [...currentFiles, file_url] });
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (fileIndex) => {
    const currentFiles = task.files || [];
    const updatedFiles = currentFiles.filter((_, index) => index !== fileIndex);
    onUpdate({ files: updatedFiles });
  };

  const handleNotesClick = (e) => {
    if (!canEdit) return;
    e.stopPropagation();
    setShowNotesPopup(true);
  };

  const handleSaveNotes = (notes) => {
    onUpdate({ notes });
  };

  return (
    <div
      className="border-b border-lime-400/10 px-6 py-3.5 hover:bg-lime-400/[0.03] transition-all duration-200 grid gap-3 items-center group"
      style={{
        gridTemplateColumns: `220px ${project.enabled_columns.map(col => {
          if (col === 'owner') return '180px';
          if (col === 'status') return '160px';
          if (col === 'due_date') return '140px';
          if (col === 'priority') return '120px';
          if (col === 'files') return '100px';
          if (col === 'notes') return '1fr';
          return '140px';
        }).join(' ')} 60px`
      }}
    >
      {/* Task Name */}
      <div>
        {isEditing ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            autoFocus
            className="h-9 text-sm font-medium border-lime-400/15 bg-black text-white"
          />
        ) : (
          <div
            onClick={() => canEdit && setIsEditing(true)}
            className={`font-semibold text-sm text-white ${canEdit ? 'cursor-pointer hover:text-lime-300 transition-colors' : ''}`}
          >
            {task.task_name}
          </div>
        )}
      </div>

      {/* Owner */}
      {project.enabled_columns.includes('owner') && (
        <div>
          <Select
            value={task.owner_id || ''}
            onValueChange={(value) => {
              const member = members.find(m => m.user_id === value);
              onUpdate({ owner_id: value, owner_name: member?.user_name });
            }}
            disabled={!canEdit}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Assign...">
                {task.owner_name && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className={avatarClass}>
                        {task.owner_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{task.owner_name}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className={contentClass}>
              {members.map((member) => (
                <SelectItem key={member.user_id} value={member.user_id} className="focus:bg-lime-400/10 focus:text-lime-200">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className={avatarClass}>
                        {member.user_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{member.user_name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Status */}
      {project.enabled_columns.includes('status') && (
        <div>
          <Select
            value={task.status}
            onValueChange={(value) => onUpdate({ status: value })}
            disabled={!canEdit}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue>
                <Badge className={statusConfig[task.status].color}>
                  {statusConfig[task.status].label}
                </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className={contentClass}>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key} className="focus:bg-lime-400/10">
                  <Badge className={config.color}>{config.label}</Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Due Date */}
      {project.enabled_columns.includes('due_date') && (
        <div>
          <Input
            type="date"
            value={task.due_date || ''}
            onChange={(e) => onUpdate({ due_date: e.target.value })}
            disabled={!canEdit}
            className="h-9 border-lime-400/15 bg-black text-white [color-scheme:dark]"
          />
        </div>
      )}

      {/* Priority */}
      {project.enabled_columns.includes('priority') && (
        <div>
          <Select
            value={task.priority}
            onValueChange={(value) => onUpdate({ priority: value })}
            disabled={!canEdit}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue>
                <Badge className={priorityConfig[task.priority].color}>
                  {priorityConfig[task.priority].label}
                </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className={contentClass}>
              {Object.entries(priorityConfig).map(([key, config]) => (
                <SelectItem key={key} value={key} className="focus:bg-lime-400/10">
                  <Badge className={config.color}>{config.label}</Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Files */}
      {project.enabled_columns.includes('files') && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilesDialog(true)}
            disabled={!task.files || task.files.length === 0}
            className="border-lime-400/20 bg-transparent text-white hover:bg-lime-400/10 hover:text-white"
          >
            <FileText className="w-4 h-4 mr-1" />
            {task.files?.length || 0}
          </Button>
          {canEdit && (
            <label className="cursor-pointer">
              <Button variant="ghost" size="icon" asChild disabled={uploading} className="text-white/70 hover:bg-lime-400/10 hover:text-lime-300">
                <span>
                  <Upload className="w-4 h-4" />
                </span>
              </Button>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      )}

      {/* Notes */}
      {project.enabled_columns.includes('notes') && (
        <div
          onClick={handleNotesClick}
          className={`${canEdit ? 'cursor-pointer hover:bg-lime-400/[0.06]' : ''} rounded-lg px-3 py-2 transition-all duration-200 border border-transparent ${canEdit ? 'hover:border-lime-400/20' : ''}`}
        >
          <div className="text-sm text-white/70 whitespace-pre-wrap break-words min-h-[36px] flex items-center">
            {task.notes ? task.notes : <span className="text-white/40 italic text-xs">Click to add notes...</span>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div>
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Files Dialog */}
      <FilesDialog
        open={showFilesDialog}
        onClose={() => setShowFilesDialog(false)}
        files={task.files}
        taskName={task.task_name}
        canEdit={canEdit}
        onRemoveFile={handleRemoveFile}
      />

      {/* Notes Popup */}
      <NotesPopup
        open={showNotesPopup}
        onClose={() => setShowNotesPopup(false)}
        notes={task.notes || ''}
        onSave={handleSaveNotes}
      />
    </div>
  );
}
