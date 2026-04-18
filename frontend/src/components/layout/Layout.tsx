import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="h-screen w-screen overflow-hidden flex">
      <Outlet />
    </div>
  );
}
