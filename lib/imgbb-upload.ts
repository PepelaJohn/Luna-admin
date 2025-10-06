// lib/imgbb-upload.ts

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "";

export interface UploadedFile {
  filename: string;
  url: string;
  uploadedAt: string; // ISO string
}

/**
 * Upload a single file to ImgBB
 */
export async function uploadToImgbb(file: File): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error("ImgBB API key is not configured");
  }

  // Validate file type (images and documents)
  const validTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please upload images (JPEG, PNG, GIF, WebP) or PDF files.");
  }

  // Validate file size (32MB max for ImgBB)
  const maxSize = 32 * 1024 * 1024; // 32MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 32MB");
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to upload file");
    }

    const data = await response.json();
    return data.data.url;
  } catch (error) {
    console.error("ImgBB upload error:", error);
    throw error;
  }
}

/**
 * Upload multiple files to ImgBB
 */
export async function uploadMultipleToImgbb(
  files: File[]
): Promise<UploadedFile[]> {
  const uploadPromises = files.map(async (file) => {
    try {
      const url = await uploadToImgbb(file);
      return {
        filename: file.name,
        url: url,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
}

/**
 * Validate files before upload
 */
export function validateFiles(files: File[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const maxSize = 32 * 1024 * 1024; // 32MB
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  files.forEach((file) => {
    // Check file type
    if (!validTypes.includes(file.type)) {
      errors.push(`${file.name}: Invalid file type. Only images and PDFs are allowed.`);
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`${file.name}: File size exceeds 32MB limit.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}