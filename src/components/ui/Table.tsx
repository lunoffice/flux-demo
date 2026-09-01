import type {
  HTMLAttributes,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
} from "react";
import { cn } from "../../lib/cn";

export function Table({
  className,
  children,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto border border-slate-200/90 rounded-xl bg-white shadow-sm overflow-hidden">
      <table
        className={cn("w-full text-left border-collapse text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "bg-slate-100/90 border-b border-slate-200 sticky top-0 z-10",
        className,
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("divide-y divide-slate-100 bg-white", className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn(
        "bg-slate-100/90 font-medium border-t border-slate-200",
        className,
      )}
      {...props}
    >
      {children}
    </tfoot>
  );
}

export function TableRow({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("hover:bg-slate-50/80 focus-within:bg-slate-50", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  isAmount?: boolean;
}

export function TableHead({
  className,
  children,
  isAmount = false,
  ...props
}: TableHeadProps) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider select-none",
        isAmount && "text-right",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  isAmount?: boolean;
}

export function TableCell({
  className,
  children,
  isAmount = false,
  ...props
}: TableCellProps) {
  return (
    <td
      className={cn(
        "px-4 py-3.5 text-sm text-neutral-800 align-middle",
        isAmount &&
          "font-mono tabular-nums text-right font-medium text-neutral-900",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}
