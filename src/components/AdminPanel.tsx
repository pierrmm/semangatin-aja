import { useState, useEffect } from 'react';
import { Quote } from '../types';
import { fetchQuotesFromDB, addQuote, editQuote, deleteQuote } from '../lib/quotes';
import SupabaseStats from './SupabaseStats';

interface AdminPanelProps {
    onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [newQuote, setNewQuote] = useState('');
    const [newAuthor, setNewAuthor] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editQuoteText, setEditQuoteText] = useState('');
    const [editAuthorText, setEditAuthorText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortBy, setSortBy] = useState<'author' | 'quote'>('author');
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    useEffect(() => {
        loadQuotes();
    }, []);

    // Add this to the loadQuotes function to filter out empty quotes
    const loadQuotes = async () => {
        setIsLoading(true);
        try {
            const fetchedQuotes = await fetchQuotesFromDB();
            // Filter out any quotes with empty text or author
            const validQuotes = fetchedQuotes.filter(q => q.quote?.trim() && q.author?.trim());
            setQuotes(validQuotes);
            if (validQuotes.length === 0) {
                setMessage('Tidak ada quote yang tersedia. Tambahkan quote baru.');
                setMessageType('error');
            } else {
                setMessage('');
            }
        } catch (error) {
            console.error('Error loading quotes:', error);
            setMessage('Gagal memuat quote. Silakan coba lagi.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuote = newQuote.trim();
        const trimmedAuthor = newAuthor.trim();
        
        if (!trimmedQuote || !trimmedAuthor) {
            setMessage('Quote dan author tidak boleh kosong');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        try {
            const success = await addQuote(trimmedQuote, trimmedAuthor);

            if (success) {
                setNewQuote('');
                setNewAuthor('');
                setMessage('Quote berhasil ditambahkan');
                setMessageType('success');
                await loadQuotes();
            } else {
                throw new Error('Failed to add quote');
            }
        } catch (error) {
            console.error('Error adding quote:', error);
            setMessage('Gagal menambahkan quote. Silakan coba lagi.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

 const handleEditClick = (quote: Quote) => {
    // Only set the ID if it exists, otherwise set null
    setEditingId(quote.id ?? null);
    setEditQuoteText(quote.quote);
    setEditAuthorText(quote.author);
};

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuote = editQuoteText.trim();
        const trimmedAuthor = editAuthorText.trim();
        
        if (!trimmedQuote || !trimmedAuthor || editingId === null) {
            setMessage('Quote dan author tidak boleh kosong');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        try {
            const success = await editQuote(editingId, trimmedQuote, trimmedAuthor);

            if (success) {
                setEditingId(null);
                setEditQuoteText('');
                setEditAuthorText('');
                setMessage('Quote berhasil diperbarui');
                setMessageType('success');
                await loadQuotes();
            } else {
                throw new Error('Failed to update quote');
            }
        } catch (error) {
            console.error('Error updating quote:', error);
            setMessage('Gagal memperbarui quote. Silakan coba lagi.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

 const handleDeleteQuote = async (id: number | undefined) => {
    // Early return if id is undefined
    if (id === undefined) {
        setMessage('Tidak dapat menghapus quote tanpa ID');
        setMessageType('error');
        return;
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus quote ini?')) {
        setIsLoading(true);
        setIsDeleting(id);
        try {
            const success = await deleteQuote(id);

            if (success) {
                setMessage('Quote berhasil dihapus');
                setMessageType('success');
                await loadQuotes();
            } else {
                throw new Error('Failed to delete quote');
            }
        } catch (error) {
            console.error('Error deleting quote:', error);
            setMessage('Gagal menghapus quote. Silakan coba lagi.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
            setIsDeleting(null);
        }
    }
};

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditQuoteText('');
        setEditAuthorText('');
    };

    // Filter and sort quotes
    const filteredQuotes = quotes.filter(quote => 
        quote.quote.toLowerCase().includes(searchTerm.toLowerCase()) || 
        quote.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedQuotes = [...filteredQuotes].sort((a, b) => {
        const valueA = sortBy === 'author' ? a.author.toLowerCase() : a.quote.toLowerCase();
        const valueB = sortBy === 'author' ? b.author.toLowerCase() : b.quote.toLowerCase();
        
        if (sortOrder === 'asc') {
            return valueA.localeCompare(valueB);
        } else {
            return valueB.localeCompare(valueA);
        }
    });

    const toggleSort = (field: 'author' | 'quote') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                        </svg>
                        Admin Panel
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white bg-gray-100 dark:bg-gray-700 rounded-full p-2 transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {message && (
                    <div className={`mb-4 p-4 rounded-lg flex items-center ${
                        messageType === 'success' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200'
                    }`}>
                        <span className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full mr-3 ${
                            messageType === 'success' 
                                ? 'bg-green-200 text-green-600 dark:bg-green-700 dark:text-green-200' 
                                : 'bg-red-200 text-red-600 dark:bg-red-700 dark:text-red-200'
                        }`}>
                            {messageType === 'success' ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                </svg>
                            )}
                        </span>
                        <div>{message}</div>
                        <button 
                            onClick={() => setMessage('')}
                            className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                            <span className="sr-only">Dismiss</span>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                            </svg>
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form untuk menambah quote */}
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Tambah Quote Baru
                        </h3>
                        <form onSubmit={handleAddQuote} className="space-y-4">
                            <div>
                                <label htmlFor="newQuote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quote</label>
                                <textarea
                                    id="newQuote"
                                    value={newQuote}
                                    onChange={(e) => setNewQuote(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    rows={3}
                                    placeholder="Masukkan quote motivasi"
                                />
                            </div>
                            <div>
                                <label htmlFor="newAuthor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
                                <input
                                    type="text"
                                    id="newAuthor"
                                    value={newAuthor}
                                    onChange={(e) => setNewAuthor(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Nama penulis quote"
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all flex items-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Menambahkan...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                            </svg>
                                            Tambah Quote
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Statistik Supabase */}
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                            Statistik Supabase
                        </h3>
                        <SupabaseStats />
                    </div>
                </div>

                {/* Daftar Quote */}
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                            Daftar Quote ({filteredQuotes.length})
                        </h3>
                        <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <input
                                type="search"
                                className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Cari quote atau author..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading && !isDeleting ? (
                        <div className="flex justify-center items-center py-10">
                            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : sortedQuotes.length === 0 ? (
                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p className="mt-4 text-gray-600 dark:text-gray-300">
                                {searchTerm ? 'Tidak ada quote yang sesuai dengan pencarian Anda.' : 'Belum ada quote yang tersedia.'}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Reset Pencarian
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                <button 
                                                    onClick={() => toggleSort('quote')} 
                                                    className="flex items-center focus:outline-none"
                                                >
                                                    Quote
                                                    {sortBy === 'quote' && (
                                                        <span className="ml-1">
                                                            {sortOrder === 'asc' ? (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                                </svg>
                                                            )}
                                                        </span>
                                                    )}
                                                </button>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                <button 
                                                    onClick={() => toggleSort('author')} 
                                                    className="flex items-center focus:outline-none"
                                                >
                                                    Author
                                                    {sortBy === 'author' && (
                                                        <span className="ml-1">
                                                            {sortOrder === 'asc' ? (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                                </svg>
                                                            )}
                                                        </span>
                                                    )}
                                                </button>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                                        {sortedQuotes.map((quote) => (
                                            <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <td className="px-6 py-4 whitespace-normal">
                                                    {editingId === quote.id ? (
                                                        <textarea
                                                            value={editQuoteText}
                                                            onChange={(e) => setEditQuoteText(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                                            rows={3}
                                                        />
                                                    ) : (
                                                        <div className="text-sm text-gray-900 dark:text-white">{quote.quote}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-normal">
                                                    {editingId === quote.id ? (
                                                        <input
                                                            type="text"
                                                            value={editAuthorText}
                                                            onChange={(e) => setEditAuthorText(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    ) : (
                                                        <div className="text-sm text-gray-500 dark:text-gray-300">{quote.author}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {editingId === quote.id ? (
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={handleEditSubmit}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                Simpan
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                                            >
                                                                Batal
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={() => handleEditClick(quote)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteQuote(quote.id)}
                                                                disabled={isDeleting === quote.id}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                                            >
                                                                {isDeleting === quote.id ? 'Menghapus...' : 'Hapus'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}