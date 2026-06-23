"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Users } from "lucide-react";

import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilSearch } from "@/assets/icons/UilSearch";
import { UilTrashAlt } from "@/assets/icons/UilTrashAlt";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appToast } from "@/lib/toast";

import {
  addProjectMember,
  getProject,
  getProjectErrorMessage,
  getProjectMembers,
  removeProjectMember,
} from "../functions";
import type { PaginatedData, ProjectDetail, ProjectMember } from "../models";

const ITEM_PER_PAGE_OPTIONS = [5, 10, 20];
const emptyMembers: PaginatedData<ProjectMember> = {
  items: [],
  total_items: 0,
  total_pages: 0,
  current_page: 1,
};

const getMemberName = (member: ProjectMember) =>
  [member.first_name, member.last_name].filter(Boolean).join(" ").trim() ||
  "Unknown user";

const getInitials = (member: ProjectMember) =>
  getMemberName(member)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

type ProjectMembersPageProps = {
  currentUserId: string;
  projectId: string;
};

export const ProjectMembersPage = ({
  currentUserId,
  projectId,
}: ProjectMembersPageProps) => {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [members, setMembers] =
    useState<PaginatedData<ProjectMember>>(emptyMembers);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [email, setEmail] = useState("");
  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(ITEM_PER_PAGE_OPTIONS[1]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadProject = async () => {
      setIsProjectLoading(true);
      try {
        setProject(await getProject(projectId));
      } catch (error) {
        appToast.error(getProjectErrorMessage(error));
      } finally {
        setIsProjectLoading(false);
      }
    };

    void loadProject();
  }, [projectId]);

  useEffect(() => {
    const loadMembers = async () => {
      setIsMembersLoading(true);
      try {
        const data = await getProjectMembers(projectId, {
          page,
          limit: itemPerPage,
          ...Object.fromEntries(
            Object.entries(appliedFilters).filter(([, value]) => value.trim())
          ),
        });
        setMembers(data);
      } catch (error) {
        appToast.error(getProjectErrorMessage(error));
      } finally {
        setIsMembersLoading(false);
      }
    };

    void loadMembers();
  }, [appliedFilters, itemPerPage, page, projectId, reloadKey]);

  const totalPages = Math.max(1, members.total_pages);
  const isCurrentUserOwner = project?.owner_id === currentUserId;

  const handleAddMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      appToast.error("Please enter a member email.");
      return;
    }

    setIsAdding(true);
    try {
      await addProjectMember(projectId, { email: email.trim() });
      handleAddDialogOpenChange(false);
      setPage(1);
      setReloadKey((value) => value + 1);
      appToast.success("Member added to the project.");
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
    } finally {
      setIsAdding(false);
    }
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters({
      first_name: firstNameFilter,
      last_name: lastNameFilter,
      email: emailFilter,
    });
    setPage(1);
  };

  const handleAddDialogOpenChange = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      setEmail("");
    }
  };

  const handleRemoveMember = async (member: ProjectMember) => {
    try {
      await removeProjectMember(projectId, member.user_id);
      setReloadKey((value) => value + 1);
      appToast.success("Member removed from the project.");
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
      throw error;
    }
  };

  if (isProjectLoading) {
    return <div className="h-96 animate-pulse rounded-lg border bg-muted/30" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-semibold">Project Members</h2>
              <p className="text-xs text-muted-foreground">
                Manage everyone with access to this project.
              </p>
            </div>
          </div>
          {isCurrentUserOwner ? (
            <Button
              className="w-fit font-medium"
              onClick={() => handleAddDialogOpenChange(true)}
              size="lg"
              type="button"
              variant="success"
            >
              <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
              Add
            </Button>
          ) : null}
        </div>

        <form
          className="grid gap-3 border-b px-4 py-4 lg:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_minmax(220px,1fr)_auto] lg:items-end"
          onSubmit={handleSearch}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="member-first-name">First name</Label>
            <Input
              id="member-first-name"
              onChange={(event) => setFirstNameFilter(event.target.value)}
              placeholder="Search first name"
              value={firstNameFilter}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="member-last-name">Last name</Label>
            <Input
              id="member-last-name"
              onChange={(event) => setLastNameFilter(event.target.value)}
              placeholder="Search last name"
              value={lastNameFilter}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="member-email">Email</Label>
            <div className="relative">
              <UilSearch
                aria-hidden="true"
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-9"
                id="member-email"
                onChange={(event) => setEmailFilter(event.target.value)}
                placeholder="Search email"
                value={emailFilter}
              />
            </div>
          </div>
          <Button className="w-full lg:w-auto" size="lg" type="submit" variant="info">
            <UilSearch aria-hidden="true" data-icon="inline-start" />
            Search
          </Button>
        </form>

        <Table classNameContainer="min-h-[420px] px-2">
          <TableHeader>
            <TableRow>
              <TableHead>First name</TableHead>
              <TableHead>Last name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.items.map((member) => {
              const isMemberOwner = member.user_id === project?.owner_id;

              return (
                <TableRow key={member.user_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(member)}
                        </AvatarFallback>
                      </Avatar>
                      {member.first_name || "—"}
                    </div>
                  </TableCell>
                  <TableCell>{member.last_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.email || "—"}
                  </TableCell>
                  <TableCell>
                    {isMemberOwner ? (
                      <div className="flex justify-center">
                        <Badge variant="secondary">Owner</Badge>
                      </div>
                    ) : isCurrentUserOwner ? (
                      <div className="flex justify-center">
                        <DeleteConfirmDialog
                          ariaLabel={`Remove ${getMemberName(member)}`}
                          confirmLabel="Remove"
                          onConfirm={() => handleRemoveMember(member)}
                          title="Remove member?"
                          trigger={
                            <Button
                              aria-label={`Remove ${getMemberName(member)}`}
                              size="icon-sm"
                              type="button"
                              variant="danger"
                            >
                              <UilTrashAlt aria-hidden="true" />
                            </Button>
                          }
                        >
                          Remove <strong>{getMemberName(member)}</strong> from
                          this project?
                        </DeleteConfirmDialog>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
            {isMembersLoading ? (
              <TableRow>
                <TableCell
                  className="h-32 text-center text-muted-foreground"
                  colSpan={4}
                >
                  Loading members…
                </TableCell>
              </TableRow>
            ) : (
              members.items.length === 0 && (
                <TableRow>
                  <TableCell
                    className="h-32 text-center text-muted-foreground"
                    colSpan={4}
                  >
                    No members match these filters.
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>

        <div className="grid gap-3 border-t px-4 py-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <p className="hidden text-sm text-muted-foreground md:block">
            Page {members.current_page} of {totalPages}
          </p>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={
                    page === 1 ? "pointer-events-none opacity-50" : undefined
                  }
                  href="#members"
                  onClick={(event) => {
                    event.preventDefault();
                    setPage((current) => Math.max(1, current - 1));
                  }}
                  text=""
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#members"
                      isActive={pageNumber === page}
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  className={
                    page === totalPages
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                  href="#members"
                  onClick={(event) => {
                    event.preventDefault();
                    setPage((current) => Math.min(totalPages, current + 1));
                  }}
                  text=""
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <label className="flex items-center justify-center gap-2 text-sm text-muted-foreground md:justify-self-end">
            <span>Items per page</span>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              onChange={(event) => {
                setItemPerPage(Number(event.target.value));
                setPage(1);
              }}
              value={itemPerPage}
            >
              {ITEM_PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <Dialog open={isAddOpen} onOpenChange={handleAddDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add project member</DialogTitle>
            <DialogDescription>
              Enter the email address of an existing user to add them to this
              project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember}>
            <div className="grid gap-2 py-2">
              <Label htmlFor="new-member-email">Email</Label>
              <Input
                autoFocus
                id="new-member-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="member@example.com"
                type="email"
                value={email}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button
                disabled={isAdding}
                onClick={() => handleAddDialogOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button isLoading={isAdding} type="submit" variant="success">
                Add member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
