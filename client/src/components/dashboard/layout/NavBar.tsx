// src/components/dashboard/layout/NavBar.tsx
import type React from "react";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdMenu } from "react-icons/md";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Notifications } from "../../Toc/Notifications";
import { motion, AnimatePresence } from "framer-motion";
import { Profile } from "../../Toc/Profile";

interface Props {
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}

const NavBar = ({ setSearch, isOpen, setIsOpen }: Props) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isSearchOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(query);
    setIsSearchOpen(false);
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

        <div className="flex-1 flex justify-between ">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center w-full max-w-md  rounded-2xl px-4 py-2 text-sm text-gray-500 hover:border-gray-300 hover:bg-white transition"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-text-gray-500" />
            <span className="ml-3 ">Search here...</span>
            <span className="px-2 py-0.5 rounded-md border border-gray-500 text-[11px] text-gray-500 ml-2">
              /
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Notifications />

          <div className="flex items-center gap-3">
            {/* <div className="h-9 w-9 rounded-full bg-second flex items-center justify-center border border-border">
              <span className="text-sm font-semibold text-gray-700">FG</span>
            </div> */}
            <Profile />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex items-start justify-center pt-24 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              className="w-full max-w-3xl rounded-2xl bg-white border border-border shadow-xl"
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 16 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-3 px-5 py-4"
              >
                <MagnifyingGlassIcon className="w-5 h-5 text-PrimaryBlue" />

                <input
                  autoFocus
                  type="text"
                  placeholder="Search here..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="px-3 py-1 rounded-md bg-bgWhite border border-border text-[11px] font-semibold text-gray-600"
                >
                  ESC
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
