import React, { useEffect, useState, useCallback } from 'react';
import { useTVMode } from '../../context/TVModeContext';
import './TVContextMenu.scss';

/**
 * TV Context Menu component for the Watch page
 * Shows options like follow/unfollow, vote, comment, expand description
 */
function TVContextMenu({
  isOpen,
  onClose,
  onFollow,
  onVote,
  onJumpToComment,
  onExpandDescription,
  isFollowing = false,
  creatorName = 'creator'
}) {
  const { isTVMode } = useTVMode();
  const [focusedIndex, setFocusedIndex] = useState(0);

  const menuItems = [
    {
      id: 'follow',
      label: isFollowing ? `Unfollow @${creatorName}` : `Follow @${creatorName}`,
      icon: isFollowing ? '👤' : '➕',
      action: onFollow
    },
    {
      id: 'vote',
      label: 'Vote this video',
      icon: '👍',
      action: onVote
    },
    {
      id: 'comment',
      label: 'Write a comment',
      icon: '💬',
      action: onJumpToComment
    },
    {
      id: 'description',
      label: 'Show description',
      icon: '📄',
      action: onExpandDescription
    }
  ];

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen || !isTVMode) return;

    const handleKeyDown = (event) => {
      switch (event.keyCode) {
        case 38: // Up
          setFocusedIndex(prev => prev > 0 ? prev - 1 : menuItems.length - 1);
          event.preventDefault();
          event.stopPropagation();
          break;

        case 40: // Down
          setFocusedIndex(prev => prev < menuItems.length - 1 ? prev + 1 : 0);
          event.preventDefault();
          event.stopPropagation();
          break;

        case 13: // Enter
          const selectedItem = menuItems[focusedIndex];
          if (selectedItem?.action) {
            selectedItem.action();
          }
          onClose();
          event.preventDefault();
          event.stopPropagation();
          break;

        case 10009: // Samsung Back
        case 27: // Escape
        case 10135: // Samsung Tools/More (close menu)
        case 457: // Info key
          onClose();
          event.preventDefault();
          event.stopPropagation();
          break;

        default:
          break;
      }
    };

    // Use capture phase to intercept before other handlers
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, isTVMode, focusedIndex, menuItems, onClose]);

  // Reset focus when menu opens
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="tv-context-menu-overlay" onClick={onClose}>
      <div className="tv-context-menu" onClick={e => e.stopPropagation()}>
        <h3>Options</h3>
        <ul className="tv-context-menu-items">
          {menuItems.map((item, index) => (
            <li
              key={item.id}
              className={`tv-context-menu-item ${focusedIndex === index ? 'tv-focused' : ''}`}
              onClick={() => {
                if (item.action) item.action();
                onClose();
              }}
            >
              <span className="tv-context-menu-icon">{item.icon}</span>
              <span className="tv-context-menu-label">{item.label}</span>
            </li>
          ))}
        </ul>
        <div className="tv-context-menu-hint">
          Press Back to close
        </div>
      </div>
    </div>
  );
}

export default TVContextMenu;
