import { Route, Routes, useLocation } from "react-router-dom";
import { useRef } from "react";
import "./App.css";
// import Home from './page/Home'
// import Treanding from './page/Treanding'
import Nav from "./components/nav/Nav";
import { useState } from "react";
import Watch from "./page/Watch";
import Sidebar from "./components/Sidebar/Sidebar";
import Feed from "./components/Feed/Feed";
import FirstUploads from "./page/FirstUploads";
import Trend from "./page/Trend";
import NewVideos from "./page/NewVideos";
import HomeGrouped from "./page/HomeGrouped";
import UploadVideo from "./page/UploadVideo";
import Login from "./page/Login/Login";
// import KeyChainLogin from './page/Login/KeyChainLogin'
import KeyChainLogin from "./page/Login/KeyChainLogin";
import LoginNew from "./page/Login/LoginNew";
import { useAppStore } from "./lib/store";
import { useEffect } from "react";
import ProfileNav from "./components/nav/ProfileNav";
import StudioPage from "./components/legacy-studio/StudioPage";
// import StudioPage2 from "./components/legacy-studio/StudioPage";
import CommunitiesRender from "./components/Communities/CommunitiesRender";
import CommunityPage from "./components/Communities/CommunityPage";
import TagFeed from "./page/TagFeed";
import LeaderBoard from "./page/LeaderBoard";
import ProfilePage from "./page/ProfilePage";
import Wallet from "./page/Wallet";
import Testing from "./components/Testingfile/Testing";
import UserProfilePage from "./components/Userprofilepage/UserProfilePage";
import DraftStudio from "./components/studio/DraftStudio";
import EditVideo from "./page/EditVideo";
import ScrollToTop from "./components/ScrollToTop";
import AddAccount_modal from "./components/modal/AddAccount_modal";
import TestingLogin3 from "./page/Login/TestingLogin3";
// import TestingLogin from "./page/Login/TestingLogin";
import AboutPage from "./components/LandingPage/AboutPage";
import { toast, Toaster } from 'sonner'
import Thumbnail from "./components/legacy-studio/Thumbnail";
import Details from "./components/legacy-studio/Details";
import Preview from "./components/legacy-studio/Preview";
import Test from "./page/Test";
// import Email from "./page/Login/Email"
// import AuthCallback from "./page/Login/AuthCallback";
// import {AUTH_JWT_SECRET} from "../src/utils/config";


import { jwtDecode } from "jwt-decode";
import AuthCallback from "./page/Login/AuthCallback";
import NotFound from "./page/NotFound";
import ProfileModal from "./components/modal/ProfileModal";
import HiveImageUploader from "./page/HiveImageUploader";
import { LegacyUploadProvider } from "./context/LegacyUploadContext";
import { HiveAuthProvider } from "./context/HiveAuthContext";
import { AiohaModal, useAioha } from "@aioha/react-ui";
import { KeyTypes, Providers } from "@aioha/aioha";
import '@aioha/react-ui/dist/build.css';
import { LOCAL_STORAGE_ACCESS_TOKEN_KEY, LOCAL_STORAGE_USER_ID_KEY } from "./hooks/localStorageKeys";
import axios from "axios";
import { TVModeProvider, useTVMode } from "./context/TVModeContext";
import ExitDialog from "./components/tv/ExitDialog";

// Inner component that uses TV mode context
function AppContent() {
  const location = useLocation();
  const { initializeAuth, authenticated, LogOut, switchAccount, setUser, user: appUser, initializeTheme } = useAppStore();
  const { aioha, user: aiohaUser } = useAioha();
  const { isTVMode, tvFocusArea, tvNavFocusIndex, tvSidebarFocusIndex, setTvNavFocusIndex, setTvSidebarFocusIndex, tvSidebarVisible, setTvSidebarVisible, sidebarItemCount, showExitDialog, setShowExitDialog } = useTVMode();
  const [sidebar, setSideBar] = useState(true);
  const [profileNavVisible, setProfileNavVisible] = useState(false);

  const [globalCloseRender, setGlobalCloseRender] = useState(false)
  const [toggle, setToggle] = useState(false);
  const [reloadSwitch, setRelaodSwitch] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginProof, setLoginProof] = useState(() => Math.floor(Date.now() / 1000));
  const userWhenModalOpened = useRef(null); // Track user when modal opens
  



  useEffect(() => {
    initializeAuth();
    initializeTheme();
    tokenVaildation()

  }, []);

  // Persist the last visited non-login route so the app can return
  // users to the same page after they sign in.
  useEffect(() => {
    if (!location) return;
    const path = `${location.pathname}${location.search || ''}`;
    // don't overwrite when on login or auth callback routes
    if (path.startsWith('/login') || path.startsWith('/auth/callback') || path.startsWith('/newlogin')) return;
    try {
      sessionStorage.setItem('preLoginPath', path);
    } catch (err) {
      // ignore storage errors
    }
  }, [location]);

  // Watch for aioha user changes and sync with 3Speak
  useEffect(() => {
    const syncAiohaUser = async () => {
      // If aioha user changed and is different from app user
      if (aiohaUser && aiohaUser !== appUser) {
        console.log("Aioha user changed:", aiohaUser, "App user:", appUser);

        // Check if we already have a token for this user (no need to re-authenticate)
        const existingAccounts = JSON.parse(localStorage.getItem("accountsList")) || [];
        const existingAccount = existingAccounts.find(acc => acc.username === aiohaUser);

        if (existingAccount && existingAccount.access_token) {
          // Use existing token - no signing required
          console.log("Using existing token for:", aiohaUser);
          localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, existingAccount.access_token);
          localStorage.setItem(LOCAL_STORAGE_USER_ID_KEY, aiohaUser);
          setUser(aiohaUser);
          initializeAuth();
          setLoginModalOpen(false);
          toast.success(`Switched to ${aiohaUser}`);
        } else {
          // New account - need to sign and get token from backend
          try {
            const proof = Math.floor(Date.now() / 1000);
            const signResult = await aioha.signMessage(`${proof}`, KeyTypes.Posting);

            if (signResult.error) {
              console.error("Sign error:", signResult.error);
              return;
            }

            const data = {
              challenge: signResult.result,
              proof: proof,
              publicKey: signResult.publicKey,
              username: aiohaUser,
            };

            const response = await axios.post(
              'https://studio.3speak.tv/mobile/login',
              data,
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            console.log('Account switch success:', response.data);
            const token = response.data.token;

            localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, token);
            localStorage.setItem(LOCAL_STORAGE_USER_ID_KEY, aiohaUser);

            // Save to accountsList for future switches
            const filtered = existingAccounts.filter(acc => acc.username !== aiohaUser);
            const updated = [...filtered, { username: aiohaUser, access_token: token }];
            localStorage.setItem("accountsList", JSON.stringify(updated));

            setUser(aiohaUser);
            initializeAuth();
            setLoginModalOpen(false);
            toast.success(`Switched to ${aiohaUser}`);
          } catch (err) {
            console.error("Account switch error:", err);
            toast.error("Failed to switch account: " + (err.response?.data?.error || err.message));
          }
        }
      } else if (!aiohaUser && appUser) {
        // Aioha logged out - log out of 3Speak too
        console.log("Aioha logged out, logging out of 3Speak");
        LogOut(appUser);
        toast.success("Logged out successfully");
      }
    };

    syncAiohaUser();
  }, [aiohaUser]);



  const tokenVaildation = ()=>{
    const token = window.localStorage.getItem("access_token")
    if (token && authenticated){
      try {
    const decoded = jwtDecode(token);
    console.log(decoded)

    // exp is in seconds, Date.now() is in ms
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
          // console.warn("Token expired — logging out user");
          toast.error("Secssion expired")
          LogOut(decoded.user_id); // this will already remove the token
          return false;
        }
    return !isExpired;
  } catch (err) {
    console.error("Invalid token:", err);
    return false;
  }
    }

  }

  

  // const closeProfileNav = ()=>{
  //   setProfileNavVisible(!profileNavVisible)
  // }
  const toggleProfileNav = () => {
    setProfileNavVisible((prev) => !prev);
    console.log(profileNavVisible);
  };

  const toggleAddAccount = () => {
    setToggle((prev) => !prev);
  }

  const openLoginModal = () => {
    setLoginProof(Math.floor(Date.now() / 1000)); // Fresh timestamp when modal opens
    userWhenModalOpened.current = aioha.getCurrentUser(); // Save current user when modal opens
    setLoginModalOpen(true);
  }

  // TV Mode: Intercept exit dialog / back button messages when login modal is open
  useEffect(() => {
    if (!loginModalOpen || !isTVMode) return;

    // Intercept messages from parent Tizen wrapper
    const handleMessage = (event) => {
      if (event.data && (event.data.type === 'show-exit-dialog' || event.data.type === 'handle-back-button')) {
        console.log('Login modal intercepting:', event.data.type);
        // Close the login modal instead of showing exit dialog
        setLoginModalOpen(false);
        userWhenModalOpened.current = null;
      }
    };

    // Use capture phase to intercept before TVModeContext
    window.addEventListener('message', handleMessage, true);
    return () => window.removeEventListener('message', handleMessage, true);
  }, [loginModalOpen, isTVMode]);

  // TV Mode: Also handle if exit dialog was already triggered
  useEffect(() => {
    if (loginModalOpen && isTVMode && showExitDialog) {
      // Exit dialog was triggered while login modal is open
      // Close the login modal instead of showing exit dialog
      setShowExitDialog(false);
      setLoginModalOpen(false);
      userWhenModalOpened.current = null;
    }
  }, [loginModalOpen, isTVMode, showExitDialog]);

  // TV Mode: Handle focus and keyboard navigation within login modal
  useEffect(() => {
    if (!loginModalOpen || !isTVMode) return;

    let currentFocusedElement = null;

    // Focus the first provider button when modal opens
    const focusProviderButton = () => {
      // Find provider buttons - they are <a> tags inside <li> elements in a ul with space-y-3 class
      const providerBtns = document.querySelectorAll('ul.space-y-3 li a');
      console.log('Found provider buttons:', providerBtns.length);
      if (providerBtns.length > 0) {
        // Get the first visible button (HiveAuth should be the only one visible in TV mode due to CSS)
        const btn = providerBtns[0];
        btn.setAttribute('tabindex', '0');
        btn.focus();
        btn.style.outline = '3px solid red';
        btn.style.outlineOffset = '2px';
        currentFocusedElement = btn;
        console.log('Focused provider button:', btn);
      }
    };

    // Watch for username input to appear (after selecting provider)
    const observer = new MutationObserver(() => {
      const usernameInput = document.querySelector('input[type="text"], input[placeholder*="username" i]');
      if (usernameInput && document.activeElement !== usernameInput) {
        usernameInput.focus();
        usernameInput.style.outline = '3px solid red';
        usernameInput.style.outlineOffset = '2px';
        currentFocusedElement = usernameInput;
        console.log('Focused username input:', usernameInput);
      }
    });

    // Small delay to ensure modal is rendered
    const focusTimer = setTimeout(() => {
      focusProviderButton();
      // Start observing for DOM changes (username input appearing)
      const modalContainer = document.body;
      observer.observe(modalContainer, { childList: true, subtree: true });
    }, 300);

    // Handle keyboard navigation within the modal
    const handleModalKeyDown = (e) => {
      // Stop propagation to prevent sidebar from handling these keys
      e.stopPropagation();

      // Get all focusable elements in the modal
      const getFocusableElements = () => {
        const providerBtns = Array.from(document.querySelectorAll('ul.space-y-3 li a'));
        const inputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type="hidden"])'));
        const buttons = Array.from(document.querySelectorAll('button[type="submit"], button:not([class*="close"])'));
        return [...providerBtns, ...inputs, ...buttons].filter(el => {
          // Filter out hidden elements
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
      };

      // Arrow key navigation (up/down)
      if (e.keyCode === 38 || e.keyCode === 40) {
        e.preventDefault();
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const currentIndex = focusable.indexOf(document.activeElement);
        let nextIndex;

        if (e.keyCode === 38) {
          // Up arrow
          nextIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
        } else {
          // Down arrow
          nextIndex = currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1;
        }

        const nextElement = focusable[nextIndex];
        if (nextElement) {
          // Remove outline from current
          if (currentFocusedElement) {
            currentFocusedElement.style.outline = '';
            currentFocusedElement.style.outlineOffset = '';
          }
          // Focus and style next
          nextElement.setAttribute('tabindex', '0');
          nextElement.focus();
          nextElement.style.outline = '3px solid red';
          nextElement.style.outlineOffset = '2px';
          currentFocusedElement = nextElement;
        }
        return;
      }

      // Enter key - click the focused element or submit
      if (e.keyCode === 13) {
        const activeEl = document.activeElement;
        // If we're in an input field, find and click the submit button
        if (activeEl && activeEl.tagName === 'INPUT') {
          e.preventDefault();
          // Find the submit/login button - usually a button with type="submit" or containing "login"/"submit" text
          const submitBtn = document.querySelector('button[type="submit"]') ||
                           document.querySelector('button.btn-primary') ||
                           Array.from(document.querySelectorAll('button')).find(btn =>
                             btn.textContent.toLowerCase().includes('login') ||
                             btn.textContent.toLowerCase().includes('submit') ||
                             btn.textContent.toLowerCase().includes('connect')
                           );
          if (submitBtn) {
            submitBtn.click();
          }
          return;
        }
        e.preventDefault();
        if (currentFocusedElement) {
          currentFocusedElement.click();
        }
        return;
      }

      // Close modal on Back/Escape
      if (e.keyCode === 10009 || e.keyCode === 27) {
        e.preventDefault();
        closeLoginModal();
      }
    };

    // Use capture phase to intercept events before they reach other handlers
    document.addEventListener('keydown', handleModalKeyDown, true);

    return () => {
      clearTimeout(focusTimer);
      observer.disconnect();
      document.removeEventListener('keydown', handleModalKeyDown, true);
    };
  }, [loginModalOpen, isTVMode]);

  const closeLoginModal = async () => {
    setLoginModalOpen(false);

    // Check if aioha user changed while modal was open (e.g., switch user)
    const currentAiohaUser = aioha.getCurrentUser();
    const previousUser = userWhenModalOpened.current;

    // Compare against user when modal was opened (more reliable than appUser due to race conditions)
    if (currentAiohaUser && currentAiohaUser !== previousUser) {
      console.log("User changed while modal was open:", currentAiohaUser, "vs", previousUser);

      // Check if we already have a token for this user (no need to re-authenticate)
      const existingAccounts = JSON.parse(localStorage.getItem("accountsList")) || [];
      const existingAccount = existingAccounts.find(acc => acc.username === currentAiohaUser);

      if (existingAccount && existingAccount.access_token) {
        // Use existing token - no signing required
        console.log("Using existing token for:", currentAiohaUser);
        localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, existingAccount.access_token);
        localStorage.setItem(LOCAL_STORAGE_USER_ID_KEY, currentAiohaUser);
        setUser(currentAiohaUser);
        initializeAuth();
        toast.success(`Switched to ${currentAiohaUser}`);
      } else {
        // New account - need to sign and get token from backend
        try {
          const proof = Math.floor(Date.now() / 1000);
          const signResult = await aioha.signMessage(`${proof}`, KeyTypes.Posting);

          if (signResult.error) {
            console.error("Sign error:", signResult.error);
            return;
          }

          const data = {
            challenge: signResult.result,
            proof: proof,
            publicKey: signResult.publicKey,
            username: currentAiohaUser,
          };

          const response = await axios.post(
            'https://studio.3speak.tv/mobile/login',
            data,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          console.log('Account switch success:', response.data);
          const token = response.data.token;

          localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, token);
          localStorage.setItem(LOCAL_STORAGE_USER_ID_KEY, currentAiohaUser);

          // Save to accountsList for future switches
          const filtered = existingAccounts.filter(acc => acc.username !== currentAiohaUser);
          const updated = [...filtered, { username: currentAiohaUser, access_token: token }];
          localStorage.setItem("accountsList", JSON.stringify(updated));

          setUser(currentAiohaUser);
          initializeAuth();
          toast.success(`Switched to ${currentAiohaUser}`);
        } catch (err) {
          console.error("Account switch error:", err);
          toast.error("Failed to switch account: " + (err.response?.data?.error || err.message));
        }
      }
    } else if (!currentAiohaUser && previousUser) {
      // User logged out via modal
      console.log("User logged out via modal");
      LogOut(previousUser);
      toast.success("Logged out successfully");
    }

    // Clear the ref
    userWhenModalOpened.current = null;
  }

  // Handle login callback from AiohaModal
  const handleAiohaLogin = async (loginResult) => {
    console.log("Aioha login result:", loginResult);

    if (!loginResult || loginResult.error) {
      toast.error("Login failed: " + (loginResult?.error || "Unknown error"));
      return;
    }

    try {
      // Send to 3Speak backend for JWT token
      // Use the same proof that was signed in loginOptions.msg
      const data = {
        challenge: loginResult.result,
        proof: loginProof,
        publicKey: loginResult.publicKey,
        username: loginResult.username,
      };

      const response = await axios.post(
        'https://studio.3speak.tv/mobile/login',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Login Success:', response.data);
      const token = response.data.token;
      localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, token);
      localStorage.setItem(LOCAL_STORAGE_USER_ID_KEY, loginResult.username);
      initializeAuth();
      setLoginModalOpen(false);
      toast.success("Login successful!");
    } catch (err) {
      console.error("3Speak auth error:", err);
      toast.error("Login failed: " + (err.response?.data?.error || err.message));
    }
  }

  return (
    <HiveAuthProvider>
    <LegacyUploadProvider>
    <div onClick={()=> {setGlobalCloseRender(true)}}>
      <Toaster richColors position="top-right" />
      {/* Hide Nav in TV mode - navigation is in sidebar */}
      {!isTVMode && (
        <Nav
          setSideBar={setSideBar}
          toggleProfileNav={toggleProfileNav}
          globalClose={globalCloseRender}
          setGlobalClose={setGlobalCloseRender}
          openLoginModal={openLoginModal}
          tvNavFocusIndex={tvFocusArea === 'nav' ? tvNavFocusIndex : -1}
          setTvNavFocusIndex={setTvNavFocusIndex}
        />
      )}
      <div>
        {/* Show Sidebar - hidden by default in TV mode, shown when navigating left */}
        <Sidebar
          sidebar={isTVMode ? tvSidebarVisible : sidebar}
          tvSidebarFocusIndex={tvFocusArea === 'sidebar' ? tvSidebarFocusIndex : -1}
          setTvSidebarFocusIndex={setTvSidebarFocusIndex}
          onTvSidebarAction={(action) => {
            if (action === 'logout') {
              LogOut();
            }
          }}
          onTvLogin={openLoginModal}
        />
        <div className={`container ${sidebar ? "" : "large-container"}${isTVMode && tvSidebarVisible ? ' tv-sidebar-open' : ''}`}>
          <ScrollToTop />
          {/* <Toaster richColors position="top-right" /> */}
          <Routes>
            <Route path="/" element={<HomeGrouped />} />
            <Route path="/home-feed" element={<Feed />} />
            <Route path="/watch" element={<Watch />} />
            <Route path="/upload" element={<UploadVideo />} />
            <Route path="/firstupload" element={<FirstUploads />} />
            <Route path="/trend" element={<Trend />} />
            <Route path="/new" element={<NewVideos />} />
            <Route path="/login" element={<KeyChainLogin />} />
             <Route path="/auth/callback" element={<AuthCallback />} />
            {/* <Route path="/email" element={<Email/>} />  */}
            <Route path="/newlogin" element={<LoginNew />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/studio/thumbnail" element={<Thumbnail />} />
            <Route path="/studio/details" element={<Details />} />
            <Route path="/studio/preview" element={<Preview />} />
            {/* <Route path="/studio2" element={<StudioPage2 />} /> */}
            <Route path="/draft" element={<DraftStudio />} />
            <Route path="/editvideo/:d" element={<EditVideo />} />
            <Route path="/communities" element={<CommunitiesRender />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/community/:communityName"
              element={<CommunityPage />}
            />
            <Route path="/t/:tag" element={<TagFeed />} />
            <Route path="/leaderboard" element={<LeaderBoard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/p/:user" element={<UserProfilePage />} />
            <Route path="/wallet/:user" element={<Wallet />} />
            <Route path="/test" element={<ProfileModal />} />
            <Route path="/image" element={<HiveImageUploader />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {!isTVMode && (
          <>
            <ProfileNav isVisible={profileNavVisible} onclose={toggleProfileNav} toggleAddAccount={toggleAddAccount} openLoginModal={openLoginModal} />
            {toggle && <AddAccount_modal close={toggleAddAccount} isOpen={toggle} /> }
          </>
        )}
        <AiohaModal
          displayed={loginModalOpen}
          onLogin={handleAiohaLogin}
          onClose={closeLoginModal}
          loginTitle="Login to 3Speak"
          loginOptions={{
            msg: `${loginProof}`,
            keyType: KeyTypes.Posting
          }}
          forceShowProviders={isTVMode ? [Providers.HiveAuth] : undefined}
        />
      </div>
      {/* Exit confirmation dialog for TV mode */}
      {isTVMode && <ExitDialog />}
    </div>

    </LegacyUploadProvider>
    </HiveAuthProvider>
  );
}

// Main App component wraps with TVModeProvider
function App() {
  return (
    <TVModeProvider>
      <AppContent />
    </TVModeProvider>
  );
}

export default App;
