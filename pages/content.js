import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from "next/dynamic";
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import { Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import { IoCloseCircleOutline } from "react-icons/io5";

import {
  fetchContent,
  createContent,
  updateContent,
  deleteContent,
  fetchLanguages,
  fetchCountries,
  fetchSuperCategories,
  fetchCategories,
  fetchSubCategories,
  getAllLanguagess,
  getAllCountry,
  getAllSuperCategory,
  getAllCategory,
  getAllSubCategory,
} from '../context/apiHelpers';
import isAuth from '@/components/isAuth';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

// TipTap Editor Component
const TipTapEditor = dynamic(() => import('../components/TipTapEditor'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[200px] p-4 border border-gray-300 rounded-lg bg-gray-50 animate-pulse">
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  ),
  noSSR: true
});



function Content() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFullScreenEditor, setShowFullScreenEditor] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [countries, setCountries] = useState([]);
  const [superCategories, setSuperCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [formData, setFormData] = useState({
    language_id: '',
    // country_id: '',
    country: '',
    super_category_id: '',
    category_id: '',
    sub_category_id: '',
    content: '',
    status: 'active',
    logo: '',
    carouselImage: [],
  });
  const [editorContent, setEditorContent] = useState('');
  const [fullScreenContent, setFullScreenContent] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [allLanguages, setAllLanguages] = useState([]);
  const [allCountryList, setAllCountryList] = useState([]);
  const [allSuperCategoryList, setAllSuperCategoryList] = useState([]);
  const [allCategoryList, setAllCategoryList] = useState([]);
  const [allSubCategoryList, setAllSubCategoryList] = useState([]);
  const [subCategoryValue, setSubCategoryValue] = useState('');

  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [selectedCarouselImage, setSelectedCarouselImage] = useState([]);
  const [carouselImage, setCarouselImage] = useState([]);
  const [oldImages, setOldImages] = useState([])

  // Fetch all data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data
      const [
        contentResponse, languagesResponse, countriesResponse, superCategoriesResponse, categoriesResponse, subCategoriesResponse, allLanguagessResponse, allCountryResponse, allSuperCategoryResponse, allCategoryResponse, allSubCategoryResponse] = await Promise.all([
          fetchContent(page, 10),
          fetchLanguages(),
          fetchCountries(),
          fetchSuperCategories(),
          fetchCategories(),
          fetchSubCategories(),
          getAllLanguagess(),
          getAllCountry(),
          getAllSuperCategory(),
          getAllCategory(),
          getAllSubCategory(),
        ]);

      if (contentResponse.success) {
        console.log('Content Data:', contentResponse.data);
        console.log('First content item:', contentResponse.data[0]);
        setContent(contentResponse.data || []);
        setPagination(contentResponse.pagination || null);
      } else {
        setError(contentResponse.message || 'Failed to load content');
      }

      if (languagesResponse.success) {
        setLanguages(languagesResponse.data || []);
      }

      if (countriesResponse.success) {
        setCountries(countriesResponse.data || []);
      }

      if (superCategoriesResponse.success) {
        setSuperCategories(superCategoriesResponse.data || []);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }

      if (subCategoriesResponse.success) {
        setSubCategories(subCategoriesResponse.data || []);
      }

      if (allLanguagessResponse.success) {
        setAllLanguages(allLanguagessResponse.data || []);
      }

      if (allCountryResponse.success) {
        setAllCountryList(allCountryResponse.data || []);
      }

      if (allSuperCategoryResponse.success) {
        setAllSuperCategoryList(allSuperCategoryResponse.data || []);
      }

      if (allCategoryResponse.success) {
        setAllCategoryList(allCategoryResponse.data || []);
      }

      if (allSubCategoryResponse.success) {
        const data = allSubCategoryResponse.data.map(f => { return { ...f, value: f._id } })
        setAllSubCategoryList(data || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewContent = (item) => {
    setSelectedContent(item);
    setShowViewModal(true);
  };

  const columns = [
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
      // key: 'country_id',
      key: 'country',
      label: 'Country',
      render: (value) => (
        <div>
          <div className="font-medium text-gray-900">{value?.country_name || ''}</div>
          {/* <div className="text-sm text-gray-500">{value?.country_code || ''}</div> */}
        </div>
      )
    },
    {
      key: 'super_category_id',
      label: 'Super Category',
      render: (value) => (
        <div>
          <div className="font-medium text-gray-900">{value?.name || ''}</div>
          {/* <div className="text-sm text-gray-500 max-w-xs truncate">
            {value?.description ? (value.description.length > 30 ? value.description.substring(0, 30) + '...' : value.description) : ''}
          </div> */}
        </div>
      )
    },
    {
      key: 'category_id',
      label: 'Category',
      render: (value) => (
        <div>
          <div className="font-medium text-gray-900">{value?.name || ''}</div>
          <div className="text-sm text-gray-500">{value?.status || ''}</div>
        </div>
      )
    },
    {
      key: 'sub_category_id',
      label: 'Sub Category',
      render: (value) => (
        <div>
          <div className="font-medium text-gray-900">{value?.name || ''}</div>
          <div className="text-sm text-gray-500">{value?.status || ''}</div>
        </div>
      )
    },
    {
      key: 'content',
      label: 'Content Preview',
      render: (value) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900 truncate">
            {(value || '').replace(/<[^>]*>/g, '').substring(0, 14) + '...'}
          </div>
        </div>
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
    }
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      language_id: '',
      // country_id: '',
      country: '',
      super_category_id: '',
      category_id: '',
      sub_category_id: '',
      content: '',
      status: 'active',
      logo: '',
    });
    setEditorContent('');
    setShowModal(true);
    setOldImages([])
  };

  const handleEdit = (item) => {
    console.log('Edit item:', item);
    console.log('Language ID:', item.language_id);
    // console.log('Country ID:', item.country_id);
    console.log('Super Category ID:', item.super_category_id);
    console.log('Category ID:', item.category_id);
    console.log('Sub Category ID:', item.sub_category_id);

    setEditingItem(item);
    setFormData({
      language_id: typeof item.language_id === 'object' ? item.language_id._id : item.language_id,
      // country_id: typeof item.country_id === 'object' ? item.country_id._id : item.country_id,
      country: typeof item.country === 'object' ? item.country?._id : item.country,
      super_category_id: typeof item.super_category_id === 'object' ? item.super_category_id?._id : item.super_category_id,
      category_id: typeof item.category_id === 'object' ? item.category_id?._id : item.category_id,
      sub_category_id: typeof item.sub_category_id === 'object' ? item.sub_category_id._id : item.sub_category_id,
      content: item.content,
      status: item.status,
    });
    setEditorContent(item.content || '');
    setLogoPreview(item.logo || null);
    // setCarouselImage(item.carouselImage || []);
    setOldImages(item.carouselImage || [])
    setShowModal(true);
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    const contentResponse = await fetchContent(page, 10, subCategoryValue); console.log(contentResponse)
    if (contentResponse.success) {
      console.log('Content Data:', contentResponse.data);
      console.log('First content item:', contentResponse.data[0]);
      setContent(contentResponse.data || []);
      setPagination(contentResponse.pagination || null);
    }
    // await loadData(page);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteContent(item._id);
        if (response.success) {
          // Reload current page after deletion
          await loadData(currentPage);
          Swal.fire(
            'Deleted!',
            'Content has been deleted.',
            'success'
          );
        } else {
          Swal.fire(
            'Error!',
            response.message || 'Failed to delete content',
            'error'
          );
        }
      } catch (err) {
        console.error('Error deleting content:', err);
        Swal.fire(
          'Error!',
          err.message || 'Failed to delete content',
          'error'
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Debug: Log current state
      console.log('=== SUBMIT DEBUG ===');
      console.log('Current editorContent:', editorContent);
      console.log('Current formData.content:', formData);
      console.log('=== END SUBMIT DEBUG ===');

      // Create the final form data with current editor content
      let contentToUse = editorContent;

      // If editorContent is empty, try formData.content
      // if (!contentToUse) {
      //   contentToUse = formData.content;
      //   console.log('Using formData.content as fallback:', contentToUse);
      // }

      // const finalFormData = {
      //   ...formData,
      //   content: contentToUse,
      // };

      const finalFormData = new FormData();
      finalFormData.append('language_id', formData.language_id);
      finalFormData.append('country', formData.country);
      finalFormData.append('super_category_id', formData.super_category_id);
      finalFormData.append('category_id', formData.category_id);
      finalFormData.append('sub_category_id', formData.sub_category_id);
      finalFormData.append('status', formData.status);
      finalFormData.append('content', editorContent);
      finalFormData.append('oldImages', JSON.stringify(oldImages));

      if (selectedLogo) {
        // console.log('Adding image to FormData:', selectedImage.name, selectedImage.size);
        finalFormData.append('logo', selectedLogo);
      } else {
        console.log('No logo selected');
      }

      for (let i = 0; i < selectedCarouselImage.length; i++) {
        finalFormData.append('carouselImage', selectedCarouselImage[i]);
      }

      // if (selectedCarouselImage) {
      //   finalFormData.append('carouselImage', selectedCarouselImage);
      // } else {
      //   console.log('No carousel image selected');
      // }

      console.log(formData)
      // return
      // Validate that content is not empty

      // if (!finalFormData.content || finalFormData.content.trim() === '') {
      //   console.log('Content validation failed - content is empty');
      //   Swal.fire(
      //     'Error!',
      //     'Please enter some content before submitting.',
      //     'error'
      //   );
      //   return;
      // }

      console.log('=== FRONTEND CONTENT DEBUG ===');
      console.log('Editor content:', editorContent);
      console.log('Form data being sent:', finalFormData);
      console.log('=== END FRONTEND DEBUG ===');

      let response;

      if (editingItem) {
        // Update existing item
        response = await updateContent(editingItem._id, finalFormData);
        console.log('Update response:', response);
      } else {
        // Add new item
        response = await createContent(finalFormData);
        console.log('Create response:', response);
      }

      if (response.success) {
        setShowModal(false);
        clearImage();
        // Reset editor content after successful save
        setEditorContent('');
        setSelectedCarouselImage([]);
        setCarouselImage([]);
        setOldImages([]);
        // Update the content array with the new/updated data
        if (editingItem) {
          // Update existing item
          setContent(content.map(cont =>
            cont._id === editingItem._id
              ? response.data  // Use the populated data from response
              : cont
          ));
        } else {
          // Add new item at the beginning
          setContent([response.data, ...content]);
        }

        Swal.fire(
          'Success!',
          editingItem ? 'Content updated successfully!' : 'Content created successfully!',
          'success'
        );
      } else {
        console.log('Response error:', response);
        Swal.fire(
          'Error!',
          response.message || 'Failed to save content',
          'error'
        );
      }
    } catch (err) {
      console.error('Error saving content:', err);
      Swal.fire(
        'Error!',
        err.message || 'Failed to save content',
        'error'
      );
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

      setSelectedLogo(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedLogo(null);
    setLogoPreview(null);
  };

  const handleCarouselImageChange = (e) => {
    console.log(e?.target?.files)
    const file = e.target.files;
    console.log(file)
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire('Error!', 'Image size should be less than 10MB', 'error');
        return;
      }

      setSelectedCarouselImage([...file]);
      console.log(file.FileList)
      let imageArry = []
      for (let i = 0; i < file.length; i++) {
        console.log(file[i]);
        const reader = new FileReader();
        reader.onload = (e) => {
          console.log(e)
          imageArry.push(e.target.result)
          console.log(imageArry)
          setCarouselImage(imageArry)
        };
        reader.readAsDataURL(file[i]);

      }


    }
  };

  const carouselImageCloseIcon = (item, i) => {
    console.log(item, i);
    // let data = carouselImage;
    let data = oldImages;
    if (i > -1) {
      data.splice(i, 1);
    }
    console.log(data);
    // setCarouselImage([...carouselImage]);
    setOldImages([...oldImages])
    let datas = selectedCarouselImage;
    if (i > -1) {
      datas.splice(i, 1);
    }
    setSelectedCarouselImage([...selectedCarouselImage]);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading content...</p>
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
        data={content}
        columns={columns}
        title="Content"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleViewContent}
        searchPlaceholder="Search content..."
        pagination={pagination}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        showSearch={false}
        allSubCategoryList={allSubCategoryList}
        subCategoryData={async (e) => {
          const contentResponse = await fetchContent(1, 10, e); console.log(contentResponse)
          setSubCategoryValue(e);
          if (contentResponse.success) {
            console.log('Content Data:', contentResponse.data);
            console.log('First content item:', contentResponse.data[0]);
            setContent(contentResponse.data || []);
            setPagination(contentResponse.pagination || null);
          }
        }}
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all md:my-8 md:mx-8 sm:align-middle md:w-[95%] w-full">
              {/* sm:my-8 */}
              {/* sm:max-w-4xl sm:w-full */}
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingItem ? 'Edit Content' : 'Add New Content'}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <select
                        value={formData.language_id}
                        onChange={(e) => setFormData({ ...formData, language_id: e.target.value, country: '', super_category_id: '', category_id: '', sub_category_id: '', })}
                        className="input-field text-gray-700"
                        required
                      >
                        <option value="">Select Language</option>
                        {allLanguages.map((language) => (
                          <option key={language._id} value={language._id}>
                            {language.language_name} ({language.language_code})
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
                        {/* <option value="">Select Country</option> */}
                        <option value="">{allCountryList.filter(f => f.language_id._id === formData.language_id).length > 0 ? 'Select Country' : 'No Country Available'}</option>
                        {allCountryList.filter(f => f.language_id._id === formData.language_id).map((country) => (
                          <option key={country._id} value={country._id}>
                            {country.country_name}
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
                        {/* <option value="">Select Super Category</option> */}
                        <option value="">{allSuperCategoryList.filter(f => f.country?._id === formData.country).length > 0 ? 'Select Super Category' : 'No Super Category Available'}</option>
                        {allSuperCategoryList.filter(f => f.country?._id === formData.country).map((superCat) => (
                          <option key={superCat._id} value={superCat._id}>
                            {superCat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select disabled={!formData.language_id || !formData.country || !formData.super_category_id}
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="input-field text-gray-700"
                        required
                      >
                        {/* <option value="">Select Category</option> */}
                        <option value="">{allCategoryList.filter(f => f.super_category_id._id === formData.super_category_id).length > 0 ? 'Select Category' : 'No Category Available'}</option>
                        {allCategoryList.filter(f => f.super_category_id._id === formData.super_category_id).map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub Category
                      </label>
                      <select disabled={!formData.language_id || !formData.country || !formData.super_category_id || !formData.category_id}
                        value={formData.sub_category_id}
                        onChange={(e) => setFormData({ ...formData, sub_category_id: e.target.value })}
                        className="input-field text-gray-700"
                        required
                      >
                        {/* <option value="">Select Sub Category</option> */}
                        <option value="">{allSubCategoryList.filter(f => f.category_id?._id === formData.category_id).length > 0 ? 'Select Sub Category' : 'No Sub Category Available'}</option>
                        {allSubCategoryList.filter(f => f.category_id?._id === formData.category_id).map((subCat) => (
                          <option key={subCat._id} value={subCat._id}>
                            {subCat.name}
                          </option>
                        ))}
                      </select>
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

                    <div className='w-full'>
                      <div className='w-full'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Logo
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="input-field text-gray-700"
                          />
                        </div>
                      </div>
                      {logoPreview && (
                        <div className="flex items-center space-x-2 mt-5">
                          <img src={logoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="btn-secondary btn-sm"
                          >
                            Clear Image
                          </button>
                        </div>
                      )}
                    </div>

                    <div className='w-full'>
                      <div className='w-full'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Carousel Image
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleCarouselImageChange}
                            className="input-field text-gray-700"
                          />
                        </div>
                      </div>
                      {carouselImage && (
                        <div className="flex items-center space-x-2 mt-5">
                          {[...carouselImage, ...oldImages].map((item, i) => (<div key={i} className='w-16 h-16 relative'>
                            <img src={item} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
                            <IoCloseCircleOutline
                              className="text-red-700 cursor-pointer h-5 w-5 absolute top-0 right-0"
                              onClick={() => {
                                carouselImageCloseIcon(item, i)
                              }}
                            />
                          </div>))}

                          {/* <button
                            type="button"
                            onClick={clearImage}
                            className="btn-secondary btn-sm"
                          >
                            Clear Image
                          </button> */}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Content (HTML)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFullScreenContent(editorContent);
                          setShowFullScreenEditor(true);
                        }}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        Full Screen
                      </button>
                    </div>
                    <div className="p-1 text-black">
                      <div className="max-h-[300px] overflow-y-auto border border-gray-300 rounded-lg">
                        <TipTapEditor
                          value={editorContent}
                          onChange={setEditorContent}
                          placeholder="Enter your content here..."
                          className="min-h-[250px]"
                        />
                      </div>
                    </div>
                  </div> */}

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content (HTML)
                    </label>
                    <section className='relative'>
                      <div className='w-[99%] mx-auto md:w-full bg-white h-full border border-gray-300 rounded-lg p-3 md:p-3 flex flex-col overflow-auto space-y-4'>

                        <div className='w-full  text-sm md:text-md rounded-2xl  space-y-4 border-t-[10px] border-gray-300 text-black'>
                          <JoditEditor
                            className="editor max-h-screen overflow-auto"
                            rows={8}
                            value={editorContent}
                            onChange={setEditorContent}
                          />
                        </div>
                      </div>
                    </section>
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

      {/* Full Screen Editor Modal */}
      {showFullScreenEditor && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Full Screen Content Editor
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    // Update main editor content with full screen content
                    console.log('Saving full screen content:', fullScreenContent);
                    setEditorContent(fullScreenContent);
                    setShowFullScreenEditor(false);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save & Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Update main editor content with full screen content before closing
                    console.log('Closing full screen with content:', fullScreenContent);
                    setEditorContent(fullScreenContent);
                    setShowFullScreenEditor(false);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </button>
              </div>
            </div>

            {/* Editor Container */}
            <div className="flex-1 bg-white overflow-hidden">
              <div className="h-full p-4" style={{ height: 'calc(100vh - 120px)' }}>
                <div className="h-full overflow-y-auto border border-gray-300 rounded-lg">
                  <TipTapEditor
                    value={fullScreenContent}
                    onChange={setFullScreenContent}
                    placeholder="Enter your content here..."
                    className="h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Content Modal */}
      {showViewModal && selectedContent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Content Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <p className="text-sm text-gray-900">
                      {selectedContent.language_id?.language_name} ({selectedContent.language_id?.language_code})
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <p className="text-sm text-gray-900">
                      {selectedContent.country_id?.country_name || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Super Category</label>
                    <p className="text-sm text-gray-900">
                      {selectedContent.super_category_id?.name || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <p className="text-sm text-gray-900">
                      {selectedContent.category_id?.name || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
                    <p className="text-sm text-gray-900">
                      {selectedContent.sub_category_id?.name || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <p className="text-sm text-gray-900">
                      <span className={`status-${selectedContent.status}`}>
                        {selectedContent.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedContent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
                    <div
                      className="text-sm text-gray-900"
                      dangerouslySetInnerHTML={{ __html: selectedContent.content || '' }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default isAuth(Content);