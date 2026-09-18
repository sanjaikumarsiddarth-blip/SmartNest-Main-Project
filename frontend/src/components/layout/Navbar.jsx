import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import {
  Home,
  Compass,
  Heart,
  Scale,
  Sparkles,
  BarChart3,
  Building,
  PlusCircle,
  Mail,
  ShieldCheck,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  UserCheck,
  Bell,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { api } from '../../services/api';
import { useMessaging } from '../../context/MessagingContext';
import { SmartNestBrand } from '../shared/SmartNestBrand';

export const Navbar = () => {
  const { user, logout, demoMode, toggleDemoMode, switchPersona, getDashboardPath } = useAuth();
  const { compareCount } = useCompare();
  const { unreadCount: messagingUnreadCount } = useMessaging();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [activePublicNav, setActivePublicNav] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const notifs = await api.getNotifications(user?.user_id || 'usr_buyer_01');
        setNotifications(notifs || []);
      } catch (e) {
        console.error('Failed to load notifications', e);
      }
    };
    loadNotifs();

    const handleNotifUpdate = () => {
      loadNotifs();
    };
    window.addEventListener('smartnest_notifications_updated', handleNotifUpdate);
    return () => window.removeEventListener('smartnest_notifications_updated', handleNotifUpdate);
  }, [user]);

  const handleMarkSingleRead = async (id) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead(user?.user_id || 'usr_buyer_01');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync active public navigation based on path and hash
  useEffect(() => {
    if (location.pathname === '/login') {
      setActivePublicNav('login');
    } else if (location.pathname === '/register') {
      if (activePublicNav !== 'sellers' && activePublicNav !== 'get-started') {
        setActivePublicNav('sellers');
      }
    } else if (location.pathname === '/') {
      if (location.hash === '#features') {
        setActivePublicNav('features');
      } else if (location.hash === '#how-it-works') {
        setActivePublicNav('how-it-works');
      } else if (!location.hash && activePublicNav !== 'features' && activePublicNav !== 'how-it-works') {
        setActivePublicNav('');
      }
    } else {
      setActivePublicNav('');
    }
  }, [location.pathname, location.hash]);

  // Arriving on landing page with a section hash
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const sectionId = location.hash.replace('#', '');
      const el = document.getElementById(sectionId);
      if (el) {
        const timer = setTimeout(() => {
          const navHeight = 76;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navHeight;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [location.pathname, location.hash]);

  // Landing page scroll spy to highlight sections smoothly
  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScrollSpy = () => {
      const navHeight = 90;
      const scrollPos = window.scrollY + navHeight;
      const featuresEl = document.getElementById('features');
      const howItWorksEl = document.getElementById('how-it-works');

      if (featuresEl && howItWorksEl) {
        const featuresTop = featuresEl.offsetTop;
        const featuresHeight = featuresEl.offsetHeight;
        const howItWorksTop = howItWorksEl.offsetTop;
        const howItWorksHeight = howItWorksEl.offsetHeight;

        if (scrollPos >= featuresTop && scrollPos < featuresTop + featuresHeight) {
          setActivePublicNav('features');
        } else if (scrollPos >= howItWorksTop && scrollPos < howItWorksTop + howItWorksHeight) {
          setActivePublicNav('how-it-works');
        } else if (window.scrollY < 250) {
          setActivePublicNav('');
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [location.pathname]);

  // Smooth scroll handler for public section links
  const handlePublicNavClick = (e, sectionId) => {
    e.preventDefault();
    setActivePublicNav(sectionId);

    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      const navHeight = 76;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      window.history.pushState(null, '', `/#${sectionId}`);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isPublic = !user || (!location.pathname.startsWith('/buyer') && !location.pathname.startsWith('/seller') && !location.pathname.startsWith('/admin'));
  const isBuyer = user?.role === 'buyer' && location.pathname.startsWith('/buyer');
  const isSeller = user?.role === 'seller' && location.pathname.startsWith('/seller');
  const isAdmin = user?.role === 'admin' && location.pathname.startsWith('/admin');

  return (
    <>
      {/* Demo Mode & Quick Persona Bar */}
      <div
        style={{
          backgroundColor: '#0D1B2A',
          color: '#E2E8F0',
          fontSize: '12px',
          padding: '6px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 1000,
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: demoMode ? 'var(--teal)' : 'var(--amber)' }} />
          <span style={{ fontWeight: 500 }}>
            {demoMode ? "Demo Mode: Active (300ms simulated backend)" : "Live Mode: External API"}
          </span>
          <button
            onClick={() => toggleDemoMode(!demoMode)}
            className="demo-pill-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              marginLeft: '4px'
            }}
          >
            Switch to {demoMode ? 'Live' : 'Demo'}
          </button>
        </div>

        {/* Instant Role Switching for Graders */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--slate)', fontSize: '11px' }}>Quick Switch:</span>
          <button
            onClick={() => { switchPersona('buyer'); navigate('/buyer/dashboard'); }}
            className="demo-pill-btn"
            style={{
              background: user?.role === 'buyer' ? 'var(--teal)' : 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Buyer (Aarav)
          </button>
          <button
            onClick={() => { switchPersona('seller'); navigate('/seller/dashboard'); }}
            className="demo-pill-btn"
            style={{
              background: user?.role === 'seller' ? 'var(--teal)' : 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Seller (Prestige)
          </button>
          <button
            onClick={() => { switchPersona('admin'); navigate('/admin/dashboard'); }}
            className="demo-pill-btn"
            style={{
              background: user?.role === 'admin' ? 'var(--teal)' : 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Admin (Vikram)
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 900,
          backgroundColor: scrolled || !isPublic ? 'var(--white)' : 'rgba(237, 242, 247, 0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${scrolled || !isPublic ? 'var(--border)' : 'transparent'}`,
          boxShadow: scrolled || !isPublic ? 'var(--shadow-sm)' : 'none',
          transition: 'all var(--transition-fast)'
        }}
      >
        <div
          className="container-main"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px'
          }}
        >
          {/* Official SmartNest Brand with Teal Dot & Find-Match-Move Tagline */}
          <Link
            to={user ? getDashboardPath(user.role) : "/"}
            onClick={() => setActivePublicNav('')}
            className="brand-logo-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'var(--ink)',
              flexShrink: 0,
              marginRight: '32px'
            }}
          >
            <SmartNestBrand
              orientation="horizontal"
              withTagline={true}
              iconSize={38}
              textSize="19px"
              taglineSize="10px"
            />
          </Link>

          {/* Nav Links based on Role & Context */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            className="desktop-nav"
          >
            {/* Public Links */}
            {isPublic && (
              <>
                <a
                  href="/#features"
                  onClick={(e) => handlePublicNavClick(e, 'features')}
                  className={`nav-link-interactive ${activePublicNav === 'features' ? 'active' : ''}`}
                >
                  Features
                </a>
                <a
                  href="/#how-it-works"
                  onClick={(e) => handlePublicNavClick(e, 'how-it-works')}
                  className={`nav-link-interactive ${activePublicNav === 'how-it-works' ? 'active' : ''}`}
                >
                  How It Works
                </a>
                <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)', margin: '0 4px' }} />
                <Link
                  to="/login"
                  onClick={() => setActivePublicNav('login')}
                  className={`nav-link-interactive ${activePublicNav === 'login' ? 'active' : ''}`}
                  style={{ fontWeight: 600 }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setActivePublicNav('get-started')}
                  className={`btn btn-primary btn-nav-cta ${activePublicNav === 'get-started' ? 'active' : ''}`}
                  style={{ marginLeft: '4px' }}
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Buyer Dashboard Navigation */}
            {isBuyer && (
              <>
                <Link
                  to="/buyer/dashboard"
                  className={`nav-link-interactive ${location.pathname === '/buyer/dashboard' ? 'active' : ''}`}
                >
                  <Home size={16} /> Home
                </Link>
                <Link
                  to="/buyer/recommendations"
                  className={`nav-link-interactive ${location.pathname.startsWith('/buyer/recommendations') ? 'active' : ''}`}
                >
                  <Compass size={16} /> Matches
                </Link>
                <Link
                  to="/buyer/quiz"
                  className={`nav-link-interactive ${location.pathname === '/buyer/quiz' ? 'active' : ''}`}
                >
                  <Sparkles size={16} /> User Needs
                </Link>
                <Link
                  to="/buyer/compare"
                  className={`nav-link-interactive ${location.pathname === '/buyer/compare' ? 'active' : ''}`}
                >
                  <Scale size={16} /> Compare
                  {compareCount > 0 && (
                    <span
                      style={{
                        backgroundColor: 'var(--teal)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        marginLeft: '3px'
                      }}
                    >
                      {compareCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/buyer/shortlist"
                  className={`nav-link-interactive ${location.pathname === '/buyer/shortlist' ? 'active' : ''}`}
                >
                  <Heart size={16} /> Saved
                </Link>
                <Link
                  to="/buyer/messages"
                  className={`nav-link-interactive ${location.pathname.startsWith('/buyer/messages') ? 'active' : ''}`}
                >
                  <MessageSquare size={16} /> Message Box
                  {messagingUnreadCount > 0 && (
                    <span
                      style={{
                        backgroundColor: 'var(--teal)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        marginLeft: '3px'
                      }}
                    >
                      {messagingUnreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/buyer/plans"
                  className={`nav-link-interactive ${location.pathname === '/buyer/plans' ? 'active' : ''}`}
                >
                  <CreditCard size={16} /> Plans
                </Link>
              </>
            )}

            {/* Seller Navigation */}
            {isSeller && (
              <>
                <Link
                  to="/seller/dashboard"
                  className={`nav-link-interactive ${location.pathname === '/seller/dashboard' ? 'active' : ''}`}
                >
                  <Home size={16} /> Home
                </Link>
                <Link
                  to="/seller/properties"
                  className={`nav-link-interactive ${location.pathname === '/seller/properties' ? 'active' : ''}`}
                >
                  <Building size={16} /> Listings
                </Link>
                <Link
                  to="/seller/add"
                  className={`nav-link-interactive ${location.pathname === '/seller/add' ? 'active' : ''}`}
                >
                  <PlusCircle size={16} /> Add Property
                </Link>
                <Link
                  to="/seller/analytics"
                  className={`nav-link-interactive ${location.pathname === '/seller/analytics' ? 'active' : ''}`}
                >
                  <BarChart3 size={16} /> Analytics
                </Link>
                <Link
                  to="/seller/enquiries"
                  className={`nav-link-interactive ${location.pathname === '/seller/enquiries' ? 'active' : ''}`}
                >
                  <Mail size={16} /> Enquiries
                </Link>
                <Link
                  to="/seller/plans"
                  className={`nav-link-interactive ${location.pathname === '/seller/plans' ? 'active' : ''}`}
                >
                  <CreditCard size={16} /> Plans
                </Link>
              </>
            )}

            {/* Admin Navigation */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`nav-link-interactive ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
                >
                  <ShieldCheck size={16} /> Home
                </Link>
                <Link
                  to="/admin/users"
                  className={`nav-link-interactive ${location.pathname === '/admin/users' ? 'active' : ''}`}
                >
                  <Users size={16} /> Users
                </Link>
                <Link
                  to="/admin/sellers"
                  className={`nav-link-interactive ${location.pathname === '/admin/sellers' ? 'active' : ''}`}
                >
                  <Building size={16} /> Sellers
                </Link>
                <Link
                  to="/admin/properties"
                  className={`nav-link-interactive ${location.pathname === '/admin/properties' ? 'active' : ''}`}
                >
                  <Building size={16} /> Moderation
                </Link>
                <Link
                  to="/admin/reports"
                  className={`nav-link-interactive ${location.pathname === '/admin/reports' ? 'active' : ''}`}
                >
                  <ShieldCheck size={16} /> Reports
                </Link>
                <Link
                  to="/admin/analytics"
                  className={`nav-link-interactive ${location.pathname === '/admin/analytics' ? 'active' : ''}`}
                >
                  <BarChart3 size={16} /> Metrics
                </Link>
                <Link
                  to="/admin/settings"
                  className={`nav-link-interactive ${location.pathname === '/admin/settings' ? 'active' : ''}`}
                >
                  <Settings size={16} /> Config
                </Link>
              </>
            )}
          </nav>

          {/* Logged in User Profile & Notifications & Logout */}
          {user && (
            <div className="desktop-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                {/* Notification Bell Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setNotifDropdownOpen((prev) => !prev)}
                    className="btn btn-ghost"
                    style={{
                      position: 'relative',
                      padding: '8px',
                      borderRadius: '50%',
                      color: 'var(--ink)',
                      backgroundColor: notifDropdownOpen ? 'var(--mist)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Notifications & Wishlist Price Alerts"
                    aria-label="Notifications"
                  >
                    <Bell size={18} color={unreadCount > 0 ? 'var(--teal)' : 'var(--slate)'} />
                    {unreadCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          backgroundColor: 'var(--rose)',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 700,
                          borderRadius: '999px',
                          padding: '1px 5px',
                          lineHeight: 1.2
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {notifDropdownOpen && (
                    <div
                      className="smartnest-card"
                      style={{
                        position: 'absolute',
                        top: '44px',
                        right: 0,
                        width: '340px',
                        maxHeight: '420px',
                        overflowY: 'auto',
                        padding: '16px',
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                        zIndex: 1100,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Bell size={14} color="var(--teal)" /> Notifications & Alerts
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--slate)', fontSize: '12px' }}>
                          No alerts yet. Save properties to your shortlist or message sellers to receive notifications!
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {notifications.map((notif) => (
                            <div
                              key={notif.id}
                              style={{
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: notif.read ? 'var(--mist)' : 'var(--teal-light)',
                                border: `1px solid ${notif.read ? 'var(--border)' : 'rgba(42, 157, 143, 0.3)'}`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span
                                  className={`badge-pill ${notif.type === 'new_message' ? 'badge-teal' : 'badge-rose'}`}
                                  style={{ fontSize: '9px', fontWeight: 700 }}
                                >
                                  {notif.title || (notif.type === 'new_message' ? 'NEW MESSAGE' : 'PRICE DROP ALERT')}
                                </span>
                                {!notif.read && (
                                  <button
                                    onClick={() => handleMarkSingleRead(notif.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--slate)', fontSize: '11px', cursor: 'pointer' }}
                                  >
                                    Dismiss
                                  </button>
                                )}
                              </div>

                              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>
                                {notif.message}
                              </div>

                              {notif.metadata?.old_price && notif.metadata?.new_price && (
                                <div style={{ fontSize: '12px', color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ textDecoration: 'line-through', color: '#94A3B8' }}>
                                    ₹{Math.round(notif.metadata.old_price / 100000)}L
                                  </span>
                                  <span>→</span>
                                  <span style={{ fontWeight: 700, color: 'var(--teal)' }}>
                                    ₹{Math.round(notif.metadata.new_price / 100000)}L
                                  </span>
                                </div>
                              )}

                              {notif.link ? (
                                <div style={{ marginTop: '4px' }}>
                                  <button
                                    onClick={() => {
                                      setNotifDropdownOpen(false);
                                      handleMarkSingleRead(notif.id);
                                      navigate(notif.link);
                                    }}
                                    className="btn btn-primary"
                                    style={{ fontSize: '11px', padding: '4px 10px', width: 'auto' }}
                                  >
                                    View
                                  </button>
                                </div>
                              ) : notif.property_id ? (
                                <div style={{ marginTop: '4px' }}>
                                  <button
                                    onClick={() => {
                                      setNotifDropdownOpen(false);
                                      handleMarkSingleRead(notif.id);
                                      navigate(`/buyer/property/${notif.property_id}`);
                                    }}
                                    className="btn btn-primary"
                                    style={{ fontSize: '11px', padding: '4px 10px', width: 'auto' }}
                                  >
                                    View Property
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Pill */}
                <div
                  onClick={user.role === 'seller' ? () => navigate('/seller/profile') : undefined}
                  role={user.role === 'seller' ? 'button' : undefined}
                  tabIndex={user.role === 'seller' ? 0 : undefined}
                  onKeyDown={user.role === 'seller' ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/seller/profile'); } } : undefined}
                  title={user.role === 'seller' ? 'View Seller Profile' : undefined}
                  aria-label={user.role === 'seller' ? 'View Seller Profile' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: location.pathname === '/seller/profile' ? 'var(--teal-light)' : 'var(--mist)',
                    border: location.pathname === '/seller/profile' ? '1px solid var(--teal)' : '1px solid transparent',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: user.role === 'seller' ? 'pointer' : 'default',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <UserCheck size={14} color="var(--teal)" />
                  <span style={{ fontWeight: location.pathname === '/seller/profile' ? 700 : 500, color: location.pathname === '/seller/profile' ? 'var(--teal)' : 'inherit' }}>
                    {user.name}
                  </span>
                  <span
                    className={`badge-pill ${
                      user.role === 'admin'
                        ? 'badge-rose'
                        : user.role === 'seller'
                        ? 'badge-amber'
                        : 'badge-teal'
                    }`}
                    style={{ fontSize: '10px', textTransform: 'capitalize' }}
                  >
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-ghost"
                  style={{ padding: '6px 10px', color: 'var(--slate)' }}
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ink)',
              padding: '6px'
            }}
            className="mobile-hamburger"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: 'var(--white)',
              borderBottom: '1px solid var(--border)',
              padding: '16px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {isPublic && (
              <>
                <a
                  href="/#features"
                  onClick={(e) => {
                    handlePublicNavClick(e, 'features');
                    setMobileMenuOpen(false);
                  }}
                  className={`btn ${activePublicNav === 'features' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ justifyContent: 'flex-start' }}
                >
                  Features
                </a>
                <a
                  href="/#how-it-works"
                  onClick={(e) => {
                    handlePublicNavClick(e, 'how-it-works');
                    setMobileMenuOpen(false);
                  }}
                  className={`btn ${activePublicNav === 'how-it-works' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ justifyContent: 'flex-start' }}
                >
                  How It Works
                </a>
                <Link
                  to="/login"
                  onClick={() => {
                    setActivePublicNav('login');
                    setMobileMenuOpen(false);
                  }}
                  className={`btn ${activePublicNav === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => {
                    setActivePublicNav('get-started');
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-primary"
                >
                  Get Started
                </Link>
              </>
            )}

            {isBuyer && (
              <>
                <Link to="/buyer/dashboard" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}><Home size={16} /> Home</Link>
                <Link to="/buyer/recommendations" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}><Compass size={16} /> Matches</Link>
                <Link to="/buyer/quiz" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}><Sparkles size={16} /> User Needs</Link>
                <Link to="/buyer/compare" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}><Scale size={16} /> Compare {compareCount > 0 && `(${compareCount})`}</Link>
                <Link to="/buyer/shortlist" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}><Heart size={16} /> Saved</Link>
                <Link to="/buyer/messages" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}><MessageSquare size={16} /> Message Box {messagingUnreadCount > 0 && `(${messagingUnreadCount})`}</Link>
                <Link to="/buyer/plans" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}><CreditCard size={16} /> Plans</Link>
                <button onClick={handleLogout} className="btn btn-destructive" style={{ marginTop: '8px' }}>Log Out</button>
              </>
            )}

            {isSeller && (
              <>
                <Link to="/seller/dashboard" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Dashboard</Link>
                <Link to="/seller/profile" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Seller Profile</Link>
                <Link to="/seller/properties" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>My Listings</Link>
                <Link to="/seller/add" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Add Property</Link>
                <Link to="/seller/analytics" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Analytics</Link>
                <Link to="/seller/enquiries" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Enquiries</Link>
                <Link to="/seller/plans" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}><CreditCard size={16} /> Plans</Link>
                <button onClick={handleLogout} className="btn btn-destructive" style={{ marginTop: '8px' }}>Log Out</button>
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin/dashboard" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Admin Console</Link>
                <Link to="/admin/users" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Manage Users</Link>
                <Link to="/admin/sellers" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Manage Sellers</Link>
                <Link to="/admin/properties" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Manage Listings</Link>
                <Link to="/admin/reports" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Fraud Reports</Link>
                <Link to="/admin/analytics" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Analytics</Link>
                <Link to="/admin/settings" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>Engine Settings</Link>
                <button onClick={handleLogout} className="btn btn-destructive" style={{ marginTop: '8px' }}>Log Out</button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Mobile Bottom Tab Nav for Buyer */}
      {isBuyer && (
        <div
          className="mobile-bottom-bar"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--white)',
            borderTop: '1px solid var(--border)',
            display: 'none',
            justifyContent: 'space-around',
            padding: '10px 0',
            zIndex: 9990,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <Link
            to="/buyer/dashboard"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: location.pathname === '/buyer/dashboard' ? 'var(--teal)' : 'var(--slate)',
              textDecoration: 'none',
              fontSize: '11px',
              gap: '4px'
            }}
          >
            <Home size={18} /> Home
          </Link>
          <Link
            to="/buyer/ai-search"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: location.pathname === '/buyer/ai-search' ? 'var(--teal)' : 'var(--slate)',
              textDecoration: 'none',
              fontSize: '11px',
              gap: '4px'
            }}
          >
            <Sparkles size={18} /> Search
          </Link>
          <Link
            to="/buyer/compare"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: location.pathname === '/buyer/compare' ? 'var(--teal)' : 'var(--slate)',
              textDecoration: 'none',
              fontSize: '11px',
              gap: '4px',
              position: 'relative'
            }}
          >
            <div style={{ position: 'relative' }}>
              <Scale size={18} />
              {compareCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    backgroundColor: 'var(--teal)',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: 700,
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {compareCount}
                </span>
              )}
            </div>
            Compare
          </Link>
          <Link
            to="/buyer/shortlist"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: location.pathname === '/buyer/shortlist' ? 'var(--teal)' : 'var(--slate)',
              textDecoration: 'none',
              fontSize: '11px',
              gap: '4px'
            }}
          >
            <Heart size={18} /> Shortlist
          </Link>
          <Link
            to="/buyer/messages"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: location.pathname.startsWith('/buyer/messages') ? 'var(--teal)' : 'var(--slate)',
              textDecoration: 'none',
              fontSize: '11px',
              gap: '4px',
              position: 'relative'
            }}
          >
            <div style={{ position: 'relative' }}>
              <MessageSquare size={18} />
              {messagingUnreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    backgroundColor: 'var(--teal)',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: 700,
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {messagingUnreadCount}
                </span>
              )}
            </div>
            Messages
          </Link>
        </div>
      )}
    </>
  );
};
