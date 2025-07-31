import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Swal from 'sweetalert2';
import { fetchLanguages, createLanguageWithImage, updateLanguageWithImage, deleteLanguage } from '../context/apiHelpers';

export default function Languages() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    language_name: '',
    language_code: '',
    status: 'active'
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Fetch languages on component mount
  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchLanguages(page, 10);
      if (response.success) {
        setLanguages(response.data || []);
        setPagination(response.pagination || null);
      } else {
        setError(response.message || 'Failed to load languages');
      }
    } catch (err) {
      console.error('Error loading languages:', err);
      setError(err.message || 'Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      
      if (!file.type.startsWith('image/')) {
        Swal.fire('Error!', 'Please select an image file', 'error');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire('Error!', 'Image size should be less than 10MB', 'error');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (value) => (
        <div className="flex items-center">
          {value ? (
            <img 
              src={value} 
              alt="Language" 
              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'language_name',
      label: 'Language Name',
      render: (value, item) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">Code: {item.language_code}</div>
        </div>
      )
    },
    {
      key: 'language_code',
      label: 'Language Code',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {value}
        </span>
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

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      language_name: '',
      language_code: '',
      status: 'active'
    });
    clearImage();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      language_name: item.language_name,
      language_code: item.language_code,
      status: item.status
    });
    setSelectedImage(null);
    setImagePreview(item.image || null);
    setShowModal(true);
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    await loadLanguages(page);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${item.language_name.en || item.language_name.hi}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteLanguage(item._id);
        if (response.success) {
          // Reload current page after deletion
          await loadLanguages(currentPage);
          Swal.fire('Deleted!', 'Language has been deleted.', 'success');
        } else {
          Swal.fire('Error!', response.message || 'Failed to delete language', 'error');
        }
      } catch (err) {
        console.error('Error deleting language:', err);
        Swal.fire('Error!', err.message || 'Failed to delete language', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('language_name', formData.language_name);
      formDataToSend.append('language_code', formData.language_code);
      formDataToSend.append('status', formData.status);
      
      console.log('Form data being sent:', {
        language_name: formData.language_name,
        language_code: formData.language_code,
        status: formData.status,
        hasImage: !!selectedImage
      });
      
      if (selectedImage) {
        console.log('Adding image to FormData:', selectedImage.name, selectedImage.size);
        formDataToSend.append('image', selectedImage);
      } else {
        console.log('No image selected');
      }
      
      if (editingItem) {
        // Update existing item
        response = await updateLanguageWithImage(editingItem._id, formDataToSend);
        if (response.success) {
          setLanguages(languages.map(lang => 
            lang._id === editingItem._id 
              ? { ...lang, ...formData, image: response.data.image || lang.image }
              : lang
          ));
          Swal.fire('Updated!', 'Language has been updated.', 'success');
        }
      } else {
        // Add new item
        console.log('Creating new language');
        response = await createLanguageWithImage(formDataToSend);
        if (response.success) {
          setLanguages([response.data, ...languages]);
          Swal.fire('Created!', 'Language has been created.', 'success');
        }
      }
      
      if (response.success) {
        setShowModal(false);
        clearImage();
        // Reload current page after successful save
        await loadLanguages(currentPage);
      } else {
        Swal.fire('Error!', response.message || 'Failed to save language', 'error');
      }
    } catch (err) {
      console.error('Error saving language:', err);
      Swal.fire('Error!', err.message || 'Failed to save language', 'error');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading languages...</p>
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
              onClick={loadLanguages}
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
        data={languages}
        columns={columns}
        title="Languages"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search languages..."
        pagination={pagination}
        onPageChange={handlePageChange}
        currentPage={currentPage}
      />

      {/* Modal */}
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
                    {editingItem ? 'Edit Language' : 'Add New Language'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language Name
                      </label>
                      <input
                        type="text"
                        value={formData.language_name}
                        onChange={(e) => setFormData({...formData, language_name: e.target.value})}
                        className="input-field text-gray-700"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language Code
                      </label>
                      <input
                        type="text"
                        value={formData.language_code}
                        onChange={(e) => setFormData({...formData, language_code: e.target.value.toLowerCase()})}
                        className="input-field text-gray-700"
                        maxLength="2"
                        placeholder="e.g., en, hi, es"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="input-field text-gray-700"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="input-field text-gray-700"
                      />
                      {selectedImage && (
                        <div className="mt-2 flex items-center">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-md border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="ml-2 btn-secondary btn-sm"
                          >
                            Clear Image
                          </button>
                        </div>
                      )}
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
                    onClick={() => setShowModal(false)}
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
  );
} 