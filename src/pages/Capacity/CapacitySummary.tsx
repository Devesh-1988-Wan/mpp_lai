import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getCapacityData, addCapacityData, updateCapacityData, deleteCapacityData } from '@/services/capacityService';
import { CapacityData } from '@/types/project';
import CapacityForm from '@/components/CapacityForm';
import { useToast } from '@/hooks/use-toast';


const CapacitySummary: React.FC = () => {
    const [capacityData, setCapacityData] = useState<CapacityData[]>([]);
    const [teamMetrics, setTeamMetrics] = useState({
        totalTeamCapacity: 0,
        estimatedUsage: 0,
        remainingCapacity: 0,
    });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCapacity, setEditingCapacity] = useState<CapacityData | null>(null);
    const { toast } = useToast();

    const fetchAndCalculateData = useCallback(async () => {
        try {
            const data = await getCapacityData();
            setCapacityData(data);

            const totalTeamCapacity = data.reduce((acc, member) => acc + member.man_hours, 0);
            const estimatedUsage = data.reduce((acc, member) => acc + (member.estimated_usage || 0), 0);
            const remainingCapacity = totalTeamCapacity - estimatedUsage;

            setTeamMetrics({
                totalTeamCapacity,
                estimatedUsage,
                remainingCapacity,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Could not fetch capacity data.',
                variant: 'destructive',
            });
        }
    }, [toast]);

    useEffect(() => {
        fetchAndCalculateData();
    }, [fetchAndCalculateData]);

    const handleFormSubmit = async (formData: Omit<CapacityData, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            if (editingCapacity) {
                await updateCapacityData(editingCapacity.id, formData);
                 toast({
                    title: 'Success',
                    description: 'Capacity data updated successfully.',
                });
            } else {
                await addCapacityData(formData);
                 toast({
                    title: 'Success',
                    description: 'New capacity data added successfully.',
                });
            }
            fetchAndCalculateData();
            setIsFormOpen(false);
            setEditingCapacity(null);
        } catch (error) {
             toast({
                title: 'Error',
                description: 'Failed to save capacity data.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (capacity: CapacityData) => {
        setEditingCapacity(capacity);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        // A simple confirmation dialog. For a better user experience, you might want to use a custom modal component.
        const isConfirmed = window.confirm('Are you sure you want to delete this entry?');
        if (isConfirmed) {
            try {
                await deleteCapacityData(id);
                toast({
                    title: 'Success',
                    description: 'Capacity data deleted successfully.',
                });
                fetchAndCalculateData();
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to delete capacity data.',
                    variant: 'destructive',
                });
            }
        }
    };


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Capacity Summary</h1>

             <Button onClick={() => { setEditingCapacity(null); setIsFormOpen(true); }} className="mb-4">
                Add Team Member
            </Button>

            <div className="grid gap-4 md:grid-cols-3 mb-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Team Capacity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{teamMetrics.totalTeamCapacity} Man Hours</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Estimated Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{teamMetrics.estimatedUsage} Man Hours</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Remaining Capacity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{teamMetrics.remainingCapacity} Man Hours</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Team Member Capacity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Team Member</TableHead>
                                <TableHead>Days Worked</TableHead>
                                <TableHead>Man Hours</TableHead>
                                <TableHead>Capacity at 80%</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {capacityData.length > 0 ? (
                                capacityData.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>{member.team_member}</TableCell>
                                        <TableCell>{member.days_worked}</TableCell>
                                        <TableCell>{member.man_hours}</TableCell>
                                        <TableCell>{member.capacity_80_percent}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>Edit</Button>
                                            <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleDelete(member.id)}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No capacity data available.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CapacityForm
                isOpen={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingCapacity(null); }}
                onSubmit={handleFormSubmit}
                initialData={editingCapacity}
            />
        </div>
    );
};

export default CapacitySummary;