/**
 * BISHOUY.COM — Image Utilities
 * Shared logic for handling article images, fallbacks, and hashing.
 */

export const NEWS_PHOTOS = [
  "photo-1504711434969-e33886168f5c", "photo-1503676260728-1c00da094a0b",
  "photo-1512428559087-560fa5ceab42", "photo-1526304640581-d334cdbdf456",
  "photo-1460925895917-afdab827c52f", "photo-1518770660439-4636190af475",
  "photo-1550751827-4bd374c3f58b", "photo-1508921340878-ba53e1f016ec",
  "photo-1532094349884-543bc11b234d", "photo-1486406146926-c627a92ad1ab",
  "photo-1521295121783-8a321d551ad2", "photo-1451187580459-43490279c0fa",
  "photo-1493612276216-ee3925520721", "photo-1514525253348-8d9ce0eac926",
  "photo-1518932945647-7a1c969f8be2", "photo-1504450758481-7338eba7524a",
  "photo-1485827404703-89b55fcc595e", "photo-1519389950473-47ba0277781c",
  "photo-1555066931-4365d14bab8c", "photo-1495020689067-958852a7765e",
  "photo-1504173010664-32509ac1fd5f", "photo-1454165833967-4d751e023931",
  "photo-1486312338219-ce68d2c6f44d", "photo-1507413245164-6160d8298b31",
  "photo-1495592822108-9e6261896da8", "photo-1516321318423-f06f85e504b3",
  "photo-1517048676732-d65bc937f952", "photo-1517245386807-bb43f82c33c4",
  "photo-1515187029135-18ee286d815b", "photo-1531297484001-80022131f5a1",
  "photo-1498050108023-c5249f4df085", "photo-1495539406979-bf61750d38ad",
  "photo-1444653300602-a602f920257c", "photo-1523995462485-3d171b5c8fa9",
  "photo-1486406146926-c627a92ad1ab", "photo-1493612276216-ee3925520721",
  "photo-1518770660439-4636190af475", "photo-1504711434969-e33886168f5c"
];

/**
 * Returns a unique fallback image based on article metadata
 */
export const getFallbackImage = (category: string, id: number | string, width = 800) => {
  let hash = 0;
  const strId = String(id) + (category || "news");
  for (let i = 0; i < strId.length; i++) {
    hash = ((hash << 5) - hash) + strId.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash % NEWS_PHOTOS.length);
  const photoId = NEWS_PHOTOS[index];

  return `https://images.unsplash.com/${photoId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&q=80`;
};

/**
 * Validates an image URL and returns a safe alternative if needed
 */
export const getSafeImage = (img: string | null | undefined, category: string, id: number | string, width = 800) => {
  // Only proactively replace the known generic typewriter placeholder
  const isGenericPlaceholder = img?.includes('photo-1585829365295-ab7cd400c167');

  if (!img || isGenericPlaceholder) {
    return getFallbackImage(category, id, width);
  }

  // Optimize Unsplash
  if (img.includes('unsplash.com')) {
    const baseUrl = img.split('?')[0];
    return `${baseUrl}?auto=format&fm=webp&fit=crop&w=${width}&q=80`;
  }

  // Optimize LoremFlickr (it supports width/height in URL)
  // But clean up multi-keyword or malformed URLs (e.g. containing commas)
  if (img.includes('loremflickr.com')) {
    // Determine a stable lock number based on ID to prevent images from changing on navigation
    // Use a number between 1 and 1000 for the lock
    const numericId = typeof id === 'number' ? id : (id.split('-').pop() || '1');
    const lockVal = Math.abs(parseInt(String(numericId)) % 1000) || 1;

    // Extract just the keyword part (first word, no commas, no spaces)
    const match = img.match(/loremflickr\.com\/\d+\/\d+\/([^/?]+)/);
    if (match) {
      const rawKeyword = decodeURIComponent(match[1]).split(',')[0].split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
      const keyword = rawKeyword || 'news';
      // Lower width and higher compression for mobile happiness
      const thumbWidth = Math.min(width, 300);
      return `https://loremflickr.com/${thumbWidth}/${Math.round(thumbWidth * 0.6)}/${keyword}?lock=${lockVal}`;
    }
    return img;
  }

  // Optimize Pollinations AI
  if (img.includes('pollinations.ai')) {
    const baseUrl = img.split('?')[0];
    return `${baseUrl}?width=${width}&height=${Math.round(width * 0.6)}&nologo=true&enhance=true`;
  }
  
  // High-Performance Optimization: Use weserv.nl proxy for any external images 
  // (like Cloudfront or others) that don't support native resizing. 
  // This is the key to fixing the "1.5MB savings" reported by Google PageSpeed.
  if (img.startsWith('http') && !img.includes('unsplash.com') && !img.includes('loremflickr.com')) {
    // Escape the URL for the proxy
    const encodedUrl = encodeURIComponent(img);
    // Use lower quality (50) and capped width (400) for huge savings on mobile
    const thumbWidth = Math.min(width, width > 700 ? 800 : 400); 
    return `https://images.weserv.nl/?url=${encodedUrl}&w=${thumbWidth}&output=webp&q=50&fit=cover`;
  }

  return img;
};
