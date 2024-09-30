import { Request, Response } from 'express';
import { ContactService } from '../services/ContactService';

export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  identify = async (req: Request, res: Response): Promise<void> => {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      res.status(400).json({ error: 'Email or phone number is required' });
      return;
    }

    try {
      const primaryContact = await this.contactService.identify(email, phoneNumber);
      const relatedContacts = await this.contactService.getRelatedContacts(primaryContact.id);
      const secondaryContacts = relatedContacts.filter(c => c.id !== primaryContact.id);
      const response = this.contactService.formatResponse(primaryContact, secondaryContacts);

      res.json(response);
    } catch (error) {
      console.error('Error in identify:', error);
      res.status(500).json({ error: 'An internal server error occurred' });
    }
  };
}