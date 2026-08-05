import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadCsv, type CsvColumn } from "@/lib/csv";

export function ExportButton<T>({
  filename,
  rows,
  columns,
  label = "Export CSV",
  className,
}: {
  filename: string;
  rows: T[];
  columns: CsvColumn<T>[];
  label?: string;
  className?: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={className}
      disabled={rows.length === 0}
      onClick={() => {
        downloadCsv(filename, rows, columns);
        toast.success(`Exported ${rows.length} rows to CSV`);
      }}
    >
      <Download className="size-3.5" />
      {label}
    </Button>
  );
}
