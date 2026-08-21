import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from "react-hot-toast";

export default function AddTaskDialog({ open, onClose, project, members }) {
  const [taskName, setTaskName] = useState('');
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', project.id] });
      onClose();
      setTaskName('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskName.trim()) {
      toast.error("Please enter a task name");
      return;
    }

    createTaskMutation.mutate({
      project_id: project.id,
      task_name: taskName.trim(),
      status: 'not_started',
      priority: 'medium',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#020806] border border-lime-400/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <Label className="text-white/80">Task Name *</Label>
            <Input
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name"
              autoFocus
              className="mt-2 border-lime-400/15 bg-black text-white placeholder:text-white/30"
            />
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
              disabled={createTaskMutation.isPending}
              className="bg-lime-400 text-black hover:bg-lime-300"
            >
              {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
