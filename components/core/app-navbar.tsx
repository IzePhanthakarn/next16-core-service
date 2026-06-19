import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getUserAvatarUrl,
  getUserDisplayName,
  getUserEmail,
  getUserInitials,
  type UserProfile,
} from "@/lib/current-user";
import { LogoutButton } from "@/modules/dashboard/logout-button";
import { UilUserSquare } from "@/assets/icons/UilUserSquare";
import { ModeToggle } from "@/components/mode-toggle";
import { DigitalClock } from "@/components/core/digital-clock";
import {
  NotificationDropdown,
  type NotificationItem,
} from "@/components/core/notification-dropdown";

const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Welcome to Core Service",
    description: "Your account has been set up successfully.",
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    title: "New feature available",
    description: "Check out the latest updates in your dashboard.",
    createdAt: "1 day ago",
  },
];

type AppNavbarProps = {
  user: UserProfile;
};

export const AppNavbar = ({ user }: AppNavbarProps) => {
  const name = getUserDisplayName(user);
  const email = getUserEmail(user);
  const avatarUrl = getUserAvatarUrl(user);
  const initials = getUserInitials(user);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:px-6">
      <DigitalClock className="hidden sm:flex" />
      <div className="flex items-center gap-2">
        <ModeToggle className="size-9" />
        <NotificationDropdown notifications={mockNotifications} />
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open user menu"
            className="rounded-full"
            size="icon-lg"
            type="button"
            variant="ghost"
          >
            <Avatar size="lg">
              {avatarUrl ? <AvatarImage alt={name} src={avatarUrl} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="p-2">
            <div className="flex items-center gap-3">
              <Avatar>
                {avatarUrl ? <AvatarImage alt={name} src={avatarUrl} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {name}
                </p>
                {email ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {email}
                  </p>
                ) : null}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link className="cursor-pointer" href="/profile">
              <UilUserSquare aria-hidden="true" className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <LogoutButton
              className="h-auto w-full justify-start px-0 py-0 font-normal"
              variant="ghost"
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
