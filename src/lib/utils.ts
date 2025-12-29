import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import JSZip from "jszip";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function downloadImagesAsZip(imageUrls: string[], zipFileName: string = 'images.zip', folderName: string = 'images') {
  if (imageUrls.length === 0) return;

  const zip = new JSZip();
  // Create a folder with the specified name (usually product name)
  const imageFolder = zip.folder(folderName);

  try {
    // Fetch all images and add to zip folder
    const imagePromises = imageUrls.map(async (url, index) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        // Get file extension from content-type or default to jpg
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const extension = contentType.includes('png') ? 'png' : 
                         contentType.includes('gif') ? 'gif' :
                         contentType.includes('webp') ? 'webp' : 'jpg';
        
        const fileName = `${folderName}_image_${String(index + 1).padStart(2, '0')}.${extension}`;
        imageFolder?.file(fileName, blob);
        
        return { success: true, index, fileName };
      } catch (error) {
        console.error(`Failed to fetch image ${index + 1}:`, error);
        return { success: false, index, error };
      }
    });

    const results = await Promise.all(imagePromises);
    const successCount = results.filter(r => r.success).length;
    
    if (successCount === 0) {
      throw new Error('Failed to fetch any images');
    }

    // Generate zip file
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Download zip file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = zipFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    return {
      success: true,
      totalImages: imageUrls.length,
      downloadedImages: successCount,
      fileName: zipFileName
    };

  } catch (error) {
    console.error('Error creating zip file:', error);
    throw error;
  }
}
