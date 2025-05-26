import { PDFExtract } from 'pdf.js-extract';

const pdf = new PDFExtract();

export const parsePDFText = async (url) => {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    const pdfData = await pdf.extractBuffer(buffer);

    return pdfData.pages.flatMap((page) => page.content.map((item) => item.str)).join(' ');
};
