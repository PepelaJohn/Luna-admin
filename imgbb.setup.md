# ImgBB Integration Setup Guide

## Overview
This guide shows how to set up free image hosting using ImgBB for the task management system's rich text editor.

## Step 1: Create ImgBB Account

1. Go to [ImgBB.com](https://imgbb.com/)
2. Click "Sign Up" (or use existing account)
3. Complete the registration process

## Step 2: Get API Key

1. After logging in, go to your ImgBB API page: https://api.imgbb.com/
2. You'll see your API key in the format: `your-32-character-api-key`
3. Copy this API key

## Step 3: Add to Environment Variables

Add the following to your `.env.local` file:

```bash
# ImgBB Configuration (Free Image Hosting)
NEXT_PUBLIC_IMGBB_API_KEY=your-32-character-api-key-here
```

## Step 4: Verify Setup

1. Restart your Next.js development server
2. Go to the task creation page
3. Try uploading an image using the rich text editor
4. The image should upload successfully and appear in the editor

## ImgBB Limits (Free Tier)

- **File Size**: Up to 32MB per image
- **File Types**: JPG, PNG, GIF, BMP, WebP, SVG
- **API Calls**: No official limit on free tier
- **Storage**: Unlimited
- **Bandwidth**: Unlimited
- **Image Processing**: Basic resizing available

## Troubleshooting

### Common Issues

**"Upload failed" errors:**
- Verify your API key is correct
- Check that the file is a valid image format
- Ensure file size is under 32MB
- Check browser console for detailed error messages

**Images not displaying:**
- Verify the uploaded URL is accessible
- Check for network/firewall restrictions
- Ensure ImgBB service is operational

**Environment variable not found:**
- Make sure you're using `NEXT_PUBLIC_` prefix
- Restart your development server after adding env vars
- Check that `.env.local` file is in your project root

### Test API Key

You can test your API key manually using curl:

```bash
curl -X POST \
  https://api.imgbb.com/1/upload \
  -F "key=YOUR_API_KEY_HERE" \
  -F "image=@/path/to/test-image.jpg"
```

## Alternative Free Image Hosting Services

If you prefer different services, here are alternatives:

### 1. Cloudinary (Generous Free Tier)
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### 2. ImageKit (Free Tier)
```bash
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your-public-key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your-url-endpoint
```

### 3. Supabase Storage (Free Tier)
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Security Notes

- API key is exposed to the client (hence `NEXT_PUBLIC_`)
- ImgBB doesn't require authentication beyond the API key
- Consider implementing server-side upload proxy for production
- Monitor usage to avoid potential abuse
- Images uploaded are publicly accessible via URL

## Production Considerations

For production deployments:

1. **Environment Variables**: Add the ImgBB API key to your hosting platform's environment variables
2. **Rate Limiting**: Implement client-side rate limiting to prevent abuse
3. **File Validation**: Server-side validation for uploaded content
4. **Content Moderation**: Consider content scanning for inappropriate images
5. **Backup Strategy**: Keep backup of important images or use multiple services

## Integration Code Example

The rich text editor already includes ImgBB integration. Here's how it works:

```typescript
const uploadImageToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', IMGBB_API_KEY);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (data.success) {
    return data.data.url; // Direct image URL
  } else {
    throw new Error(data.error?.message || 'Upload failed');
  }
};
```

The returned URL is then embedded directly into the rich text content as an `<img>` tag.