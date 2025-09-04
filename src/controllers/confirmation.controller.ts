import { Request, Response } from 'express';
import { prisma } from '../utils/database.js';

// For now, we'll store confirmations in a simple structure using the Conversation table
// Later, we can create a dedicated Confirmation table if needed

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

interface ConversationConfirmation {
  id?: string;
  conversationId: string;
  customerConfirmation: boolean;
  providerConfirmation: boolean;
  startDate: string | null;
  endDate: string | null;
  serviceFee?: number | null;
  currency?: string;
  updatedAt?: string;
}

// In-memory store for confirmations (temporary solution)
// In production, this should be a proper database table
const confirmationStore = new Map<string, ConversationConfirmation>();

export const getConfirmationController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    
    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Get confirmation from store or create default
    let confirmation = confirmationStore.get(conversationId);
    if (!confirmation) {
      confirmation = {
        id: `conf_${conversationId}`,
        conversationId,
        customerConfirmation: false,
        providerConfirmation: false,
        startDate: null,
        endDate: null,
        serviceFee: null,
        currency: 'USD',
        updatedAt: new Date().toISOString()
      };
      confirmationStore.set(conversationId, confirmation);
    }
    
    res.json(confirmation);
  } catch (error) {
    console.error('Error getting confirmation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createConfirmationController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId, customerConfirmation = false, providerConfirmation = false, startDate = null, endDate = null, serviceFee = null, currency = 'USD' } = req.body;
    
    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }
    
    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    const confirmation: ConversationConfirmation = {
      id: `conf_${conversationId}`,
      conversationId,
      customerConfirmation,
      providerConfirmation,
      startDate,
      endDate,
      serviceFee,
      currency,
      updatedAt: new Date().toISOString()
    };
    
    confirmationStore.set(conversationId, confirmation);
    res.status(201).json(confirmation);
  } catch (error) {
    console.error('Error creating confirmation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const upsertConfirmationController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const updates = req.body;
    
    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Get existing confirmation or create default
    let confirmation = confirmationStore.get(conversationId);
    if (!confirmation) {
      confirmation = {
        id: `conf_${conversationId}`,
        conversationId,
        customerConfirmation: false,
        providerConfirmation: false,
        startDate: null,
        endDate: null,
        serviceFee: null,
        currency: 'USD',
        updatedAt: new Date().toISOString()
      };
    }
    
    // Update with provided fields
    const updated: ConversationConfirmation = {
      ...confirmation,
      ...updates,
      conversationId, // Ensure conversationId is not overridden
      updatedAt: new Date().toISOString()
    };
    
    confirmationStore.set(conversationId, updated);
    res.json(updated);
  } catch (error) {
    console.error('Error updating confirmation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
