/**
 * API Service Layer for PaperMatcher-AI
 *
 * Centralizes all HTTP communication with the backend API.
 * Components must use this service rather than hardcoding backend URLs or fetch calls.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8002';

/**
 * Check backend service health status.
 * @returns {Promise<{status: string, service: string}>}
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Health Check Error:', error);
    throw error;
  }
}

/**
 * Retrieve dynamic filter options (categories and available years).
 * @returns {Promise<{categories: Array<{code: string, name: string, count: number}>, years: number[]}>}
 */
export async function getFilterOptions() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/recommendations/filters`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load filter options: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Filter options error:', error);
    throw error;
  }
}

/**
 * Fetch paper recommendations matching the query and optional filters.
 * @param {{ query: string, top_k?: number, category_code?: string, published_year?: number }} payload
 * @returns {Promise<{query: string, total_results: number, results: Array}>}
 */
export async function getRecommendations({ query, top_k = 5, category_code = null, published_year = null }) {
  try {
    const bodyData = { query, top_k };
    if (category_code && category_code !== 'all') {
      bodyData.category_code = category_code;
    }
    if (published_year && published_year !== 'all') {
      bodyData.published_year = Number(published_year);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Recommendation request failed with status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Recommendation API error:', error);
    throw error;
  }
}

export default {
  checkHealth,
  getFilterOptions,
  getRecommendations,
  API_BASE_URL,
};
