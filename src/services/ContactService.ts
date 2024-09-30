import { Repository, DeepPartial } from 'typeorm';
import { Contact } from '../entities/Contact';

export class ContactService {
  constructor(private readonly contactRepository: Repository<Contact>) {}

  async identify(email: string | null, phoneNumber: string | null): Promise<Contact> {
    const relatedContacts = await this.contactRepository.find({
      where: [
        { email: email || undefined },
        { phoneNumber: phoneNumber || undefined }
      ],
      order: { createdAt: 'ASC' }
    });

    let primaryContact: Contact;
    let secondaryContacts: Contact[] = [];

    if (relatedContacts.length === 0) {
      const newContactData: DeepPartial<Contact> = {
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkPrecedence: 'primary'
      };
      primaryContact = await this.contactRepository.save(newContactData as Contact);
    } else {
      primaryContact = relatedContacts.find(c => c.linkPrecedence === 'primary') || relatedContacts[0];
      secondaryContacts = relatedContacts.filter(c => c.id !== primaryContact.id);

      const newInfoProvided = (email && !relatedContacts.some(c => c.email === email)) ||
                              (phoneNumber && !relatedContacts.some(c => c.phoneNumber === phoneNumber));

      if (newInfoProvided) {
        const newSecondaryContactData: DeepPartial<Contact> = {
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkedId: primaryContact.id,
          linkPrecedence: 'secondary'
        };
        const savedSecondaryContact = await this.contactRepository.save(newSecondaryContactData as Contact);
        secondaryContacts.push(savedSecondaryContact);
      }

      for (const contact of secondaryContacts) {
        if (contact.linkedId !== primaryContact.id) {
          await this.contactRepository.update(contact.id, { linkedId: primaryContact.id });
        }
      }
    }

    return primaryContact;
  }

  async getRelatedContacts(primaryContactId: number): Promise<Contact[]> {
    return this.contactRepository.find({
      where: [
        { id: primaryContactId },
        { linkedId: primaryContactId }
      ]
    });
  }

  formatResponse(primaryContact: Contact, secondaryContacts: Contact[]): any {
    const uniqueEmails = new Set([primaryContact.email, ...secondaryContacts.map(c => c.email)].filter(Boolean));
    const uniquePhoneNumbers = new Set([primaryContact.phoneNumber, ...secondaryContacts.map(c => c.phoneNumber)].filter(Boolean));

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails: Array.from(uniqueEmails),
        phoneNumbers: Array.from(uniquePhoneNumbers),
        secondaryContactIds: secondaryContacts.map(c => c.id)
      }
    };
  }
}