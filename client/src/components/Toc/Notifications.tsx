// Import Dependencies
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { BellIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import { Link } from "react-router-dom";

// Local Imports
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { AvatarDot } from "../ui/Avatar";

// ----------------------------------------------------------------------

export function Notifications() {
  const [count] = useState<number>(1);

  return (
    <Popover className="relative flex">
      <PopoverButton
        as={Button}
        variant="flat"
        isIcon
        className="relative size-11 rounded-full"
      >
        <BellIcon className="size-7 text-gray-900 text-dark-100" />

        {count > 0 && (
          <AvatarDot
            color="neutral"
            isPing
            className="top-1 ltr:right-1 rtl:left-0 bg-orange-500"
          />
        )}
      </PopoverButton>

      <Transition
        as={Fragment}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <PopoverPanel
          anchor={{ to: "bottom end", gap: 8 }}
          className="z-70 mx-4 flex w-[calc(100vw-2rem)] flex-col rounded-lg border-border shadow-xl bg-white shadow-soft dark:border-dark-800 dark:bg-dark-700 dark:shadow-soft-dark sm:m-0 sm:w-80"
        >
          {({ close }: { close: () => void }) => (
            <div className="flex flex-col rounded-lg">
              <div className="rounded-t-lg bg-gray-100 dark:bg-dark-800">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-800 dark:text-dark-100">
                      Notifications
                    </h3>

                    {count > 0 && (
                      <Badge
                        color="primary"
                        className="h-5 rounded-full px-1.5"
                        variant="soft"
                      >
                        {count}
                      </Badge>
                    )}
                  </div>

                  <Button
                    component={Link}
                    to="/settings/notifications"
                    className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
                    isIcon
                    variant="flat"
                    onClick={close}
                  >
                    <Cog6ToothIcon className="size-4.5" />
                  </Button>
                </div>
              </div>

              <div className="h-24" />
            </div>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
