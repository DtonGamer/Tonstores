import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { CustomerExportService } from "@/services/CustomerExportService";
import useAuth from "@/contexts/AuthContext";
import { formatDate } from "@/utils/format";

interface CustomerExportFormProps {
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

const CustomerExportForm = ({ onExportStart, onExportComplete }: CustomerExportFormProps) => {
  const { user } = useAuth();
  const [format, setFormat] = useState<'csv' | 'json' | 'excel'>('csv');
  const [includeOrderDetails, setIncludeOrderDetails] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | undefined; end: Date | undefined }>({
    start: undefined,
    end: undefined
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    if (!dateRange.start || !dateRange.end) {
      alert("Please select a date range");
      return;
    }

    try {
      setIsExporting(true);
      onExportStart?.();

      await CustomerExportService.downloadExport(user.id, {
        format,
        dateRange: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString()
        },
        includeOrderDetails
      });

      onExportComplete?.();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Customer Data</CardTitle>
        <CardDescription>
          Export your customer information to various formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(value: 'csv' | 'json' | 'excel') => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                <SelectItem value="excel">Excel (CSV format)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox 
              id="includeOrderDetails" 
              checked={includeOrderDetails}
              onCheckedChange={(checked: boolean) => setIncludeOrderDetails(checked)}
            />
            <Label htmlFor="includeOrderDetails" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Include order details
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2 flex-1">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.start ? formatDate(dateRange.start) : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.start}
                    onSelect={(date) => setDateRange({ ...dateRange, start: date })}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex-1">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.end ? formatDate(dateRange.end) : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.end}
                    onSelect={(date) => setDateRange({ ...dateRange, end: date })}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={isExporting || !user || !dateRange.start || !dateRange.end}
          className="w-full"
        >
          {isExporting ? "Exporting..." : "Export Customers"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomerExportForm;