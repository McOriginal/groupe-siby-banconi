import { html2pdf } from 'html2pdf.js';

export const exportPDF = ({ elementID }) => {
  const element = document.getElementById(elementID);
  const opt = {
    filename: `${elementID}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  };

  html2pdf()
    .from(element)
    .set(opt)
    .save()
    .catch((err) => console.error('Error generating PDF:', err));
};
