import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import Layout from '@/components/Layout'
import DataTable from '../components/DataTable';
import Swal from 'sweetalert2';
import { getAllCarousel, createCarousel, updateCarousel, deleteCarousel, getAllLanguagess } from '../context/apiHelpers';
import isAuth from '@/components/isAuth';

function Carousel() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [carouselList, setCarouselList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingItem, setEditingItem] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        language_id: '',
        title: '',
        description: '',
        order: '',
        status: 'active'
    });
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [allLanguages, setAllLanguages] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            // Fetch both countries and languages
            const [carouselResponse, allLanguagessResponse] = await Promise.all([
                getAllCarousel(page, 10),
                getAllLanguagess()
            ]);

            if (carouselResponse.success) {
                setCarouselList(carouselResponse.data || []);
                setPagination(carouselResponse.pagination || null);
            } else {
                setError(carouselResponse.message || 'Failed to load carousel');
            }

            if (allLanguagessResponse.success) {
                setAllLanguages(allLanguagessResponse.data || []);
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'logo',
            label: 'Logo',
            render: (value) => (
                <div className="flex items-center">
                    {value ? (
                        <img
                            src={value}
                            alt="Country flag"
                            className="w-8 h-6 object-cover rounded border"
                        />
                    ) : (
                        <div className="w-8 h-6 bg-gray-200 rounded border flex items-center justify-center">
                            <span className="text-xs text-gray-500">No flag</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'image',
            label: 'image',
            render: (value) => (
                <div className="flex items-center">
                    {value ? (
                        <img
                            src={value}
                            alt="Country map"
                            className="w-8 h-6 object-cover rounded border"
                        />
                    ) : (
                        <div className="w-8 h-6 bg-gray-200 rounded border flex items-center justify-center">
                            <span className="text-xs text-gray-500">No image</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'title',
            label: 'Carousel Name',
            render: (value) => (
                <div className="font-medium text-gray-900">{value || ''}</div>
            )
        },
        {
            key: 'language_id',
            label: 'Language',
            render: (value) => {
                if (!value) return <div>No Language</div>;
                return (
                    <div>
                        <div className="font-medium text-gray-900">{value.language_name}</div>
                        <div className="text-sm text-gray-500">Code: {value.language_code}</div>
                    </div>
                );
            }
        },
        {
            key: 'order',
            label: 'Order',
            render: (value) => (
                <div className="font-medium text-gray-900">{value}</div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <span className={`status-${value}`}>
                    {value === 'active' ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: 'createdAt',
            label: 'Created At',
            render: (value) => new Date(value).toLocaleDateString()
        }
    ];

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                Swal.fire('Error!', 'Please select an image file.', 'error');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire('Error!', 'Image size should be less than 5MB.', 'error');
                return;
            }

            if (type === 'logo') {
                setSelectedLogo(file);
                // Create preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    setLogoPreview(e.target.result);
                };
                reader.readAsDataURL(file);
            } else if (type === 'image') {
                setSelectedImage(file);
                // Create preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const clearImage = (type) => {
        if (type === 'logo') {
            setSelectedLogo(null);
            setLogoPreview(null);
        } else if (type === 'image') {
            setSelectedImage(null);
            setImagePreview(null);
        }
    };

    const clearAllImages = () => {
        setSelectedLogo(null);
        setSelectedImage(null);
        setLogoPreview(null);
        setImagePreview(null);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setFormData({
            title: '',
            description: '',
            status: 'active'
        });
        clearAllImages();
        setShowModal(true);
    };

    const handleEdit = (item) => {
        console.log(item);
        setEditingItem(item);
        setFormData({
            language_id: item.language_id._id,
            title: item.title,
            description: item.description,
            order: item.order,
            status: item.status
        });
        setSelectedLogo(null);
        setSelectedImage(null);
        setLogoPreview(item.logo || null);
        setImagePreview(item.image || null);
        setShowModal(true);
    };

    const handleDelete = async (item) => {
        console.log(item)
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${item.title}". This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const response = await deleteCarousel(item._id);
                if (response.success) {
                    await loadData(currentPage);
                    Swal.fire('Deleted!', 'Carousel has been deleted.', 'success');
                } else {
                    Swal.fire('Error!', response.message || 'Failed to delete carousel', 'error');
                }
            } catch (err) {
                console.error('Error deleting carousel:', err);
                Swal.fire('Error!', err.message || 'Failed to delete carousel', 'error');
            }
        }
    };

    const handlePageChange = async (page) => {
        setCurrentPage(page);
        await loadData(page);
    };

    const onSearch = async (e) => {
        console.log(e)
        const [carouselResponse] = await Promise.all([
            getAllCarousel(1, 10, e),
        ]);

        if (carouselResponse.success) {
            setCarouselList(carouselResponse.data || []);
            setPagination(carouselResponse.pagination || null);
        } else {
            setError(carouselResponse.message || 'Failed to load carouse');
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // return
        try {
            let response;

            const formDataToSend = new FormData();
            formDataToSend.append('language_id', formData.language_id);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('order', formData.order);
            formDataToSend.append('status', formData.status);

            if (selectedLogo) {
                formDataToSend.append('logo', selectedLogo);
            }

            if (selectedImage) {
                formDataToSend.append('image', selectedImage);
            }

            // console.log(formData);
            // console.log(selectedLogo);
            // console.log(selectedImage);
            // return

            if (editingItem) {
                // Update existing item
                console.log('Updating country with ID:', editingItem._id);
                response = await updateCarousel(editingItem._id, formDataToSend);
                if (response.success) {
                    setCarouselList(carouselList.map(carousel =>
                        carousel._id === editingItem._id
                            ? {
                                ...carousel,
                                ...formData,
                                logo: response.data.logo || carousel.logo,
                                image: response.data.image || carousel.image
                            }
                            : carousel
                    ));
                    Swal.fire('Updated!', 'Carousel has been updated.', 'success');
                }
            } else {
                // Add new item
                console.log('Creating new country');
                response = await createCarousel(formDataToSend);
                if (response.success) {
                    setCarouselList([response.data, ...carouselList]);
                    Swal.fire('Created!', 'Carousel has been created.', 'success');
                }
            }

            if (response.success) {
                setShowModal(false);
                clearAllImages();
                // Reload current page after successful save
                await loadData(currentPage);
            } else {
                console.error('API response error:', response);
                Swal.fire('Error!', response.message || 'Failed to save carousel', 'error');
            }
        } catch (err) {
            console.error('Error saving country:', err);
            console.error('Error details:', {
                message: err.message,
                code: err.code,
                response: err.response?.data
            });
            Swal.fire('Error!', err.message || 'Failed to save carousel', 'error');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading carousel...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="text-red-600 mb-4">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={loadData}
                            className="btn-primary"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <DataTable
                data={carouselList}
                columns={columns}
                title="Carousel"
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchPlaceholder="Search carousel name..."
                pagination={pagination}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                onSearch={onSearch}
            />

            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingItem ? 'Edit Carousel' : 'Add New Carousel'}
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Flag Image Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Logo
                                            </label>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    {logoPreview ? (
                                                        <img
                                                            src={logoPreview}
                                                            alt="Flag Preview"
                                                            className="w-16 h-12 object-cover rounded border"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-12 bg-gray-200 rounded border flex items-center justify-center">
                                                            <span className="text-xs text-gray-500">No logo</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageChange(e, 'logo')}
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Max size: 5MB. Supported formats: JPG, PNG, GIF
                                                    </p>
                                                </div>
                                                {logoPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={() => clearImage('logo')}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Map Image Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Image
                                            </label>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    {imagePreview ? (
                                                        <img
                                                            src={imagePreview}
                                                            alt="Map Preview"
                                                            className="w-16 h-12 object-cover rounded border"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-12 bg-gray-200 rounded border flex items-center justify-center">
                                                            <span className="text-xs text-gray-500">No image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageChange(e, 'image')}
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Max size: 5MB. Supported formats: JPG, PNG, GIF
                                                    </p>
                                                </div>
                                                {imagePreview && (
                                                    <button
                                                        type="button"
                                                        onClick={() => clearImage('image')}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Language
                                            </label>
                                            <select
                                                value={formData.language_id}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, language_id: e.target.value })}
                                                className="input-field text-gray-700"
                                                required
                                            >
                                                <option value="">Select Language</option>
                                                {allLanguages.map(lang => (
                                                    <option key={lang._id} value={lang._id}>
                                                        {lang.language_name} ({lang.language_code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Carousel Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="input-field text-gray-700"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Order
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.order}
                                                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                                className="input-field text-gray-700"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="input-field text-gray-700"
                                                rows="3"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="input-field text-gray-700"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="btn-primary w-full sm:w-auto sm:ml-3"
                                    >
                                        {editingItem ? 'Update' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            clearAllImages();
                                        }}
                                        className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </Layout>
    )
}

export default isAuth(Carousel)
