import React, { useState, useEffect } from "react";
import {
    getAdminContacts,
    deleteAdminContact
} from "../utils/api";
import {
    MessageSquare,
    Mail,
    User,
    Calendar,
    Trash2,
    Eye,
    Search,
    Filter
} from "lucide-react";

const AdminContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const result = await getAdminContacts();
            setContacts(result);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
            setLoading(false);
        }
    };

    const handleDeleteContact = async (contactId) => {
        if (window.confirm('Are you sure you want to delete this contact message? This action cannot be undone.')) {
            try {
                await deleteAdminContact(contactId);
                fetchContacts();
                if (selectedContact && selectedContact.id === contactId) {
                    setSelectedContact(null);
                    setShowModal(false);
                }
            } catch (error) {
                console.error("Failed to delete contact:", error);
            }
        }
    };

    const handleViewContact = (contact) => {
        setSelectedContact(contact);
        setShowModal(true);
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ContactCard = ({ contact }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {contact.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Mail className="w-4 h-4 mr-1" />
                            {contact.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(contact.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleViewContact(contact)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200"
                        title="View Message"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200"
                        title="Delete Message"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="mt-4">
                <p className="text-gray-600 text-sm line-clamp-2">
                    {contact.message}
                </p>
            </div>
        </div>
    );

    const ContactModal = ({ contact, isOpen, onClose }) => {
        if (!isOpen || !contact) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Contact Message</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{contact.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{contact.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date Submitted</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {new Date(contact.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-900 whitespace-pre-wrap">{contact.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                handleDeleteContact(contact.id);
                                onClose();
                            }}
                            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
                        >
                            Delete Message
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading contact messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
                    <p className="mt-2 text-gray-600">Manage and respond to contact form submissions</p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Messages</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{contacts.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <MessageSquare className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">This Month</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {contacts.filter(contact => {
                                        const contactDate = new Date(contact.created_at);
                                        const now = new Date();
                                        return contactDate.getMonth() === now.getMonth() &&
                                               contactDate.getFullYear() === now.getFullYear();
                                    }).length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Today</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">
                                    {contacts.filter(contact => {
                                        const contactDate = new Date(contact.created_at);
                                        const today = new Date();
                                        return contactDate.toDateString() === today.toDateString();
                                    }).length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Mail className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                                {filteredContacts.length} of {contacts.length} messages
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contact Messages Grid */}
                {filteredContacts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredContacts.map((contact) => (
                            <ContactCard key={contact.id} contact={contact} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No contact messages found</h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try adjusting your search terms.' : 'No messages have been submitted yet.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Contact Modal */}
            <ContactModal
                contact={selectedContact}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
};

export default AdminContacts;