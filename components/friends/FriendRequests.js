// components/friends/FriendRequests.js
import { useState, useEffect } from 'react';
import { getPendingFriendRequests, acceptFriendRequest, rejectFriendRequest } from '../../lib/firestore';
import ProfileCard from './ProfileCard';
import styles from './FriendRequests.module.css';

export default function FriendRequests({ currentUser, onRequestsUpdated }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadRequests();
  }, [currentUser]);

  const loadRequests = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const pendingRequests = await getPendingFriendRequests(currentUser.uid);
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (friendUid) => {
    setActionLoading(prev => ({ ...prev, [friendUid]: 'accepting' }));
    
    try {
      const success = await acceptFriendRequest(currentUser.uid, friendUid);
      if (success) {
        // Remove from requests list
        setRequests(prev => prev.filter(req => req.friendUid !== friendUid));
        if (onRequestsUpdated) {
          onRequestsUpdated();
        }
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [friendUid]: null }));
    }
  };

  const handleReject = async (friendUid) => {
    setActionLoading(prev => ({ ...prev, [friendUid]: 'rejecting' }));
    
    try {
      const success = await rejectFriendRequest(currentUser.uid, friendUid);
      if (success) {
        // Remove from requests list
        setRequests(prev => prev.filter(req => req.friendUid !== friendUid));
        if (onRequestsUpdated) {
          onRequestsUpdated();
        }
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [friendUid]: null }));
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading friend requests...</p>
      </div>
    );
  }

  return (
    <div className={styles.friendRequests}>
      <h3>
        <i className="fas fa-user-clock"></i>
        Friend Requests
        {requests.length > 0 && (
          <span className={styles.badge}>{requests.length}</span>
        )}
      </h3>

      {requests.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="fas fa-inbox"></i>
          <p>No pending friend requests</p>
          <small>When people send you friend requests, they'll appear here</small>
        </div>
      ) : (
        <div className={styles.requestsList}>
          {requests.map(request => (
            <div key={request.id} className={styles.requestItem}>
              <div className={styles.requestProfile}>
                <ProfileCard user={request.profile} />
              </div>
              
              <div className={styles.requestActions}>
                <div className={styles.requestInfo}>
                  <p className={styles.requestText}>
                    <strong>@{request.profile.username}</strong> wants to be your friend
                  </p>
                  <small className={styles.requestDate}>
                    {request.addedAt?.toDate ? 
                      request.addedAt.toDate().toLocaleDateString() : 
                      'Recently'
                    }
                  </small>
                </div>
                
                <div className={styles.actionButtons}>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => handleAccept(request.friendUid)}
                    disabled={actionLoading[request.friendUid]}
                  >
                    {actionLoading[request.friendUid] === 'accepting' ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Accepting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Accept
                      </>
                    )}
                  </button>
                  
                  <button
                    className={styles.rejectBtn}
                    onClick={() => handleReject(request.friendUid)}
                    disabled={actionLoading[request.friendUid]}
                  >
                    {actionLoading[request.friendUid] === 'rejecting' ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times"></i>
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
