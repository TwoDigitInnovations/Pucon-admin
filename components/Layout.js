import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Languages,
  Globe,
  FolderKanban,
  Folder,
  FolderOpen,
  FileText,
  Tag,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { PiSignOutFill } from "react-icons/pi";
import Swal from "sweetalert2";
import { TbBuildingCarousel } from "react-icons/tb";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, setUser } = useAppContext()
  console.log(user)

  useEffect(() => {
    getUserDetail();
  }, []);

  const getUserDetail = async () => {
    const user = localStorage.getItem("userDetail");
    console.log("drfdtftfyfgyhftgytgfygf", user);
    if (user) {
      setUser(JSON.parse(user));
    }
  };

  const navigation = [
    {
      name: 'Languages',
      href: '/languages',
      icon: <Languages className="w-5 h-5 mr-3" />, // Lucide Languages
      current: router.pathname === '/languages'
    },
    {
      name: 'Cities',
      href: '/countries',
      icon: <Globe className="w-5 h-5 mr-3" />, // Lucide Globe
      current: router.pathname === '/countries'
    },
    {
      name: 'Super Categories',
      href: '/supercategories',
      icon: <Tag className="w-5 h-5 mr-3" />, // Lucide Tag
      current: router.pathname === '/supercategories'
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: <Folder className="w-5 h-5 mr-3" />, // Lucide Folder
      current: router.pathname === '/categories'
    },
    {
      name: 'Sub Categories',
      href: '/subcategories',
      icon: <FolderOpen className="w-5 h-5 mr-3" />, // Lucide FolderOpen
      current: router.pathname === '/subcategories'
    },
    {
      name: 'Content',
      href: '/content',
      icon: <FileText className="w-5 h-5 mr-3" />, // Lucide FileText
      current: router.pathname === '/content'
    },
    {
      name: 'Carousel',
      href: '/carousel',
      icon: <TbBuildingCarousel className="w-5 h-5 mr-3" />, // Lucide FileText
      current: router.pathname === '/carousel'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed position with CSS class */}
      <div className={`sidebar-fixed w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Pucon Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${item.current
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                onClick={() => { setSidebarOpen(false); console.log(item.href) }}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}

            <div className='group flex md:hidden items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900' onClick={() => {
              Swal.fire({
                title: "Are you sure?",
                text: "Do you want to sign out?",
                icon: "warning",
                showCancelButton: true,
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes",
                confirmButtonColor: "rgb(37 99 235)",
                cancelButtonText: "No",
              }).then(function (result) {
                if (result.isConfirmed) {
                  setSidebarOpen(false);
                  setUser({});
                  localStorage.removeItem("userDetail");
                  localStorage.removeItem("token");
                  router.push("/login");
                }
              })
            }}>
              <PiSignOutFill className="w-5 h-5 mr-3 text-gray-700" />
              <p className="text-sm font-medium text-gray-700">Sign Out</p>
            </div>
          </div>
        </nav>
      </div >

      {/* Main content - With proper left margin for fixed sidebar */}
      < div className="main-content" >
        {/* Top bar - Fixed at top */}
        < div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200" >
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => item.current)?.name || 'Dashboard'}
              </h2>
            </div> */}

            {user?.token && (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{user?.username?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                </div>
              </div>
            )}

            {/* {!user?.token && ( */}
            <div className="flex items-center space-x-4"
              onClick={() => {
                Swal.fire({
                  title: "Are you sure?",
                  text: "Do you want to sign out?",
                  icon: "warning",
                  showCancelButton: true,
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes",
                  confirmButtonColor: "rgb(37 99 235)",
                  cancelButtonText: "No",
                }).then(function (result) {
                  if (result.isConfirmed) {
                    setUser({});
                    localStorage.removeItem("userDetail");
                    localStorage.removeItem("token");
                    router.push("/login");
                  }
                })
              }}
            >
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <PiSignOutFill className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Sign Out</span>
              </div>
            </div>
            {/* )} */}

          </div>
        </div >

        {/* Page content */}
        < main className="p-4 sm:p-6 lg:p-8" >
          {children}
        </main >
      </div >
    </div >
  );
};

export default Layout; 