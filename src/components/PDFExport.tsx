import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { Task } from '@/types/project';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportProps {
  tasks: Task[];
  projectName: string;
}

export function PDFExport({ tasks, projectName }: PDFExportProps) {
  const exportToPDF = async () => {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text(projectName || 'Project Report', 20, 30);
    
    // Add summary
    pdf.setFontSize(12);
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    pdf.text(`Project Summary:`, 20, 50);
    pdf.text(`Total Tasks: ${totalTasks}`, 20, 60);
    pdf.text(`Completed: ${completedTasks}`, 20, 70);
    pdf.text(`Progress: ${progress}%`, 20, 80);
    
    // Add task list
    let yPosition = 100;
    pdf.text('Task List:', 20, yPosition);
    yPosition += 10;
    
    tasks.forEach((task, index) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(`${index + 1}. ${task.name}`, 25, yPosition);
      yPosition += 7;
      pdf.text(`   Status: ${task.status} | Priority: ${task.priority}`, 25, yPosition);
      yPosition += 7;
      pdf.text(`   Progress: ${task.progress}%`, 25, yPosition);
      yPosition += 10;
    });
    
    pdf.save(`${projectName || 'project'}-report.pdf`);
  };

  return (
    <Button onClick={exportToPDF} className="flex items-center space-x-2">
      <FileText className="w-4 h-4" />
      <span>Export PDF</span>
    </Button>
  );
}