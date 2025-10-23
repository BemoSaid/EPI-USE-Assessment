// Utility to generate a PDF with employee credentials using jsPDF
import jsPDF from 'jspdf';

export function generateEmployeeCredentialsPDF({ name, email, password, role }: { name: string, email: string, password: string, role: string }) {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  doc.setFontSize(18);
  doc.text('Employee Account Details', 20, 20);
  doc.setFontSize(12);
  doc.text(`Name: ${name}`, 20, 40);
  doc.text(`Email: ${email}`, 20, 50);
  doc.text(`Temporary Password: ${password}`, 20, 60);
  doc.text(`Role: ${role}`, 20, 70);
  doc.text('Please change your password after first login.', 20, 90);
  doc.save(`${name.replace(/\s+/g, '_')}_credentials.pdf`);
}
