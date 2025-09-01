import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { CapacityData } from '../types/project';

const formSchema = z.object({
  team_member: z.string().min(1, 'Team member name is required'),
  days_worked: z.number().min(0, 'Days worked must be a positive number'),
  man_hours: z.number().min(0, 'Man hours must be a positive number'),
});

type CapacityFormValues = z.infer<typeof formSchema>;

interface CapacityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CapacityData, 'id' | 'created_at' | 'updated_at'>) => void;
  initialData?: CapacityData | null;
}

const CapacityForm: React.FC<CapacityFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CapacityFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (initialData) {
      reset({
        team_member: initialData.team_member,
        days_worked: initialData.days_worked,
        man_hours: initialData.man_hours,
      });
    } else {
      reset({
        team_member: '',
        days_worked: 0,
        man_hours: 0,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<CapacityFormValues> = (data) => {
    const capacity_80_percent = data.man_hours * 0.8;
    onSubmit({ ...data, capacity_80_percent });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} Team Member Capacity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="team_member">Team Member</Label>
            <Input id="team_member" {...register('team_member')} />
            {errors.team_member && <p className="text-red-500 text-sm">{errors.team_member.message}</p>}
          </div>
          <div>
            <Label htmlFor="days_worked">Days Worked</Label>
            <Input id="days_worked" type="number" {...register('days_worked', { valueAsNumber: true })} />
            {errors.days_worked && <p className="text-red-500 text-sm">{errors.days_worked.message}</p>}
          </div>
          <div>
            <Label htmlFor="man_hours">Man Hours</Label>
            <Input id="man_hours" type="number" {...register('man_hours', { valueAsNumber: true })} />
            {errors.man_hours && <p className="text-red-500 text-sm">{errors.man_hours.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CapacityForm;