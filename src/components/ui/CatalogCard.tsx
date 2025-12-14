import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit, ShoppingCart, Share2 } from "lucide-react";

type CatalogCardProps = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  createdAt: string;
  isActive: boolean;
};

const CatalogCard = ({ id, name, slug, productCount, createdAt, isActive }: CatalogCardProps) => {
  const shareLink = `${window.location.origin}/c/${slug}`;
  
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    // Show toast notification
    alert("Link copied to clipboard!");
  };
  
  return (
    <Card className={`overflow-hidden ${!isActive ? 'opacity-70' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold dark:text-white">{name}</CardTitle>
          {isActive ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              Draft
            </span>
          )}
        </div>
        <CardDescription className="flex justify-between mt-1 text-sm dark:text-gray-400">
          <span>{productCount} products</span>
          <span>Created {new Date(createdAt).toLocaleDateString()}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
          <span className="text-sm font-medium truncate flex-grow dark:text-gray-300">{shareLink}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2 text-Tonstores-blue dark:text-Tonstores-lightblue dark:hover:text-Tonstores-blue"
            onClick={copyLinkToClipboard}
          >
            <Share2 size={16} />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="pt-2 grid grid-cols-2 gap-2">
        <Link to={`/catalog/${id}/edit`} className="w-full">
          <Button variant="outline" className="w-full dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" size="sm">
            <Edit size={16} className="mr-1 sm:mr-2" />
            <span className="whitespace-nowrap">Edit</span>
          </Button>
        </Link>
        <Link to={`/c/${slug}`} className="w-full">
          <Button variant="default" className="w-full bg-Tonstores-green hover:bg-Tonstores-darkblue" size="sm">
            <ShoppingCart size={16} className="mr-1 sm:mr-2" />
            <span className="whitespace-nowrap">View</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CatalogCard;
