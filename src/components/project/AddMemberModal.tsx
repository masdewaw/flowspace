import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useProjectStore, type WorkspaceMember } from '../../stores/projectStore';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  workspaceId: string;
  currentMemberIds: string[];
  onMemberAdded?: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  workspaceId,
  currentMemberIds,
  onMemberAdded
}) => {
  const { fetchWorkspaceMembers, addProjectMember } = useProjectStore();
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const loadMembers = React.useCallback(async () => {
    setLoading(true);
    try {
      const members = await fetchWorkspaceMembers(workspaceId);
      setWorkspaceMembers(members);
    } catch (error) {
      console.error('Error loading workspace members:', error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, fetchWorkspaceMembers]);

  useEffect(() => {
    if (isOpen) {
      Promise.resolve().then(() => {
        loadMembers();
      });
    }
  }, [isOpen, loadMembers]);

  const handleAddMember = async (userId: string) => {
    setAddingId(userId);
    try {
      await addProjectMember(projectId, userId);
      onMemberAdded?.();
      // We don't close immediately to allow adding multiple
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setAddingId(null);
    }
  };

  const filteredMembers = workspaceMembers.filter(member => {
    const profile = member.profiles;
    const nameMatch = profile?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = profile?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return (nameMatch || emailMatch) && !currentMemberIds.includes(member.user_id);
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Project Member">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search workspace members..."
            className="w-full pl-10 pr-4 py-2 bg-surface-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-muted">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading members...</p>
            </div>
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-2/50 border border-transparent hover:border-border hover:bg-surface-2 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                    {member.profiles?.avatar_url ? (
                      <img src={member.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      member.profiles?.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-text-main">{member.profiles?.name || 'Unknown User'}</p>
                    <p className="text-xs text-text-muted">{member.profiles?.email}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={addingId === member.user_id ? "secondary" : "primary"}
                  disabled={addingId === member.user_id}
                  onClick={() => handleAddMember(member.user_id)}
                  className="rounded-lg"
                >
                  {addingId === member.user_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-text-muted">
              <p>{searchQuery ? 'No members found matching your search.' : 'All workspace members are already in this project.'}</p>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddMemberModal;
