import { AuthCredentials, AuthToken } from './types';

const API_BASE_URL = 'https://api.kvikmyndir.is';
const AUTH_ENDPOINT = '/authenticate';

// Your registered credentials
const CREDENTIALS: AuthCredentials = {
    username: 'NerdyMedal',
    password: 'Kroyer123'
};

let cachedToken: AuthToken | null = null;

/**
 * Converts credentials to Base64 encoded string for Basic authentication
 */
const encodeCredentials = (username: string, password: string): string => {
    const credentials = `${username}:${password}`;
    // In React Native, we can use btoa or Buffer
    return btoa(credentials);
};

/**
 * Authenticates with the API and retrieves an access token
 * Token is valid for 24 hours
 */
export const authenticate = async (): Promise<string> => {
    try {
        const encodedCredentials = encodeCredentials(CREDENTIALS.username, CREDENTIALS.password);
        
        console.log('Attempting authentication...');
        console.log('URL:', `${API_BASE_URL}${AUTH_ENDPOINT}`);
        console.log('Credentials (encoded):', encodedCredentials);
        
        const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            throw new Error(`Authentication failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Authentication response:', data);
        const token = data.token;

        if (!token) {
            throw new Error('No token received from authentication');
        }

        // Cache the token with expiration (24 hours from now)
        cachedToken = {
            token,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours in milliseconds
        };

        console.log('Authentication successful! Token:', token.substring(0, 20) + '...');
        return token;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
};

/**
 * Gets a valid access token, authenticating if necessary
 * Automatically re-authenticates if the token has expired
 */
export const getAccessToken = async (): Promise<string> => {
    // Check if we have a valid cached token
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken.token;
    }

    // Token expired or doesn't exist, get a new one
    return await authenticate();
};

/**
 * Makes an authenticated API request
 * Automatically handles token retrieval and refresh
 */
export const authenticatedFetch = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> => {
    const token = await getAccessToken();
    
    const headers = {
        ...options.headers,
        'x-access-token': token,
        'Content-Type': 'application/json'
    };

    return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });
};

/**
 * Clears the cached token (useful for logout or testing)
 */
export const clearToken = (): void => {
    cachedToken = null;
};
