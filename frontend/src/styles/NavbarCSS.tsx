const NavbarCSS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap');

    .nav-sidebar {
      height: 100vh;
      width: 280px;
      background: linear-gradient(160deg, #0f1240 0%, #1a1d5e 60%, #0f1240 100%);
      color: white;
      position: fixed;
      top: 0;
      left: 0;
      padding: 25px 20px;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      z-index: 1000;
      overflow-y: auto;
      border-right: 3px solid #e8a800;
    }

    .nav-sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .nav-sidebar::-webkit-scrollbar-thumb {
      background: rgba(232, 168, 0, 0.35);
      border-radius: 3px;
    }

    /* ── Header ── */
    .nav-header {
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1.5px solid rgba(232, 168, 0, 0.25);
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: white;
      transition: opacity 0.2s ease;
    }

    .nav-brand:hover {
      opacity: 0.88;
    }

    .nav-logo {
      width: 44px;
      height: 44px;
      object-fit: contain;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
    }

    .nav-brand-text {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      font-weight: 900;
      color: #e8a800;
      letter-spacing: 2px;
      line-height: 1.1;
    }

    .nav-brand-sub {
      font-family: 'Source Sans 3', sans-serif;
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 2px;
    }

    /* ── Profile ── */
    .nav-profile-section {
      margin-bottom: 20px;
    }

    /* ── Section label ── */
    .nav-section-label {
      font-family: 'Press Start 2P', cursive;
      font-size: 0.48rem;
      color: rgba(232, 168, 0, 0.6);
      letter-spacing: 3px;
      margin-bottom: 10px;
      padding-left: 4px;
    }

    /* ── Menu ── */
    .nav-menu {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .nav-item {
      margin: 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: rgba(255, 255, 255, 0.78);
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.2s ease;
      cursor: pointer;
      background: transparent;
      border: 2px solid transparent;
      width: 100%;
      text-align: left;
      font-family: 'Press Start 2P', cursive;
      font-size: 0.62rem;
      line-height: 1.5;
    }

    .nav-link:hover {
      background: rgba(232, 168, 0, 0.1);
      border-color: rgba(232, 168, 0, 0.25);
      color: #e8a800;
      transform: translateX(4px);
    }

    .nav-link.active {
      background: rgba(232, 168, 0, 0.15);
      border-color: #e8a800;
      color: #e8a800;
    }

    .nav-link-icon {
      flex-shrink: 0;
    }

    .nav-link-text {
      white-space: nowrap;
    }

    /* ── Logout ── */
    .nav-logout {
      margin-top: auto;
      padding-top: 20px;
      border-top: 1.5px solid rgba(232, 168, 0, 0.2);
    }

    .nav-logout .nav-link {
      background: rgba(192, 21, 26, 0.12);
      color: rgba(255, 255, 255, 0.7);
      border-color: transparent;
    }

    .nav-logout .nav-link:hover {
      background: rgba(192, 21, 26, 0.3);
      border-color: #c0151a;
      color: white;
      transform: translateX(4px);
    }

    /* ── Mobile ── */
    @media (max-width: 768px) {
      .nav-sidebar {
        width: 100%;
        height: 70px;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 0 15px;
        overflow-y: visible;
        overflow-x: auto;
        border-right: none;
        border-bottom: 3px solid #e8a800;
      }

      .nav-sidebar::-webkit-scrollbar {
        height: 0;
      }

      .nav-header {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .nav-logo {
        width: 34px;
        height: 34px;
      }

      .nav-brand-text {
        font-size: 1rem;
      }

      .nav-brand-sub {
        display: none;
      }

      .nav-profile-section {
        display: none;
      }

      .nav-section-label {
        display: none;
      }

      .nav-menu {
        flex-direction: row;
        gap: 6px;
        flex: 0;
        white-space: nowrap;
      }

      .nav-link {
        padding: 10px 12px;
        font-size: 0.58rem;
        border-radius: 8px;
        min-width: auto;
      }

      .nav-link:hover {
        transform: translateY(-2px);
      }

      .nav-link-text {
        display: none;
      }

      .nav-logout {
        margin-top: 0;
        padding-top: 0;
        border-top: none;
        margin-left: 6px;
      }
    }

    @media (max-width: 480px) {
      .nav-brand-text {
        display: none;
      }

      .nav-logo {
        width: 30px;
        height: 30px;
      }

      .nav-link {
        padding: 8px 10px;
      }
    }

    /* Hide mobile profile button on desktop */
    .nav-teacher-mobile {
      display: none;
    }

    @media (max-width: 768px) {
      .nav-teacher-mobile {
        display: block;
      }
    }
  `}</style>
);

export default NavbarCSS;