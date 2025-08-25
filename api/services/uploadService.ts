/**
 * Upload service for handling file uploads
 */
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { Request } from 'express';
import { database } from '../database/index.js';

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  uploadedAt: string;
  userId: string;
}

class UploadService {
  private uploadDir: string;
  private maxFileSize: number;
  private allowedMimeTypes: string[];

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads';
    this.maxFileSize = parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'); // 10MB default
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
  }

  // Configure multer for file upload
  public getMulterConfig() {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: this.maxFileSize
      },
      fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
        }
      }
    });
  }

  // Process and save uploaded file
  public async processUpload(
    file: Express.Multer.File,
    userId: string,
    category: 'profile' | 'document' | 'exercise' | 'report' = 'document'
  ): Promise<UploadedFile> {
    try {
      // Generate unique filename
      const fileId = Date.now().toString();
      const ext = path.extname(file.originalname);
      const filename = `${category}_${fileId}${ext}`;
      const categoryDir = path.join(this.uploadDir, category);
      const filePath = path.join(categoryDir, filename);

      // Ensure directory exists
      await fs.mkdir(categoryDir, { recursive: true });

      // Process image files
      if (file.mimetype.startsWith('image/')) {
        await this.processImage(file.buffer, filePath, category);
      } else {
        // Save non-image files directly
        await fs.writeFile(filePath, file.buffer);
      }

      const uploadedFile: UploadedFile = {
        id: fileId,
        originalName: file.originalname,
        filename,
        mimetype: file.mimetype,
        size: file.size,
        path: filePath,
        url: `/uploads/${category}/${filename}`,
        uploadedAt: new Date().toISOString(),
        userId
      };

      // Save file info to database
      await this.saveFileToDatabase(uploadedFile, category);

      return uploadedFile;
    } catch (error) {
      console.error('Error processing upload:', error);
      throw new Error('Falha no processamento do arquivo');
    }
  }

  // Process image with Sharp
  private async processImage(buffer: Buffer, outputPath: string, category: string): Promise<void> {
    let sharpInstance = sharp(buffer);

    // Different processing based on category
    switch (category) {
      case 'profile':
        // Profile images: resize to 300x300, optimize
        sharpInstance = sharpInstance
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 85 });
        break;
      
      case 'exercise':
        // Exercise images: resize to max 800x600, maintain aspect ratio
        sharpInstance = sharpInstance
          .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 });
        break;
      
      default:
        // General images: optimize without resizing
        sharpInstance = sharpInstance
          .jpeg({ quality: 85 });
        break;
    }

    await sharpInstance.toFile(outputPath);
  }

  // Save file info to database
  private async saveFileToDatabase(file: UploadedFile, category: string): Promise<void> {
    const stmt = database.prepare(`
      INSERT INTO files (id, user_id, original_name, filename, mimetype, size, category, path, url, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      file.id,
      file.userId,
      file.originalName,
      file.filename,
      file.mimetype,
      file.size,
      category,
      file.path,
      file.url,
      file.uploadedAt
    );
  }

  // Get user files from database
  public getUserFiles(userId: string, category?: string): UploadedFile[] {
    let query = 'SELECT * FROM files WHERE user_id = ?';
    const params: any[] = [userId];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY uploaded_at DESC';
    
    const stmt = database.prepare(query);
    const rows = stmt.all(...params) as any[];
    
    return rows.map(row => ({
      id: row.id,
      originalName: row.original_name,
      filename: row.filename,
      mimetype: row.mimetype,
      size: row.size,
      path: row.path,
      url: row.url,
      uploadedAt: row.uploaded_at,
      userId: row.user_id
    }));
  }

  // Delete file
  public async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      // Get file info from database
      const stmt = database.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?');
      const fileRecord = stmt.get(fileId, userId) as any;
      
      if (!fileRecord) {
        return false;
      }
      
      // Delete physical file
      await fs.unlink(fileRecord.path);
      
      // Delete from database
      const deleteStmt = database.prepare('DELETE FROM files WHERE id = ? AND user_id = ?');
      const result = deleteStmt.run(fileId, userId);
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Get file info
  public async getFileInfo(filePath: string): Promise<any> {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      return null;
    }
  }

  // Validate file size
  public validateFileSize(size: number): boolean {
    return size <= this.maxFileSize;
  }

  // Validate file type
  public validateFileType(mimetype: string): boolean {
    return this.allowedMimeTypes.includes(mimetype);
  }

  // Get upload statistics
  public getUploadStats(userId?: string): any {
    try {
      let query = 'SELECT category, COUNT(*) as count, SUM(size) as total_size FROM files';
      const params: any[] = [];
      
      if (userId) {
        query += ' WHERE user_id = ?';
        params.push(userId);
      }
      
      query += ' GROUP BY category';
      
      const stmt = database.prepare(query);
      const rows = stmt.all(...params) as any[];
      
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        byCategory: {
          profile: 0,
          document: 0,
          exercise: 0,
          report: 0
        }
      };
      
      rows.forEach(row => {
        stats.totalFiles += row.count;
        stats.totalSize += row.total_size || 0;
        stats.byCategory[row.category as keyof typeof stats.byCategory] = row.count;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting upload stats:', error);
      return null;
    }
  }
}

export default UploadService;