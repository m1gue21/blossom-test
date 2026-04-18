import { NavLink } from 'react-router-dom';

export function Navbar() {
  return (
    <header className="h-12 flex items-center px-6 gap-4 bg-page border-b border-border flex-shrink-0">
      <nav className="flex items-center gap-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-100 text-primary-600'
                : 'text-text-secondary hover:text-text-primary hover:bg-white'
            }`
          }
        >
          Characters
        </NavLink>
        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive
                ? 'bg-primary-100 text-primary-600'
                : 'text-text-secondary hover:text-text-primary hover:bg-white'
            }`
          }
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          Starred
        </NavLink>
      </nav>
    </header>
  );
}
