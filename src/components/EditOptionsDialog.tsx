"use client";

import * as React from "react";
import { EditIcon, TrashIcon, SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";

interface SocketOption {
  id: string;
  value: string;
  canDelete: boolean;
}

interface EditOptionsDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (optionName: string, options: SocketOption[]) => void;
  initialOptionName?: string;
  initialOptions?: string[];
}

export function EditOptionsDialog({
  trigger,
  open,
  onOpenChange,
  onSave,
  initialOptionName = "Unit",
  initialOptions = ["AU", "UK", "EU", "US"],
}: EditOptionsDialogProps) {
  // Initialize with passed variant data
  const [socketOptions, setSocketOptions] = React.useState<SocketOption[]>(() => 
    initialOptions.map((option, index) => ({
      id: (index + 1).toString(),
      value: option,
      canDelete: true
    }))
  );

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [optionName, setOptionName] = React.useState(initialOptionName);
  const [editingOptionName, setEditingOptionName] = React.useState(false);
  const [editOptionNameValue, setEditOptionNameValue] = React.useState("");
  const [hasChanges, setHasChanges] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<string | null>(null);

  // Update state when initial props change
  React.useEffect(() => {
    if (initialOptions && initialOptions.length > 0) {
      setSocketOptions(initialOptions.map((option, index) => ({
        id: (index + 1).toString(),
        value: option,
        canDelete: true
      })));
    }
    if (initialOptionName) {
      setOptionName(initialOptionName);
    }
  }, [initialOptions, initialOptionName]);

  // Track initial state to detect changes
  const initialSocketOptions = React.useRef([
    { id: "1", value: "AU", canDelete: true },
    { id: "2", value: "UK", canDelete: true },
    { id: "3", value: "EU", canDelete: true },
    { id: "4", value: "US", canDelete: true },
  ]);
  const initialOptionNameRef = React.useRef("Unit");

  // Check for changes whenever state updates
  React.useEffect(() => {
    const optionsChanged = JSON.stringify(socketOptions) !== JSON.stringify(initialSocketOptions.current);
    const nameChanged = optionName !== initialOptionNameRef.current;
    setHasChanges(optionsChanged || nameChanged);
  }, [socketOptions, optionName]);

  const handleEdit = (option: SocketOption) => {
    setEditingId(option.id);
    setEditValue(option.value);
  };

  const handleSaveEdit = () => {
    if (editingId && editValue.trim()) {
      setSocketOptions(prev =>
        prev.map(option =>
          option.id === editingId
            ? { ...option, value: editValue.trim() }
            : option
        )
      );
      setEditingId(null);
      setEditValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setSocketOptions(prev => prev.filter(option => option.id !== itemToDelete));
      setItemToDelete(null);
    }
  };

  const handleEditOptionName = () => {
    setEditingOptionName(true);
    setEditOptionNameValue(optionName);
  };

  const handleSaveOptionName = () => {
    if (editOptionNameValue.trim()) {
      setOptionName(editOptionNameValue.trim());
      setEditingOptionName(false);
      setEditOptionNameValue("");
    }
  };

  const handleCancelOptionNameEdit = () => {
    setEditingOptionName(false);
    setEditOptionNameValue("");
  };

  const handleSave = () => {
    onSave?.(optionName, socketOptions);
    onOpenChange?.(false);
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Product Options</DialogTitle>
        <DialogDescription>
          Manage the options this product comes in.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Socket Standard Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {editingOptionName ? (
              <input
                type="text"
                value={editOptionNameValue}
                onChange={(e) => setEditOptionNameValue(e.target.value)}
                className="flex-1 px-2 py-1 text-sm font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mr-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveOptionName();
                  } else if (e.key === "Escape") {
                    handleCancelOptionNameEdit();
                  }
                }}
              />
            ) : (
              <span className="font-medium text-base">{optionName}</span>
            )}
            <div className="flex items-center gap-2">
              {editingOptionName ? (
                <button
                  type="button"
                  onClick={handleSaveOptionName}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <SaveIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEditOptionName}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <EditIcon className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={editingOptionName ? handleCancelOptionNameEdit : undefined}
                className={`p-2 transition-colors ${
                  editingOptionName
                    ? "text-gray-400 hover:text-red-600 cursor-pointer"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                disabled={!editingOptionName}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Socket Options */}
          <div className="space-y-2 pl-4">
            {socketOptions.map((option) => (
              <div key={option.id} className="flex items-center justify-between">
                {editingId === option.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mr-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveEdit();
                      } else if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                  />
                ) : (
                  <span className="text-base">{option.value}</span>
                )}
                <div className="flex items-center gap-2">
                  {editingId === option.id ? (
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <SaveIcon className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEdit(option)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <EditIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(option.id)}
                    disabled={!option.canDelete}
                    className={`p-2 transition-colors ${
                      option.canDelete
                        ? "text-gray-400 hover:text-red-600 cursor-pointer"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          onClick={handleSave}
          className="bg-primary text-white uppercase text-sm font-medium px-6"
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (trigger) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>
          {dialogContent}
        </Dialog>
        
        <DeleteConfirmationDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={handleConfirmDelete}
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {dialogContent}
      </Dialog>
      
      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}