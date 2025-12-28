import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Share2, Trash2, ArrowLeft, Save } from "lucide-react";
import { useState } from "react";

interface CatalogHeaderProps {
  isNewCatalog: boolean;
  catalogName: string;
  shareableLink: string;
  onSave: (e?: any) => void;
  onPreview: () => void;
  onShare: () => void;
  onDelete: () => void;
  showDeleteButton: boolean;
  isSaving: boolean;
}

const CatalogHeader = ({
  isNewCatalog,
  catalogName,
  shareableLink,
  onSave,
  onPreview,
  onShare,
  onDelete,
  showDeleteButton,
  isSaving
}: CatalogHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <Link to="/dashboard" className="inline-flex items-center text-Tonstores-darkblue hover:text-Tonstores-blue dark:text-white dark:hover:text-Tonstores-lightblue mb-2 sm:mb-0">
        <ArrowLeft size={16} className="mr-1" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <div className="flex flex-wrap gap-2">
          {!isNewCatalog && (
            <>
              <Button
                variant="outline"
                className="flex items-center gap-1 px-3 text-sm dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                size="sm"
                onClick={onPreview}
              >
                <Eye size={16} />
                <span>Preview</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-1 px-3 text-sm dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                size="sm"
                onClick={onShare}
              >
                <Share2 size={16} />
                <span>Share</span>
              </Button>
              {showDeleteButton && (
                <Button
                  variant="destructive"
                  className="flex items-center gap-1 px-3 text-sm"
                  size="sm"
                  onClick={onDelete}
                >
                  <Trash2 size={16} />
                  <span>Delete Catalog</span>
                </Button>
              )}
            </>
          )}
        </div>

        <Button
          onClick={onSave}
          className="bg-Tonstores-green hover:bg-Tonstores-darkblue flex items-center gap-2 px-4 w-full sm:w-auto"
          size="default"
          disabled={isSaving}
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save size={16} />
          )}
          <span>{isSaving ? "Saving..." : "Save Catalog"}</span>
        </Button>
      </div>
    </div>
  );
};

export default CatalogHeader;