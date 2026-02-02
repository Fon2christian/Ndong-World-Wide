#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_IMAGES_DIR = path.join(__dirname, '../public/assets/images');
const MAX_WIDTH = 1920; // Maximum width for images
const JPEG_QUALITY = 80; // JPEG quality (0-100)
const WEBP_QUALITY = 80; // WebP quality (0-100)

async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function optimizeImage(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();

  // Skip if not an image
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    return null;
  }

  const originalSize = await getFileSize(filePath);

  // Skip if file is already small (< 500KB)
  if (originalSize < 500 * 1024) {
    console.log(`✓ ${fileName} - Already optimized (${formatBytes(originalSize)})`);
    return null;
  }

  try {
    // Backup original file
    const backupPath = filePath + '.original';
    const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);

    if (!backupExists) {
      await fs.copyFile(filePath, backupPath);
      console.log(`  📁 Backed up ${fileName}`);
    }

    // Get image metadata
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Resize if too large
    let pipeline = image;
    if (metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    // Optimize based on format
    if (ext === '.png') {
      // Optimize PNG with compression while preserving transparency
      await pipeline
        .png({ compressionLevel: 9 })
        .toFile(filePath + '.tmp');
    } else {
      // Optimize JPEG
      await pipeline
        .jpeg({ quality: JPEG_QUALITY, progressive: true })
        .toFile(filePath + '.tmp');
    }

    // Replace original with optimized
    await fs.unlink(filePath);
    await fs.rename(filePath + '.tmp', filePath);

    const newSize = await getFileSize(filePath);
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    console.log(`✨ ${fileName}`);
    console.log(`   ${formatBytes(originalSize)} → ${formatBytes(newSize)} (${savings}% reduction)`);

    return {
      file: fileName,
      originalSize,
      newSize,
      savings: parseFloat(savings)
    };
  } catch (error) {
    console.error(`❌ Error optimizing ${fileName}:`, error.message);
    return null;
  }
}

async function optimizeAllImages() {
  console.log('🚀 Starting image optimization...\n');
  console.log(`📂 Directory: ${PUBLIC_IMAGES_DIR}\n`);

  try {
    const files = await fs.readdir(PUBLIC_IMAGES_DIR);
    const imagePaths = files
      .filter(file => !file.endsWith('.original'))
      .map(file => path.join(PUBLIC_IMAGES_DIR, file));

    const results = [];
    for (const imagePath of imagePaths) {
      const result = await optimizeImage(imagePath);
      if (result) {
        results.push(result);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));

    if (results.length === 0) {
      console.log('✓ All images are already optimized!');
    } else {
      const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
      const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
      const totalSavings = ((totalOriginal - totalNew) / totalOriginal * 100).toFixed(1);

      console.log(`Files optimized: ${results.length}`);
      console.log(`Total size before: ${formatBytes(totalOriginal)}`);
      console.log(`Total size after: ${formatBytes(totalNew)}`);
      console.log(`Total savings: ${formatBytes(totalOriginal - totalNew)} (${totalSavings}%)`);
    }

    console.log('\n✅ Optimization complete!');
    console.log('\n💡 Tip: Original files are backed up with .original extension');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run optimization
optimizeAllImages();
