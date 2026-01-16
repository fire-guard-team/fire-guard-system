import { useRef, type JSX } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import MainLogo from "../../ui/MainLogo";
import PermissionGuard from "../../Auth/PermissionGuard";

interface Items {
  content: string;
  link: string;
  icon: JSX.Element;
  permission?: string;
}

interface Props {
  items: Array<Items>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideBar = ({ items, isOpen }: Props) => {
  const sideBar = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <aside
        ref={sideBar}
        className="hidden md:flex md:flex-col md:w-64 border-r border-border bg-white min-h-screen sticky top-0 z-40"
      >
        {/* Logo + title */}
        <div className="flex items-center gap-3 px-6 py-5">
          <MainLogo />
          <div className="font-semibold text-sm">
            <span className="block text-gray-900">Fire Guard</span>
            <span className="block text-xs text-gray-500">
              Monitoring System
            </span>
          </div>
        </div>

        {/* Menu items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((item, index) => (
            <PermissionGuard key={index} permission={item.permission}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <NavLink
                  to={item.link}
                  end={item.link === "/dashboard"}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors",
                      isActive
                        ? "bg-[#F55624] text-white"
                        : "text-gray-700 hover:bg-second",
                    ].join(" ")
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.content}</span>
                </NavLink>
              </motion.div>
            </PermissionGuard>
          ))}
        </nav>
      </aside>

      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-border transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <div className="h-9 w-9 rounded-lg bg-bgMain flex items-center justify-center">
              <img
                src="/assets/logos/fireguardLogo.png"
                alt="Fire Guard"
                className="h-7 w-7 object-contain"
              />
            </div>
            <span className="font-semibold text-sm text-gray-900">
              Fire Guard
            </span>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {items.map((item, index) => (
              <PermissionGuard key={index} permission={item.permission}>
                <NavLink
                  to={item.link}
                  end={item.link === "/dashboard"}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#F55624] text-white"
                        : "text-gray-700 hover:bg-second",
                    ].join(" ")
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.content}</span>
                </NavLink>
              </PermissionGuard>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
