import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExistingUserSummary, searchUsers } from '@/lib/api';

interface ExistingUsersPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchCityId?: number;
  initialSelectedUserIds: number[];
  onApply: (users: ExistingUserSummary[]) => void;
}

export function ExistingUsersPickerModal({
  isOpen,
  onClose,
  matchCityId,
  initialSelectedUserIds,
  onApply,
}: ExistingUsersPickerModalProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<ExistingUserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedUserIds);
  // Keep track of all selected user objects (not just IDs) so we can send them even if not in current search
  const [selectedUsersMap, setSelectedUsersMap] = useState<Map<number, ExistingUserSummary>>(new Map());

  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds(initialSelectedUserIds);
    // Reset selected users map when modal opens
    setSelectedUsersMap(new Map());
  }, [isOpen, initialSelectedUserIds]);

  const loadUsers = async (reset = false) => {
    setLoading(true);
    try {
      const nextPage = reset ? 1 : page;
      const trimmedQuery = query.trim();
      const res = await searchUsers({
        // City filtering removed - search all users regardless of city
        query: trimmedQuery || undefined,
        page: nextPage,
        limit: 25,
      });

      console.log('[ExistingUsersPickerModal] searchUsers response', {
        query: trimmedQuery,
        page: nextPage,
        total: res?.data?.pagination?.total,
        count: res?.data?.users?.length,
        sample: res?.data?.users?.slice(0, 3),
      });

      if (res.success) {
        const fetched = res.data.users;
        // Trust backend filtering; do not re-filter on the client
        setTotal(res.data.pagination.total);
        if (reset) {
          setUsers(fetched);
          setPage(1);
        } else {
          setUsers(prev => [...prev, ...fetched]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(true);
  };

  const toggleSelection = (user: ExistingUserSummary) => {
    const id = user.id;
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        // Remove from selection
        setSelectedUsersMap(prevMap => {
          const next = new Map(prevMap);
          next.delete(id);
          return next;
        });
        return prev.filter(x => x !== id);
      } else {
        // Add to selection - store the full user object
        setSelectedUsersMap(prevMap => {
          const next = new Map(prevMap);
          next.set(id, user);
          return next;
        });
        return [...prev, id];
      }
    });
  };

  const handleLoadMore = () => {
    if (users.length < total && !loading) {
      setPage(p => p + 1);
      loadUsers(false);
    }
  };

  const handleApply = () => {
    // Get all selected users from the map (includes users from previous searches)
    const selectedUsers = Array.from(selectedUsersMap.values());
    onApply(selectedUsers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-gray-900 rounded-2xl shadow-xl border border-gray-700 w-full max-w-3xl max-h-[80vh] h-full flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Add existing players</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-800">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name or phone"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              />
              <Button type="submit" disabled={loading}>
                Search
              </Button>
            </form>
          </div>

          <div className="p-4 overflow-y-auto flex-1 space-y-2">
            {users.map(user => {
              const pn = user.phoneNumber || '';
              const maskedPhone =
                pn && pn.length >= 10
                  ? `${pn.slice(0, 2)}xxxx${pn.slice(-4)}`
                  : pn || 'Unknown';

              const checked = selectedIds.includes(user.id);

              return (
                <label
                  key={user.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm cursor-pointer ${
                    checked
                      ? 'bg-orange-500/20 border-orange-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelection(user)}
                      className="accent-orange-500"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {maskedPhone}
                        {user.city?.name ? ` · ${user.city.name}` : ''}
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}

            {users.length < total && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  Load more
                </Button>
              </div>
            )}

            {users.length === 0 && !loading && (
              <p className="text-sm text-gray-400 text-center">
                {query.trim()
                  ? 'No players found for this search.'
                  : 'Start by searching for players by name or phone.'}
              </p>
            )}
          </div>

          <div className="p-4 border-t border-gray-700 flex gap-2">
            <Button className="flex-1" onClick={handleApply} disabled={selectedIds.length === 0}>
              Add &amp; close
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}


