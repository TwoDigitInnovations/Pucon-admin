import { Api, ApiFormData } from '../service/service';

// Languages
export const fetchLanguages = (page = 1, limit = 10, search = '') => Api('get', `languages?page=${page}&limit=${limit}&search=${search}`);
export const getAllLanguagess = () => Api('get', `languages/getAllLanguagess`);
export const createLanguage = (data) => Api('post', 'languages', data);
export const createLanguageWithImage = (formData) => ApiFormData('post', 'languages', formData);
export const updateLanguage = (id, data) => Api('put', `languages/${id}`, data);
export const updateLanguageWithImage = (id, formData) => ApiFormData('put', `languages/${id}`, formData);
export const deleteLanguage = (id) => Api('delete', `languages/${id}`);

// Countries
export const fetchCountries = (page = 1, limit = 10, search = '') => Api('get', `countries?page=${page}&limit=${limit}&search=${search}`);
export const getAllCountry = () => Api('get', `countries/getAllCountry`);
export const createCountry = (data) => Api('post', 'countries', data);
export const createCountryWithImage = (formData) => ApiFormData('post', 'countries', formData);
export const updateCountry = (id, data) => Api('put', `countries/${id}`, data);
export const updateCountryWithImage = (id, formData) => ApiFormData('put', `countries/${id}`, formData);
export const deleteCountry = (id) => Api('delete', `countries/${id}`);

// Super Categories
export const fetchSuperCategories = (page = 1, limit = 10, search = '') => Api('get', `supercategories?page=${page}&limit=${limit}&search=${search}`);
export const getAllSuperCategory = () => Api('get', `supercategories/getAllSuperCategory`);
export const createSuperCategory = (data) => Api('post', 'supercategories', data);
export const createSuperCategoryWithImage = (formData) => ApiFormData('post', 'supercategories', formData);
export const updateSuperCategory = (id, data) => Api('put', `supercategories/${id}`, data);
export const updateSuperCategoryWithImage = (id, formData) => ApiFormData('put', `supercategories/${id}`, formData);
export const deleteSuperCategory = (id) => Api('delete', `supercategories/${id}`);

// Categories
export const fetchCategories = (page = 1, limit = 10, search = '') => Api('get', `categories?page=${page}&limit=${limit}&search=${search}`);
export const getAllCategory = () => Api('get', `categories/getAllCategory`);
export const createCategory = (data) => Api('post', 'categories', data);
export const createCategoryWithImage = (formData) => ApiFormData('post', 'categories', formData);
export const updateCategory = (id, data) => Api('put', `categories/${id}`, data);
export const updateCategoryWithImage = (id, formData) => ApiFormData('put', `categories/${id}`, formData);
export const deleteCategory = (id) => Api('delete', `categories/${id}`);

// Sub Categories
export const fetchSubCategories = (page = 1, limit = 10, search = '') => Api('get', `subcategories?page=${page}&limit=${limit}&search=${search}`);
export const getAllSubCategory = () => Api('get', `subcategories/getAllSubCategory`);
export const createSubCategory = (data) => Api('post', 'subcategories', data);
export const createSubCategoryWithImage = (formData) => ApiFormData('post', 'subcategories', formData);
export const updateSubCategory = (id, data) => Api('put', `subcategories/${id}`, data);
export const updateSubCategoryWithImage = (id, formData) => ApiFormData('put', `subcategories/${id}`, formData);
export const deleteSubCategory = (id) => Api('delete', `subcategories/${id}`);

// Content
export const fetchContent = (page = 1, limit = 10, subCategory = '') => Api('get', `content?page=${page}&limit=${limit}&subCategory=${subCategory}`);
export const createContent = (formData) => Api('post', 'content', formData);
export const updateContent = (id, formData) => Api('put', `content/${id}`, formData);
export const deleteContent = (id) => Api('delete', `content/${id}`);

// user
export const login = (data) => Api('post', 'user/login', data);

// carousel
export const getAllCarousel = (page = 1, limit = 10, search = '') => Api('get', `carousel/getAllCarousel?page=${page}&limit=${limit}&search=${search}`);
export const createCarousel = (formData) => ApiFormData('post', 'carousel/createCarousel', formData);
export const updateCarousel = (id, formData) => ApiFormData('put', `carousel/updateCarousel/${id}`, formData);
export const deleteCarousel = (id) => Api('delete', `carousel/deleteCarousel/${id}`);