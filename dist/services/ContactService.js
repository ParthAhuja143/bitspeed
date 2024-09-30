"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
class ContactService {
    constructor(contactRepository) {
        this.contactRepository = contactRepository;
    }
    identify(email, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const relatedContacts = yield this.contactRepository.find({
                where: [
                    { email: email || undefined },
                    { phoneNumber: phoneNumber || undefined }
                ],
                order: { createdAt: 'ASC' }
            });
            let primaryContact;
            let secondaryContacts = [];
            if (relatedContacts.length === 0) {
                const newContactData = {
                    email: email || null,
                    phoneNumber: phoneNumber || null,
                    linkPrecedence: 'primary'
                };
                primaryContact = yield this.contactRepository.save(newContactData);
            }
            else {
                primaryContact = relatedContacts.find(c => c.linkPrecedence === 'primary') || relatedContacts[0];
                secondaryContacts = relatedContacts.filter(c => c.id !== primaryContact.id);
                const newInfoProvided = (email && !relatedContacts.some(c => c.email === email)) ||
                    (phoneNumber && !relatedContacts.some(c => c.phoneNumber === phoneNumber));
                if (newInfoProvided) {
                    const newSecondaryContactData = {
                        email: email || null,
                        phoneNumber: phoneNumber || null,
                        linkedId: primaryContact.id,
                        linkPrecedence: 'secondary'
                    };
                    const savedSecondaryContact = yield this.contactRepository.save(newSecondaryContactData);
                    secondaryContacts.push(savedSecondaryContact);
                }
                for (const contact of secondaryContacts) {
                    if (contact.linkedId !== primaryContact.id) {
                        yield this.contactRepository.update(contact.id, { linkedId: primaryContact.id });
                    }
                }
            }
            return primaryContact;
        });
    }
    getRelatedContacts(primaryContactId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.contactRepository.find({
                where: [
                    { id: primaryContactId },
                    { linkedId: primaryContactId }
                ]
            });
        });
    }
    formatResponse(primaryContact, secondaryContacts) {
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
exports.ContactService = ContactService;
