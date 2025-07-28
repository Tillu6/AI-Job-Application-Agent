import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { AppError } from '../utils/errorHandler';

export class DocumentParserService {
  static async parseDocument(file: File): Promise<string> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return await this.parsePDF(file);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        return await this.parseDOCX(file);
      } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
        throw new AppError('DOC files are not supported. Please convert to DOCX or PDF.', 400);
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return await this.parseText(file);
      } else {
        throw new AppError('Unsupported file format. Please upload PDF, DOCX, or TXT files.', 400);
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to parse document. Please ensure the file is not corrupted.', 400);
    }
  }

  private static async parsePDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      text += pageText + '\n';
    }

    if (text.trim().length < 100) {
      throw new AppError('PDF appears to be empty or contains mostly images. Please ensure your CV has extractable text.', 400);
    }

    return text.trim();
  }

  private static async parseDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.value.trim().length < 100) {
      throw new AppError('Document appears to be empty or contains mostly images.', 400);
    }

    return result.value.trim();
  }

  private static async parseText(file: File): Promise<string> {
    const text = await file.text();
    
    if (text.trim().length < 100) {
      throw new AppError('Text file is too short to be a valid CV.', 400);
    }

    return text.trim();
  }

  static validateDocumentContent(content: string): void {
    const minLength = 200;
    const maxLength = 10000;

    if (content.length < minLength) {
      throw new AppError(`CV content is too short. Minimum ${minLength} characters required.`, 400);
    }

    if (content.length > maxLength) {
      throw new AppError(`CV content is too long. Maximum ${maxLength} characters allowed.`, 400);
    }

    // Check for essential CV sections
    const essentialSections = ['experience', 'skill', 'education'];
    const lowerContent = content.toLowerCase();
    const missingSections = essentialSections.filter(section => 
      !lowerContent.includes(section)
    );

    if (missingSections.length > 2) {
      throw new AppError('CV appears to be missing essential sections (experience, skills, education).', 400);
    }
  }

  static extractContactInfo(content: string): {
    email?: string;
    phone?: string;
    name?: string;
  } {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(?:\+61|0)[0-9]{9}/g;
    const nameRegex = /^([A-Z][a-z]+ [A-Z][a-z]+)/m;

    const emails = content.match(emailRegex);
    const phones = content.match(phoneRegex);
    const names = content.match(nameRegex);

    return {
      email: emails?.[0],
      phone: phones?.[0],
      name: names?.[0]
    };
  }
}