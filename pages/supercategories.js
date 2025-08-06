import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Swal from 'sweetalert2';
import { fetchSuperCategories, createSuperCategoryWithImage, updateSuperCategoryWithImage, deleteSuperCategory, fetchLanguages, fetchCountries } from '../context/apiHelpers';
import isAuth from '@/components/isAuth';

function SuperCategories() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [superCategories, setSuperCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    language_id: '',
    country: '',
    name: '',
    // description: '',
    status: 'active'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Fetch super categories and languages on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both super categories and languages
      const [superCategoriesResponse, languagesResponse, countryResponse] = await Promise.all([
        fetchSuperCategories(page, 10),
        fetchLanguages(),
        fetchCountries()
      ]);

      if (superCategoriesResponse.success) {
        setSuperCategories(superCategoriesResponse.data || []);
        setPagination(superCategoriesResponse.pagination || null);
      } else {
        setError(superCategoriesResponse.message || 'Failed to load super categories');
      }

      if (languagesResponse.success) {
        setLanguages(languagesResponse.data || []);
      }

      if (countryResponse.success) {
        setCountryList(countryResponse.data || []);
        console.log(countryResponse.data)
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
      key: 'image',
      label: 'Image',
      render: (value) => (
        <div className="flex items-center">
          {value ? (
            <img
              src={value}
              alt="Super category"
              className="w-8 h-8 object-cover rounded border"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded border flex items-center justify-center">
              <span className="text-xs text-gray-500">No img</span>
            </div>
          )}
        </div>
      )
    },

    {
      key: 'name',
      label: 'Super Category Name',
      render: (value) => (
        <div className="font-medium text-gray-900">{value || ''}</div>
      )
    },
    // {
    //   key: 'description',
    //   label: 'Description',
    //   render: (value) => (
    //     <div className="max-w-xs">
    //       <div className="text-sm text-gray-900 truncate">{value || ''}</div>
    //     </div>
    //   )
    // },
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

  const handleImageChange = (e) => {
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

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      language_id: '',
      name: '',
      // description: '',
      status: 'active'
    });
    clearImage();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    console.log(item);

    setEditingItem(item);
    setFormData({
      language_id: item.language_id._id,
      country: item.country,
      name: item.name,
      // description: item.description,
      status: item.status
    });
    setSelectedImage(null);
    setImagePreview(item.image || null);
    setShowModal(true);
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    await loadData(page);
  };

  const onSearch = async (e) => {
    const [superCategoriesResponse] = await Promise.all([
      fetchSuperCategories(1, 10, e),
    ]);

    if (superCategoriesResponse.success) {
      setSuperCategories(superCategoriesResponse.data || []);
      setPagination(superCategoriesResponse.pagination || null);
    } else {
      setError(superCategoriesResponse.message || 'Failed to load super categories');
    }
  }

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${item.name.en || item.name.hi}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteSuperCategory(item._id);
        if (response.success) {
          // Reload current page after deletion
          await loadData(currentPage);
          Swal.fire('Deleted!', 'Super Category has been deleted.', 'success');
        } else {
          Swal.fire('Error!', response.message || 'Failed to delete super category', 'error');
        }
      } catch (err) {
        console.error('Error deleting super category:', err);
        Swal.fire('Error!', err.message || 'Failed to delete super category', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('language_id', formData.language_id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('country', formData.country);
      // formDataToSend.append('description', formData.description);
      formDataToSend.append('status', formData.status);

      console.log('Form data being sent:', {
        language_id: formData.language_id,
        name: formData.name,
        country: formData.country,
        // description: formData.description,
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
        response = await updateSuperCategoryWithImage(editingItem._id, formDataToSend);
        if (response.success) {
          setSuperCategories(superCategories.map(cat =>
            cat._id === editingItem._id
              ? { ...cat, ...formData, image: response.data.image || cat.image }
              : cat
          ));
          Swal.fire('Updated!', 'Super Category has been updated.', 'success');
        }
      } else {
        // Add new item
        console.log('Creating new super category');
        response = await createSuperCategoryWithImage(formDataToSend);
        if (response.success) {
          setSuperCategories([response.data, ...superCategories]);
          Swal.fire('Created!', 'Super Category has been created.', 'success');
        }
      }

      if (response.success) {
        setShowModal(false);
        clearImage();
        // Reload current page after successful save
        await loadData(currentPage);
      } else {
        Swal.fire('Error!', response.message || 'Failed to save super category', 'error');
      }
    } catch (err) {
      console.error('Error saving super category:', err);
      Swal.fire('Error!', err.message || 'Failed to save super category', 'error');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading super categories...</p>
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
        data={superCategories}
        columns={columns}
        title="Super Categories"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search super categories..."
        pagination={pagination}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        onSearch={onSearch}
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
                    {editingItem ? 'Edit Super Category' : 'Add New Super Category'}
                  </h3>

                  <div className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Super Category Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                              <span className="text-xs text-gray-500">No img</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Max size: 5MB. Supported formats: JPG, PNG, GIF
                          </p>
                        </div>
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={clearImage}
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
                        onChange={(e) => setFormData({ ...formData, language_id: e.target.value })}
                        className="input-field text-gray-700"
                        required
                      >
                        <option value="">Select Language</option>
                        {languages.map((lang) => (
                          <option key={lang._id} value={lang._id}>
                            {lang.language_name} ({lang.language_code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="input-field text-gray-700"
                        required
                      >
                        <option value="">Select Country</option>
                        {countryList.map((lang) => (
                          <option key={lang._id} value={lang._id}>
                            {lang.country_name} ({lang.country_code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Super Category Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field text-gray-700"
                        required
                      />
                    </div>

                    {/* <div>
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
                    </div> */}

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
                      clearImage();
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
  );
}

export default isAuth(SuperCategories);