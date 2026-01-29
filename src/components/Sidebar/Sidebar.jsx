import { useState, useRef, useEffect } from "react";
import { RiProfileLine } from "react-icons/ri";
import "./Sidebar.scss";
import apple_icon from "../../assets/image/app-store.png";
import play_store from "../../assets/image/playstore.png";
import logo from "../../assets/image/3S_logo.svg";
import logoDark from "../../assets/image/3S_logodark.png";
import { PiUserSwitchBold } from "react-icons/pi";
import { HiInformationCircle } from "react-icons/hi";
import {
  MdOutlineDashboard,
  MdOutlineDynamicFeed,
  MdOutlineLeaderboard,
} from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { LuNewspaper } from "react-icons/lu";
import { FaFire, FaRegSmile } from "react-icons/fa";
import { IoCloudUploadSharp, IoLogInOutline, IoLogOutOutline } from "react-icons/io5";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../lib/store";
import { useTVMode } from "../../context/TVModeContext";

const Sidebar = ({ sidebar, tvSidebarFocusIndex = -1, setTvSidebarFocusIndex, onTvSidebarNavigate, onTvSidebarAction, onTvLogin }) => {
  const { authenticated, theme, toggleTheme, user } = useAppStore();
  const { isTVMode, setSidebarItemCount } = useTVMode();
  const navigate = useNavigate();
  const [tvSearchTerm, setTvSearchTerm] = useState('');
  const tvSearchInputRef = useRef(null);

  // TV mode: Index 0 is the search field
  const TV_SEARCH_INDEX = 0;

  // Build list of sidebar items based on authentication state
  const sidebarItems = [
    { to: "/", label: "Home", icon: <MdOutlineDashboard className="icon" /> },
    ...(authenticated ? [{ to: "/studio", label: "Upload Video", icon: <IoCloudUploadSharp className="icon" /> }] : []),
    { to: "/firstupload", label: "First Uploads", icon: <FaRegSmile className="icon" /> },
    { to: "/trend", label: "Trending Content", icon: <FaFire className="icon" /> },
    { to: "/new", label: "New Content", icon: <LuNewspaper className="icon" /> },
    { to: "/communities", label: "Communities", icon: <MdOutlineDynamicFeed className="icon" /> },
    { to: "/about", label: "About 3speak", icon: <HiInformationCircle className="icon" /> },
  ];

  // TV mode action items (account/login and dark mode)
  const tvActionItems = [
    ...(authenticated
      ? [{
          action: "account",
          label: user || "Account",
          icon: <img
            src={`https://images.hive.blog/u/${user}/avatar`}
            alt={user}
            className="tv-account-avatar"
            style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', marginRight: 15 }}
          />
        }]
      : [{ action: "login", label: "Log In", icon: <IoLogInOutline className="icon" /> }]
    ),
    {
      action: "toggle-theme",
      label: theme === 'dark' ? "Light Mode" : "Dark Mode",
      icon: theme === 'dark' ? <MdLightMode className="icon" /> : <MdDarkMode className="icon" />
    },
  ];

  // Total focusable items in TV mode: search + nav items + action items
  const totalTvItems = 1 + sidebarItems.length + tvActionItems.length;

  // Update the sidebar item count in context
  useEffect(() => {
    if (isTVMode) {
      setSidebarItemCount(totalTvItems);
    }
  }, [isTVMode, totalTvItems, setSidebarItemCount]);

  // Focus/blur the search input based on TV mode focus index
  useEffect(() => {
    if (isTVMode && tvSearchInputRef.current) {
      if (tvSidebarFocusIndex === TV_SEARCH_INDEX) {
        tvSearchInputRef.current.focus();
      } else {
        // Blur search input when focus moves to other items
        tvSearchInputRef.current.blur();
      }
    }
  }, [isTVMode, tvSidebarFocusIndex]);

  // Handle TV search submission
  const handleTvSearch = () => {
    if (tvSearchTerm.trim()) {
      // Navigate to user profile or community based on search term
      navigate(`/p/${tvSearchTerm.trim()}`);
      setTvSearchTerm('');
      if (onTvSidebarNavigate) onTvSidebarNavigate(`/p/${tvSearchTerm.trim()}`);
    }
  };

  const handleItemClick = (to) => {
    if (isTVMode && onTvSidebarNavigate) {
      onTvSidebarNavigate(to);
    }
  };

  const handleTvActionClick = (item) => {
    if (item.action === "toggle-theme") {
      toggleTheme();
    } else if (item.action === "login" || item.action === "account") {
      // Open the Aioha modal for login or account management
      if (onTvLogin) onTvLogin();
    }
  };

  return (
    <div className={`sidebar ${sidebar ? "" : "small-sidebar"}${isTVMode && tvSidebarFocusIndex >= 0 ? ' tv-sidebar-active' : ''}`}>
      {/* TV Mode: Logo at the top */}
      {isTVMode && (
        <div className="tv-logo-section">
          <img
            src={theme === 'dark' ? logoDark : logo}
            alt="3Speak"
            className="tv-logo"
          />
        </div>
      )}

      {/* TV Mode: Search field */}
      {isTVMode && (
        <div className="tv-search-section">
          <div
            className={`tv-search-wrapper${tvSidebarFocusIndex === TV_SEARCH_INDEX ? ' tv-focused' : ''}`}
            data-tv-sidebar-focusable="true"
            data-tv-sidebar-index={TV_SEARCH_INDEX}
          >
            <CiSearch className="tv-search-icon" size={20} />
            <input
              ref={tvSearchInputRef}
              type="text"
              placeholder="Search users..."
              value={tvSearchTerm}
              onChange={(e) => setTvSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTvSearch();
                }
              }}
              className="tv-search-input"
            />
          </div>
        </div>
      )}

      <div className="shortcut-links">
        {sidebarItems.map((item, index) => {
          // In TV mode, index is offset by 1 for the search field
          const tvIndex = isTVMode ? index + 1 : index;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`side-link${isTVMode && tvSidebarFocusIndex === tvIndex ? ' tv-focused' : ''}`}
              data-tv-sidebar-focusable="true"
              data-tv-sidebar-index={tvIndex}
              onClick={() => handleItemClick(item.to)}
            >
              {item.icon} <span>{item.label}</span>
            </Link>
          );
        })}

        <hr />
      </div>

      {/* TV Mode: Show Login/Logout and Dark Mode instead of Download */}
      {isTVMode ? (
        <div className="subscibed-list tv-actions">
          <h3>Account</h3>
          {tvActionItems.map((item, index) => {
            // Offset by 1 (search) + sidebarItems.length
            const tvIndex = 1 + sidebarItems.length + index;
            return (
              <div
                key={item.action}
                className={`side-link tv-action-item${tvSidebarFocusIndex === tvIndex ? ' tv-focused' : ''}`}
                data-tv-sidebar-focusable="true"
                data-tv-sidebar-index={tvIndex}
                onClick={() => handleTvActionClick(item)}
              >
                {item.icon} <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="subscibed-list">
          <h3>Download</h3>
          <a href="https://apps.apple.com/gb/app/3speak/id1614771373" target="_blank" rel="noopener noreferrer" className="side-link">
            <img src={apple_icon} alt="" className="store-icon" />{" "}
            <span>Apple Store</span>
          </a>
          <a href="https://play.google.com/store/apps/details?id=tv.threespeak.app" target="_blank" rel="noopener noreferrer" className="side-link">
            <img src={play_store} alt="" className="store-icon" />{" "}
            <span>Play Store</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
