import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { PracticeSession } from "../../../prisma/src/generated/prisma";

interface PracticeSessionsTableProps {
  sessions: PracticeSession[];
  onEdit: (session: PracticeSession) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export default function PracticeSessionsTable({
  sessions,
  onEdit,
  onDelete,
  isLoading,
}: PracticeSessionsTableProps) {
    console.log(sessions,"f");
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>End Time</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5} className='text-center'>
              <Loader2 className='h-6 w-6 animate-spin mx-auto' />
            </TableCell>
          </TableRow>
        ) : sessions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className='text-center text-gray-500'>
              No practice sessions found.
            </TableCell>
          </TableRow>
        ) : (
          sessions.map((session) => (
            <TableRow key={session.id} className='hover:bg-teal-50'>
              <TableCell>
                {format(new Date(session.date), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                {format(new Date(session.startTime), "hh:mm a")}
              </TableCell>
              <TableCell>
                {format(new Date(session.endTime), "hh:mm a")}
              </TableCell>
              <TableCell>{session.type}</TableCell>
              <TableCell>
                <div className='flex space-x-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onEdit(session)}
                    disabled={isLoading}
                    className='text-teal-600 hover:text-teal-800'
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onDelete(session.id)}
                    disabled={isLoading}
                    className='text-red-600 hover:text-red-800'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
