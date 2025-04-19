/**
 * Simple encryption for API keys
 * This is a basic implementation and not meant for high-security applications
 */
function encryptApiKey(apiKey: string): string {
    // Simple XOR-based encryption with a fixed key
    // This provides obfuscation rather than true encryption
    const encryptionKey = 'dressed-by-ai-key-2025'
    let encrypted = ''

    for (let i = 0; i < apiKey.length; i++) {
        const charCode = apiKey.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length)
        encrypted += String.fromCharCode(charCode)
    }

    // Convert to Base64 for safe storage
    return btoa(encrypted)
}

/**
 * Decrypt the API key
 */
function decryptApiKey(encryptedKey: string): string {
    try {
        // Convert from Base64
        const encrypted = atob(encryptedKey)
        const encryptionKey = 'dressed-by-ai-key-2025'
        let decrypted = ''

        for (let i = 0; i < encrypted.length; i++) {
            const charCode = encrypted.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length)
            decrypted += String.fromCharCode(charCode)
        }

        return decrypted
    } catch (error) {
        console.error('Failed to decrypt API key:', error)
        return ''
    }
}

// Define the provider type
export type Provider = 'openai' | 'anthropic' | 'segmind'

/**
 * Safely store API keys in sessionStorage with encryption
 */
export function storeApiKey(
    provider: Provider,
    apiKey: string
): void {
    // Encrypt the API key before storing
    const encryptedKey = encryptApiKey(apiKey)
    sessionStorage.setItem(`apiKey_${provider}`, encryptedKey)
}

/**
 * Store the last used provider in sessionStorage
 */
export function storeLastProvider(provider: 'openai' | 'anthropic'): void {
    sessionStorage.setItem('lastProvider', provider)
}

/**
 * Store the last used model in sessionStorage
 */
export function storeLastModel(model: string): void {
    sessionStorage.setItem('lastModel', model)
}

/**
 * Retrieve API keys from sessionStorage
 */
export function getApiKey(provider: Provider): string | null {
    const encryptedKey = sessionStorage.getItem(`apiKey_${provider}`)
    if (!encryptedKey) return null

    // Decrypt the API key
    return decryptApiKey(encryptedKey)
}

/**
 * Retrieve the last used provider from sessionStorage
 */
export function getLastProvider(): 'openai' | 'anthropic' | null {
    const provider = sessionStorage.getItem('lastProvider') as 'openai' | 'anthropic' | null
    return provider
}

/**
 * Retrieve the last used model from sessionStorage
 */
export function getLastModel(): string | null {
    const model = sessionStorage.getItem('lastModel')
    return model
} 