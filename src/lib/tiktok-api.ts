// TikTok Scraper API Integration via RapidAPI
// API: tiktok-scraper7.p.rapidapi.com

const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '126afedc64msh718cf547e87f276p1b04fcjsne7ab4581ca8e';
const RAPIDAPI_HOST = 'tiktok-scraper7.p.rapidapi.com';

interface TikTokVideo {
  aweme_id: string;
  video_id: string;
  region: string;
  title: string;
  cover: string;
  origin_cover: string;
  duration: number;
  play: string;  // Direct video URL
  wmplay: string; // Watermarked video URL
  play_count: number;
  digg_count: number; // Likes
  comment_count: number;
  share_count: number;
  download_count: number;
  author: {
    id: string;
    unique_id: string;
    nickname: string;
    avatar: string;
  };
  music_info: {
    id: string;
    title: string;
    author: string;
  };
}

interface TikTokFeedResponse {
  code: number;
  msg: string;
  data: TikTokVideo[];
}

interface TikTokHashtagResponse {
  code: number;
  msg: string;
  data: {
    videos: TikTokVideo[];
    cursor: string;
    hasMore: boolean;
  };
}

interface TikTokHashtagSearchResponse {
  code: number;
  msg: string;
  data: {
    challenge_list: Array<{
      id: string;
      cha_name: string;
      desc: string;
      user_count: number;
      view_count: number;
    }>;
  };
}

// Common hashtag IDs for dropshipping/product content
export const PRODUCT_HASHTAGS = {
  tiktokmademebuyit: '1647119754150918',
  amazonfinds: '1650039844128774',
  aliexpressfinds: '1677786131892229',
  dropshipping: '30611329',
  viralproducts: '1680156485268486',
};

async function fetchFromTikTok(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const queryString = new URLSearchParams(params).toString();
  const url = `https://${RAPIDAPI_HOST}${endpoint}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': RAPIDAPI_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`TikTok API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get trending/feed videos from TikTok
 * @param region - Region code (us, gb, etc.)
 * @param count - Number of videos to fetch (max 30)
 */
export async function getTrendingVideos(region: string = 'us', count: number = 12): Promise<TikTokVideo[]> {
  try {
    const response: TikTokFeedResponse = await fetchFromTikTok('/feed/list', {
      region,
      count: count.toString(),
    });

    if (response.code === 0 && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return [];
  }
}

/**
 * Search for hashtags
 * @param keywords - Search keywords
 */
export async function searchHashtags(keywords: string): Promise<TikTokHashtagSearchResponse['data']['challenge_list']> {
  try {
    const response: TikTokHashtagSearchResponse = await fetchFromTikTok('/challenge/search', {
      keywords,
      count: '10',
    });

    if (response.code === 0 && response.data?.challenge_list) {
      return response.data.challenge_list;
    }
    return [];
  } catch (error) {
    console.error('Error searching hashtags:', error);
    return [];
  }
}

/**
 * Get videos from a specific hashtag
 * @param challengeId - The hashtag/challenge ID
 * @param count - Number of videos to fetch
 * @param cursor - Pagination cursor
 */
export async function getHashtagVideos(
  challengeId: string,
  count: number = 12,
  cursor?: string
): Promise<{ videos: TikTokVideo[]; cursor: string; hasMore: boolean }> {
  try {
    const params: Record<string, string> = {
      challenge_id: challengeId,
      count: count.toString(),
    };
    if (cursor) {
      params.cursor = cursor;
    }

    const response: TikTokHashtagResponse = await fetchFromTikTok('/challenge/posts', params);

    if (response.code === 0 && response.data) {
      return {
        videos: response.data.videos || [],
        cursor: response.data.cursor || '',
        hasMore: response.data.hasMore || false,
      };
    }
    return { videos: [], cursor: '', hasMore: false };
  } catch (error) {
    console.error('Error fetching hashtag videos:', error);
    return { videos: [], cursor: '', hasMore: false };
  }
}

/**
 * Get product-related videos (combines trending + hashtag searches)
 * Makes multiple API calls if needed to get enough videos
 * @param count - Total number of videos to fetch
 */
export async function getProductVideos(count: number = 12): Promise<TikTokVideo[]> {
  try {
    // Request max videos in single call for fast load
    const hashtagResult = await getHashtagVideos(
      PRODUCT_HASHTAGS.tiktokmademebuyit,
      35 // Request slightly more than 30 to ensure we get enough
    );

    const allVideos = hashtagResult.videos;

    if (allVideos.length > 0) {
      // Sort by likes (digg_count) and return requested count
      return allVideos
        .sort((a, b) => (b.digg_count || 0) - (a.digg_count || 0))
        .slice(0, count);
    }

    // Fallback to trending if hashtag fails
    return await getTrendingVideos('us', count);
  } catch (error) {
    console.error('Error fetching product videos:', error);
    return [];
  }
}

/**
 * Get videos sorted by likes within a specific range
 * @param minLikes - Minimum likes
 * @param maxLikes - Maximum likes (optional)
 * @param count - Number of videos
 */
export async function getVideosByLikeRange(
  minLikes: number,
  maxLikes?: number,
  count: number = 20
): Promise<TikTokVideo[]> {
  try {
    // Fetch more videos to filter
    const hashtagResult = await getHashtagVideos(PRODUCT_HASHTAGS.tiktokmademebuyit, count * 3);

    let filtered = hashtagResult.videos.filter(v => {
      const likes = v.digg_count || 0;
      if (maxLikes) {
        return likes >= minLikes && likes <= maxLikes;
      }
      return likes >= minLikes;
    });

    // Sort by likes descending
    filtered.sort((a, b) => (b.digg_count || 0) - (a.digg_count || 0));

    return filtered.slice(0, count);
  } catch (error) {
    console.error('Error fetching videos by like range:', error);
    return [];
  }
}

/**
 * Transform TikTok API video to display format
 */
export function transformVideoForDisplay(video: TikTokVideo) {
  return {
    id: video.aweme_id || video.video_id,
    title: video.title || 'Untitled',
    creator: video.author?.unique_id ? `@${video.author.unique_id}` : 'Unknown',
    views: formatCount(video.play_count),
    likes: formatCount(video.digg_count),
    shares: formatCount(video.share_count),
    comments: formatCount(video.comment_count),
    engagement: calculateEngagement(video),
    thumbnail: video.cover || video.origin_cover,
    videoUrl: video.play, // Direct video URL (no watermark)
    duration: video.duration,
    region: video.region,
  };
}

function formatCount(count: number | undefined): string {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function calculateEngagement(video: TikTokVideo): string {
  const views = video.play_count || 1;
  const engagement = ((video.digg_count || 0) + (video.comment_count || 0) + (video.share_count || 0)) / views * 100;
  return `${engagement.toFixed(1)}%`;
}

export type { TikTokVideo };
