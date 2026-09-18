import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Global Scroll Restoration and Scroll-To-Top handler.
 * Ensures every page navigation starts automatically at the top of the viewport across
 * Buyer, Seller, and Admin dashboards and all public pages.
 */
export const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // If navigating to an anchor section hash (e.g. /#features, /#how-it-works), handle anchor scrolling
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        const timer = setTimeout(() => {
          const navHeight = 76;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navHeight;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 80);
        return () => clearTimeout(timer);
      }
    }

    // For all page navigations, ensure scroll starts immediately at the TOP
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    } catch (e) {
      window.scrollTo(0, 0);
    }

    // Extra safety reset for all possible scrolling containers
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
    
    const appEl = document.getElementById('root');
    if (appEl) appEl.scrollTop = 0;

  }, [pathname, search]);

  return null;
};
