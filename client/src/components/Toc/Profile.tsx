import React from "react";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import {
  ArrowLeftStartOnRectangleIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { TbCoins, TbUser, TbUsersGroup } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarDot, type AvatarColor } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { apiService } from "../../utils/api";


interface LinkItem {
  id: string;
  title: string;
  description: string;
  to: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: AvatarColor;
}

const links: LinkItem[] = [
  {
    id: "1",
    title: "Profile",
    description: "Your profile Setting",
    to: "/settings/general",
    Icon: TbUser,
    color: "warning",
  },
  {
    id: "2",
    title: "Messages",
    description: "Your messages and tasks",
    to: "/apps/chat",
    Icon: ChatBubbleLeftIcon,
    color: "primary",
  },
  {
    id: "3",
    title: "Team",
    description: "Your team members",
    to: "#",
    Icon: TbUsersGroup,
    color: "neutral",
  },
  {
    id: "4",
    title: "Billing",
    description: "Your billing information",
    to: "/settings/billing",
    Icon: TbCoins,
    color: "error",
  },
  {
    id: "5",
    title: "Settings",
    description: "Webapp settings",
    to: "/settings/appearance",
    Icon: Cog6ToothIcon,
    color: "success",
  },
];

export function Profile() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiService.removeToken();
      navigate('/login');
    }
  };

  return (
    <Popover className="relative flex">
      <PopoverButton as="button" className="relative cursor-pointer outline-none focus:outline-none focus:ring-0">
        <Avatar size={12} src="/assets/images/avatar-12.jpg" />
        <AvatarDot
          color="success"
          className="absolute -m-0.5 size-3 ltr:right-0 top-0 "
        />
      </PopoverButton>

      <Transition
        enter="duration-200 ease-out"
        enterFrom="translate-y-2 opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="duration-200 ease-out"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="translate-y-2 opacity-0"
      >
        <PopoverPanel
          anchor={{ to: "bottom end", gap: 12 }}
          className="z-70 flex w-64 flex-col rounded-lg border bg-white border-border shadow-xl dark:border-dark-600 dark:bg-dark-700 dark:shadow-none"
        >
          {({ close }: { close: () => void }) => (
            <>
              <div className="flex items-center gap-4 rounded-t-lg bg-gray-100 px-4 py-5 dark:bg-dark-800">
                <Avatar size={14} src="/assets/images/avatar-12.jpg" />
                <div>
                  <Link
                    className="text-base font-medium text-gray-700 hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400"
                    to="/settings/general"
                    onClick={close}
                  >
                    Travis Fuller
                  </Link>

                  <p className="mt-0.5 text-xs text-gray-400 dark:text-dark-300">
                    Product Designer
                  </p>
                </div>
              </div>

              <div className="flex flex-col pt-2 pb-5">
                {links.map((link) => (
                  <Link
                    key={link.id}
                    to={link.to}
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-2 tracking-wide transition-all outline-hidden hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-dark-600 dark:focus:bg-dark-600"
                  >
                    <Avatar
                      size={8}
                      color={link.color}
                      className="rounded-lg"
                    >
                      <link.Icon className="w-4 h-4" />
                    </Avatar>

                    <div>
                      <h2 className="font-medium text-gray-800 transition-colors group-hover:text-primary-600 group-focus:text-primary-600 dark:text-dark-100 dark:group-hover:text-primary-400 dark:group-focus:text-primary-400">
                        {link.title}
                      </h2>
                      <div className="truncate text-xs text-gray-400 dark:text-dark-300">
                        {link.description}
                      </div>
                    </div>
                  </Link>
                ))}

                <div className="px-4 pt-4">
                  <Button
                    className="w-full gap-2"
                    onClick={handleLogout}
                  >
                    <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
