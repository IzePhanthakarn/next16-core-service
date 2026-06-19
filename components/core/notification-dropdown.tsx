import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UilBell } from "@/assets/icons/UilBell";

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

type NotificationDropdownProps = {
  notifications?: NotificationItem[];
};

export const NotificationDropdown = ({
  notifications = [],
}: NotificationDropdownProps) => {
  const count = notifications.length;
  const hasNotifications = count > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open notifications"
          className="relative size-9 rounded-lg border-2 border-border duration-200"
          size="icon-lg"
          type="button"
          variant="ghost"
        >
          <UilBell aria-hidden="true" className="size-5" />
          {hasNotifications ? (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
              {count > 99 ? "99+" : count}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hasNotifications ? (
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex flex-col gap-0.5 px-2 py-2.5 hover:bg-accent"
              >
                <p className="text-sm font-medium text-foreground">
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {notification.description}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {notification.createdAt}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
