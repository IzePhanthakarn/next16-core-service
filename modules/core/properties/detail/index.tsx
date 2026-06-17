"use client";

import Link from "next/link";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { LucideTags } from "@/assets/icons/LucideTags";
import { UilEye } from "@/assets/icons/UilEye";
import { UilPen } from "@/assets/icons/UilPen";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { DeleteConfirmDialog } from "@/components/core/delete-confirm-dialog";
import { ToggleStatusConfirmDialog } from "@/components/core/toggle-status-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import PAGE_ROUTE from "@/constants/page_route";
import { appToast } from "@/lib/toast";

import {
  buildUpdatePayload,
  deletePropertyOption,
  getPropertyDetail,
  getPropertyDetailErrorMessage,
  updateProperty,
  updatePropertyOptionStatus,
} from "./functions";
import {
  getDefaultPropertyDetailForm,
  type PropertyDetail,
  type PropertyDetailFormState,
  type PropertyOption,
} from "./models";
import { AddOptionSheet } from "./AddOptionSheet";
import { OptionSheet } from "./OptionSheet";

type Props = {
  propertyId: string;
};

const getOptionStatusClass = (option: PropertyOption) => {
  if (option.is_active) {
    return "rounded-full bg-green-100 hover:bg-green-200 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900 dark:text-green-400";
  }
  return "rounded-full bg-muted/90 hover:bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground";
};

const getOptionStatusText = (option: PropertyOption) => {
  if (option.is_active) {
    return "Active";
  }
  return "Inactive";
};

const usePropertyDetail = (propertyId: string) => {
  const [detail, setDetail] = useState<PropertyDetail | null>(null);
  const [form, setForm] = useState<PropertyDetailFormState>({
    name: "",
    code: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getPropertyDetail(propertyId);
        setDetail(data);
        setForm(getDefaultPropertyDetailForm(data));
      } catch (error) {
        setErrorMessage(getPropertyDetailErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetail();
  }, [propertyId]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      appToast.error("Please fill name and code.");
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateProperty(propertyId, buildUpdatePayload(form));
      setDetail((prev) => (prev ? { ...prev, ...updated } : prev));
      appToast.success("Property saved.");
    } catch (error) {
      appToast.error(getPropertyDetailErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOption = (option: PropertyOption) => {
    setDetail((prev) =>
      prev ? { ...prev, options: [...prev.options, option] } : prev,
    );
  };

  const handleUpdateOption = (updated: PropertyOption) => {
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            options: prev.options.map((o) => (o.id === updated.id ? updated : o)),
          }
        : prev,
    );
  };

  const handleToggleOptionStatus = async (option: PropertyOption) => {
    const newStatus = !option.is_active;
    await updatePropertyOptionStatus(option.id, newStatus);
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            options: prev.options.map((o) =>
              o.id === option.id ? { ...o, is_active: newStatus } : o,
            ),
          }
        : prev,
    );
    appToast.success(`Option ${newStatus ? "activated" : "deactivated"}.`);
  };

  const handleDeleteOption = async (optionId: string) => {
    await deletePropertyOption(optionId);
    setDetail((prev) =>
      prev
        ? { ...prev, options: prev.options.filter((o) => o.id !== optionId) }
        : prev,
    );
    appToast.success("Option deleted.");
  };

  return {
    detail,
    errorMessage,
    form,
    handleAddOption,
    handleDeleteOption,
    handleSubmit,
    handleToggleOptionStatus,
    handleUpdateOption,
    isLoading,
    isSaving,
    setForm,
  };
};

type RenderContentProps = {
  detail: PropertyDetail | null;
  errorMessage: string;
  form: PropertyDetailFormState;
  handleAddOption: (option: PropertyOption) => void;
  handleDeleteOption: (optionId: string) => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleToggleOptionStatus: (option: PropertyOption) => Promise<void>;
  handleUpdateOption: (option: PropertyOption) => void;
  isLoading: boolean;
  isSaving: boolean;
  propertyId: string;
  setForm: Dispatch<SetStateAction<PropertyDetailFormState>>;
};

const renderContent = ({
  detail,
  errorMessage,
  form,
  handleAddOption,
  handleDeleteOption,
  handleSubmit,
  handleToggleOptionStatus,
  handleUpdateOption,
  isLoading,
  isSaving,
  propertyId,
  setForm,
}: RenderContentProps) => {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LineMdLoadingLoop className="h-10 w-10" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-destructive">
        {errorMessage}
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  const optionSuffix = detail.options.length === 1 ? "" : "s";

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <UilPen className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">General Information</h2>
        </div>

        <form
          className="flex flex-col gap-4 px-4 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="detail-property-name">Name</Label>
              <Input
                id="detail-property-name"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Property name"
                value={form.name}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="detail-property-code">Code</Label>
              <Input
                id="detail-property-code"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    code: event.target.value.toUpperCase(),
                  }))
                }
                placeholder="PROPERTY_CODE"
                value={form.code}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="detail-property-description">Description</Label>
            <Textarea
              className="min-h-24 resize-none"
              id="detail-property-description"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Property description"
              value={form.description}
            />
          </div>

          <div className="flex justify-end">
            <Button isLoading={isSaving} type="submit" variant="success" size="lg">
              Save
            </Button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">Options</h2>
            <p className="text-xs text-muted-foreground">
              {detail.options.length} option{optionSuffix} defined
            </p>
          </div>
          <AddOptionSheet
            propertyTypeId={propertyId}
            onSaved={handleAddOption}
            trigger={
              <Button className="font-medium" type="button" variant="success" size="lg">
                <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
                Add Option
              </Button>
            }
          />
        </div>

        {detail.options.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No options defined.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.options.map((option) => (
                <TableRow key={option.id}>
                  <TableCell className="font-medium">{option.label}</TableCell>
                  <TableCell>
                    <span className="rounded-md px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {option.value}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <ToggleStatusConfirmDialog
                      isActive={option.is_active}
                      onConfirm={async () => {
                        try {
                          await handleToggleOptionStatus(option);
                        } catch (error) {
                          appToast.error(getPropertyDetailErrorMessage(error));
                          throw error;
                        }
                      }}
                      title={option.is_active ? "Deactivate Option" : "Activate Option"}
                      trigger={
                        <Button
                          aria-label={`Toggle status for ${option.label}`}
                          className={getOptionStatusClass(option)}
                          type="button"
                        >
                          {getOptionStatusText(option)}
                        </Button>
                      }
                    >
                      Are you sure you want to{" "}
                      {option.is_active ? "deactivate" : "activate"} &quot;
                      {option.label}&quot;?
                    </ToggleStatusConfirmDialog>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <OptionSheet
                        mode="view"
                        option={option}
                        trigger={
                          <Button
                            aria-label="View option"
                            size="icon-sm"
                            type="button"
                            variant="secondary"
                          >
                            <UilEye aria-hidden="true" />
                          </Button>
                        }
                      />
                      <OptionSheet
                        mode="edit"
                        onSaved={handleUpdateOption}
                        option={option}
                        trigger={
                          <Button
                            aria-label="Edit option"
                            size="icon-sm"
                            type="button"
                            variant="warning"
                          >
                            <UilPen aria-hidden="true" />
                          </Button>
                        }
                      />
                      <DeleteConfirmDialog
                        ariaLabel="Delete option"
                        onConfirm={async () => {
                          try {
                            await handleDeleteOption(option.id);
                          } catch (error) {
                            appToast.error(getPropertyDetailErrorMessage(error));
                            throw error;
                          }
                        }}
                        title="Delete option"
                      >
                        Are you sure you want to delete &quot;{option.label}&quot;?{" "}
                        <br />
                        This action cannot be undone.
                      </DeleteConfirmDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export const PropertyDetailPage = ({ propertyId }: Props) => {
  const {
    detail,
    errorMessage,
    form,
    handleAddOption,
    handleDeleteOption,
    handleSubmit,
    handleToggleOptionStatus,
    handleUpdateOption,
    isLoading,
    isSaving,
    setForm,
  } = usePropertyDetail(propertyId);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LucideTags className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-semibold">Property Detail</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            View and edit property information and options.
          </p>
        </div>
        <Button asChild size="lg" variant="outline">
          <Link href={PAGE_ROUTE.PROPERTIES.INDEX}>Back to Properties</Link>
        </Button>
      </div>

      <Separator />

      {renderContent({
        detail,
        errorMessage,
        form,
        handleAddOption,
        handleDeleteOption,
        handleSubmit,
        handleToggleOptionStatus,
        handleUpdateOption,
        isLoading,
        isSaving,
        propertyId,
        setForm,
      })}
    </section>
  );
};
