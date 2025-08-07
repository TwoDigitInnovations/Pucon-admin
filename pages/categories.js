import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Swal from 'sweetalert2';
import { fetchCategories, createCategoryWithImage, updateCategoryWithImage, deleteCategory, fetchSuperCategories, fetchLanguages, fetchCountries } from '../context/apiHelpers';
import isAuth from '@/components/isAuth';

function Categories() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [superCategories, setSuperCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    language_id: '',
    country: '',
    super_category_id: '',
    name: '',
    status: 'active'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [countryList, setCountryList] = useState([]);

  // Fetch categories and super categories on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories, super categories, and languages
      const [categoriesResponse, superCategoriesResponse, languagesResponse, countryResponse] = await Promise.all([
        fetchCategories(page, 10),
        fetchSuperCategories(),
        fetchLanguages(),
        fetchCountries()
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
        setPagination(categoriesResponse.pagination || null);
      } else {
        setError(categoriesResponse.message || 'Failed to load categories');
      }

      if (superCategoriesResponse.success) {
        setSuperCategories(superCategoriesResponse.data || []);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
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
    // {
    //   key: 'image',
    //   label: 'Image',
    //   render: (value) => (
    //     <div className="flex items-center">
    //       {value ? (
    //         <img
    //           src={value}
    //           alt="Category"
    //           className="w-12 h-12 object-cover rounded-lg border border-gray-200"
    //           onError={(e) => {
    //             e.target.style.display = 'none';
    //             e.target.nextSibling.style.display = 'block';
    //           }}
    //         />
    //       ) : (
    //         <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
    //           <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    //           </svg>
    //         </div>
    //       )}
    //     </div>
    //   )
    // },
    {
      // key: 'id',
      label: "Index",
      render: (value, item, index) => {
        console.log(index)
        return (
          <div className="font-medium text-gray-900">{index + 1}</div>
        )
      }
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
      key: 'country',
      label: 'Country',
      render: (value) => {
        console.log(value)
        if (!value) return <div>No Country</div>;
        return (
          <div>
            <div className="font-medium text-gray-900">{value?.country_name}</div>
          </div>
        );
      }
    },
    {
      key: 'name',
      label: 'Category Name',
      render: (value) => (
        <div className="font-medium text-gray-900">{value || ''}</div>
      )
    },
    {
      key: 'super_category_id',
      label: 'Super Category',
      render: (value) => (
        <div className="font-medium text-gray-900">{value?.name || 'N/A'}</div>
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
      language_id: '',
      country: '',
      super_category_id: '',
      name: '',
      status: 'active'
    });
    clearImage();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    console.log(item);
    setEditingItem(item);
    setFormData({
      language_id: item.language_id._id || '',
      country: item.country._id,
      super_category_id: item.super_category_id._id || item.super_category_id,
      name: item.name,
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
    const [categoriesResponse] = await Promise.all([
      fetchCategories(1, 10, e),
    ]);

    if (categoriesResponse.success) {
      setCategories(categoriesResponse.data || []);
      setPagination(categoriesResponse.pagination || null);
    } else {
      setError(categoriesResponse.message || 'Failed to load categories');
    }
  }

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${item.name}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteCategory(item._id);
        if (response.success) {
          // Reload current page after deletion
          await loadData(currentPage);
          Swal.fire('Deleted!', 'Category has been deleted.', 'success');
        } else {
          Swal.fire('Error!', response.message || 'Failed to delete category', 'error');
        }
      } catch (err) {
        console.error('Error deleting category:', err);
        Swal.fire('Error!', err.message || 'Failed to delete category', 'error');
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
      formDataToSend.append('country', formData.country);
      formDataToSend.append('super_category_id', formData.super_category_id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('status', formData.status);

      console.log('Form data being sent:', {
        language_id: formData.language_id,
        country: formData.country,
        super_category_id: formData.super_category_id,
        name: formData.name,
        status: formData.status,
        // hasImage: !!selectedImage
      });

      // if (selectedImage) {
      //   console.log('Adding image to FormData:', selectedImage.name, selectedImage.size);
      //   formDataToSend.append('image', selectedImage);
      // } else {
      //   console.log('No image selected');
      // }

      if (editingItem) {
        // Update existing item
        response = await updateCategoryWithImage(editingItem._id, formDataToSend);
        if (response.success) {
          setCategories(categories.map(cat =>
            cat._id === editingItem._id
              ? { ...cat, ...formData, image: response.data.image || cat.image }
              : cat
          ));
          Swal.fire('Updated!', 'Category has been updated.', 'success');
        }
      } else {
        // Add new item
        console.log('Creating new category');
        response = await createCategoryWithImage(formDataToSend);
        if (response.success) {
          setCategories([response.data, ...categories]);
          Swal.fire('Created!', 'Category has been created.', 'success');
        }
      }

      if (response.success) {
        setShowModal(false);
        clearImage();
        // Reload current page after successful save
        await loadData(currentPage);
      } else {
        Swal.fire('Error!', response.message || 'Failed to save category', 'error');
      }
    } catch (err) {
      console.error('Error saving category:', err);
      Swal.fire('Error!', err.message || 'Failed to save category', 'error');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading categories...</p>
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
        data={categories}
        columns={columns}
        title="Categories"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search categories..."
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

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle md:w-[512px] w-full">
              {/* sm:max-w-lg sm:w-full */}
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingItem ? 'Edit Category' : 'Add New Category'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <select
                        value={formData.language_id}
                        onChange={(e) => setFormData({ ...formData, language_id: e.target.value, country: '', super_category_id: '' })}
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
                      <select disabled={!formData.language_id}
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="input-field text-gray-700"
                        required
                      >
                        <option value="">{countryList.filter(f => f.language_id._id === formData.language_id).length > 0 ? 'Select Country' : 'No Country Available'}</option>
                        {countryList.filter(f => f.language_id._id === formData.language_id).map((lang) => (
                          <option key={lang._id} value={lang._id}>
                            {lang.country_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Super Category
                      </label>
                      <select disabled={!formData.language_id || !formData.country}
                        value={formData.super_category_id}
                        onChange={(e) => setFormData({ ...formData, super_category_id: e.target.value })}
                        className="input-field text-gray-700"
                        required
                      >
                        <option value="">{superCategories.filter(f => f.country._id === formData.country).length > 0 ? 'Select Super Category' : 'No Super Category Available'}</option>
                        {superCategories.filter(f => f.country._id === formData.country).map((superCat) => (
                          <option key={superCat._id} value={superCat._id}>
                            {superCat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field text-gray-700"
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

                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="input-field text-gray-700"
                        />
                        {imagePreview && (
                          <div className="flex items-center space-x-2">
                            <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                            <button
                              type="button"
                              onClick={clearImage}
                              className="btn-secondary btn-sm mt-2"
                            >
                              Clear Image
                            </button>
                          </div>
                        )}
                      </div>
                    </div> */}
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

export default isAuth(Categories);