/**
 * Upload routes
 */
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import UploadService from '../services/uploadService.js';

const router = express.Router();
const uploadService = new UploadService();

// Configure multer middleware
const upload = uploadService.getMulterConfig();

// Upload single file
router.post('/single', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const userId = req.user!.id.toString();
    const category = (req.body.category as 'profile' | 'document' | 'exercise' | 'report') || 'document';

    const uploadedFile = await uploadService.processUpload(req.file, userId, category);

    res.json({
      success: true,
      data: uploadedFile,
      message: 'Arquivo enviado com sucesso'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro no upload do arquivo'
    });
  }
});

// Upload multiple files
router.post('/multiple', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const userId = req.user!.id.toString();
    const category = (req.body.category as 'profile' | 'document' | 'exercise' | 'report') || 'document';

    const uploadedFiles = [];
    const errors = [];

    for (const file of files) {
      try {
        const uploadedFile = await uploadService.processUpload(file, userId, category);
        uploadedFiles.push(uploadedFile);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    res.json({
      success: true,
      data: {
        uploaded: uploadedFiles,
        errors: errors
      },
      message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no upload dos arquivos'
    });
  }
});

// Upload profile image
router.post('/profile', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada'
      });
    }

    // Validate that it's an image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Apenas imagens são permitidas para foto de perfil'
      });
    }

    const userId = req.user!.id.toString();
    const uploadedFile = await uploadService.processUpload(req.file, userId, 'profile');

    // Here you would typically update the user's profile image in the database
    // For now, we'll just return the upload info

    res.json({
      success: true,
      data: uploadedFile,
      message: 'Foto de perfil atualizada com sucesso'
    });
  } catch (error) {
    console.error('Profile upload error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro no upload da foto de perfil'
    });
  }
});

// Get upload statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const stats = uploadService.getUploadStats(userId);
    
    if (stats) {
      res.json(stats);
    } else {
      res.status(500).json({ error: 'Failed to get upload statistics' });
    }
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get upload statistics' });
  }
});

// Get user files
router.get('/files', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { category } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const files = uploadService.getUserFiles(userId, category as string);
    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to get files' });
  }
});

// Delete file
router.delete('/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const deleted = await uploadService.deleteFile(fileId, userId);
    
    if (deleted) {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found or could not be deleted' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get file info by ID
router.get('/info/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const files = uploadService.getUserFiles(userId);
    const file = files.find(f => f.id === fileId);
    
    if (file) {
      res.json(file);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

export default router;