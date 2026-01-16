// src/components/dashboard/layout/NavBar.tsx
import type React from "react";
import { IoClose } from "react-icons/io5";
import { MdMenu } from "react-icons/md";
import { ArrowLeftStartOnRectangleIcon, BellIcon } from "@heroicons/react/24/outline";
import { Notifications } from "../../Toc/Notifications";
import { Profile } from "../../Toc/Profile";
import { useAlertManager } from "../../../hooks/useAlertManager";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/Button";
import { apiService } from "../../../utils/api";

interface Props {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}

const NavBar = ({ isOpen, setIsOpen }: Props) => {
  const { unreadCount } = useAlertManager();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage and redirect to login
      apiService.removeToken();
      navigate('/login');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 lg:px-8 bg-white border-b border-border">
        <div className="flex items-center gap-3">
          <button
            className="text-2xl md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <IoClose /> : <MdMenu />}
          </button>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-4">
          {/* Alerts Button */}
          <button
            onClick={() => navigate('/dashboard/alerts')}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Alerts Center"
          >
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>


          <div className="flex items-center gap-3">
            {/* <div className="h-9 w-9 rounded-full bg-second flex items-center justify-center border border-border">
              <span className="text-sm font-semibold text-gray-700">FG</span>
            </div> */}
            <div className="px-4 cursor-pointer">
                  <Button
                    className="w-full gap-2"
                    onClick={handleLogout}
                  >
                    <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default NavBar;
