import { useEffect, useState } from 'react';
import SelectSearch from 'react-select-search';
import 'react-select-search/style.css'

const DataTable = ({
  data,
  columns,
  title,
  onAdd,
  onEdit,
  onDelete,
  onView,
  searchPlaceholder = "Search...",
  showSearch = true,
  showAddButton = true,
  // Pagination props
  pagination = null,
  onPageChange = null,
  currentPage = 1,
  itemsPerPage = 10,
  onSearch,
  allSubCategoryList,
  subCategoryData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAllSubCategoryList, setSelectAllSubCategoryList] = useState('');

  // Use server-side pagination if available, otherwise use client-side
  const isServerSidePagination = pagination && onPageChange;

  let filteredData = data;
  let totalPages = 1;
  let totalCount = data.length;
  let currentItems = data;

  if (isServerSidePagination) {
    // Server-side pagination
    currentItems = data;
    totalPages = pagination.totalPages;
    totalCount = pagination.totalCount;
  } else {
    // Client-side pagination (existing logic)
    filteredData = data.filter(item =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    totalPages = Math.ceil(filteredData.length / itemsPerPage);
    totalCount = filteredData.length;
  }

  const handlePageChange = (pageNumber) => {
    if (isServerSidePagination) {
      onPageChange(pageNumber);
    } else {
      // Client-side pagination - handled by local state
      // This would need to be implemented if we want to keep client-side pagination
    }
  };

  const indexOfFirstItem = isServerSidePagination
    ? (pagination.currentPage - 1) * pagination.limit
    : (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = isServerSidePagination
    ? Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)
    : Math.min(currentPage * itemsPerPage, totalCount);

  useEffect(() => {
    console.log(title)
  }, []);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {showSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); onSearch && onSearch(e.target.value) }}
                className="input-field pl-10"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}

          {title === 'Content' &&
            <div className='md:mb-0 mb-3'>
              <SelectSearch
                search={true}
                options={allSubCategoryList}
                value={selectAllSubCategoryList}
                onChange={((e) => {
                  console.log('category=================>', e)
                  setSelectAllSubCategoryList(e)
                  subCategoryData(e)
                })}
                name="language" placeholder="Search sub categories" />
            </div>}

          {showAddButton && onAdd && (
            <button
              onClick={onAdd}
              className="btn-primary flex items-center space-x-2 w-[170px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center space-y-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">No data found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((item, index) => (
                <tr key={item.id || index} className="table-row-hover">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(item[column.key], item, index) : item[column.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {onView && (
                        <button
                          onClick={() => onView(item)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalCount)} of {totalCount} results
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange((isServerSidePagination ? pagination.currentPage : currentPage) - 1)}
              disabled={(isServerSidePagination ? pagination.currentPage : currentPage) === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${(isServerSidePagination ? pagination.currentPage : currentPage) === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange((isServerSidePagination ? pagination.currentPage : currentPage) + 1)}
              disabled={(isServerSidePagination ? pagination.currentPage : currentPage) === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable; 