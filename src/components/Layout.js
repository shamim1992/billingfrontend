import React, { useState, useMemo } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ProtectedRoute from './ProtectedRoute';
import { useSelector } from 'react-redux';
import { Sun, Moon, Sunrise, Sunset } from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const { greeting, icon: Icon } = useMemo(() => {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 4 && currentHour < 12) {
      return { greeting: 'Good Morning', icon: Sunrise };
    } else if (currentHour >= 12 && currentHour < 17) {
      return { greeting: 'Good Afternoon', icon: Sun };
    } else if (currentHour >= 17 && currentHour < 21) {
      return { greeting: 'Good Evening', icon: Sunset };
    } else {
      return { greeting: 'Good Night', icon: Moon };
    }
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar isOpen={sidebarOpen} />
        <div className="lg:ml-64 flex flex-col min-h-screen">
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                  {greeting}, {user?.name}! 
                  <span className="inline-flex items-center animate-bounce">
                    <Icon className="h-5 w-5 text-yellow-500" />
                  </span>
                </h1>
              </div>
              <div className="rounded-lg shadow-sm border p-6">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Layout;

// import React, { useState } from 'react';
// import Navbar from './Navbar';
// import Sidebar from './Sidebar';
// import ProtectedRoute from './ProtectedRoute';
// import { useSelector } from 'react-redux';

// const Layout = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const { user } = useSelector((state) => state.auth);

//   return (
//     <ProtectedRoute>
//       <div className="min-h-screen">
//         {sidebarOpen && (
//           <div 
//             className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-40"
//             onClick={() => setSidebarOpen(false)}
//           />
//         )}
//         <Sidebar isOpen={sidebarOpen} />
//         <div className="lg:ml-64 flex flex-col min-h-screen">
//           <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
//           <main className="flex-1 p-6">
//             <div className="max-w-7xl mx-auto">
//               <div className="mb-6">
//                 {/* greetings */}
//                 <h1 className="text-md font-semibold text-gray-800">Welcome! {user?.name}</h1>
//               </div>
//               <div className="rounded-lg shadow-sm border p-6">{children}</div>
//             </div>
//           </main>
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// };

// export default Layout;
