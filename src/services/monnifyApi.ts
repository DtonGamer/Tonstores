/**
 * API service to handle all requests to our Supabase edge functions
 * This replaces the old Netlify function calls
 */

export const monnifyApi = {
  // Subaccount management
  createSubaccount: async (data: any) => {
    const response = await fetch('/api/monnify-subaccount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create subaccount');
    }
    
    return response.json();
  },
  
  // Bank verification
  verifyAccount: async (data: { account_number: string; bank_code: string }) => {
    const response = await fetch('/api/monnify-verify-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to verify account');
    }
    
    return response.json();
  },
  
  // Get banks
  getBanks: async () => {
    const response = await fetch('/api/monnify-banks');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch banks');
    }
    
    return response.json();
  },
  
  // Initialize transaction
  initializeTransaction: async (data: any) => {
    const response = await fetch('/api/monnify-initialize-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to initialize transaction');
    }
    
    return response.json();
  },
  
  // Create split configuration
  createSplit: async (data: any) => {
    const response = await fetch('/api/monnify-create-split', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create split configuration');
    }
    
    return response.json();
  },
  
  // Get seller balance
  getSellerBalance: async (userId: string) => {
    const response = await fetch(`/api/monnify-seller-balance?userId=${userId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get seller balance');
    }
    
    return response.json();
  },
  
  // Get ledger history
  getLedgerHistory: async (userId: string, limit: number = 10, offset: number = 0) => {
    const response = await fetch(`/api/monnify-ledger-history?userId=${userId}&limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get ledger history');
    }
    
    return response.json();
  },
  
  // Get payout history
  getPayoutHistory: async (userId: string, limit: number = 10, offset: number = 0) => {
    const response = await fetch(`/api/monnify-payout-history?userId=${userId}&limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get payout history');
    }
    
    return response.json();
  },
  
  // Process payout
  processPayout: async (data: any) => {
    const response = await fetch('/api/monnify-process-payout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process payout');
    }
    
    return response.json();
  },
  
  // Webhook endpoint for Monnify notifications
  webhook: async (data: any) => {
    const response = await fetch('/api/monnify-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process webhook');
    }
    
    return response.json();
  }
};