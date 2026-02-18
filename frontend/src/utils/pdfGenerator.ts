import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const downloadReportPDF = async (
  lessonTitle: string,
  reportElementId: string
) => {
  const element = document.getElementById(reportElementId);
  if (!element) return;

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`Lingoria_Report_${lessonTitle.replace(/\s+/g, '_')}.pdf`);
};
