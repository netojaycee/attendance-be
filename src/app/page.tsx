
// src/app/practice-sessions/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import {
  useGetPracticeSessionsQuery,
  useDeletePracticeSessionMutation,
} from "@/app/redux/api";
import PracticeSessionsTable from "@/components/local/PracticeSessionsTable";
import PracticeSessionForm from "@/components/local/PracticeSessionForm";
import { PracticeSession } from "@/lib/types";

export default function PracticeSessionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<PracticeSession | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionIdToDelete, setSessionIdToDelete] = useState<string | null>(null);

  const { data: sessionsData, isLoading: isLoadingSessions } = useGetPracticeSessionsQuery({});
  const [deletePracticeSession, {isLoading: isLoadingDelete}] = useDeletePracticeSessionMutation();

  const handleAdd = () => {
    setEditingSession(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (session: PracticeSession) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setSessionIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!sessionIdToDelete) return;

    try {
      await deletePracticeSession(sessionIdToDelete).unwrap();
      toast.success("Practice session deleted successfully", {
        style: { background: "#2dd4bf", color: "#1a3c34" },
      });
    } catch (error) {
      console.error("Delete practice session error:", error);
      toast.error("Failed to delete practice session", {
        style: { background: "#f87171", color: "#1a3c34" },
      });
    } finally {
      setIsDeleteModalOpen(false);
      setSessionIdToDelete(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSession(undefined);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setSessionIdToDelete(null);
  };

  const sessions = sessionsData || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-teal-800">Practice Sessions</h1>
          <Button
            onClick={handleAdd}
            className="bg-teal-500 hover:bg-teal-600 flex items-center gap-2"
            disabled={isLoadingSessions}
          >
            <Plus className="h-5 w-5" />
            Add Practice Session
          </Button>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <PracticeSessionsTable
            sessions={sessions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoadingSessions}
          />
        </div>

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-teal-800">
                {editingSession ? "Edit Practice Session" : "Add Practice Session"}
              </DialogTitle>
            </DialogHeader>
            <PracticeSessionForm
              session={editingSession}
              onSuccess={handleModalClose}
              onCancel={handleModalClose}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-teal-800">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to delete this practice session? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleDeleteModalClose}
                className="border-teal-500 text-teal-700 hover:bg-teal-50"
              >
                No
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                {isLoadingDelete ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Please wait
              </>
            ) : (
              "YES"
            )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}