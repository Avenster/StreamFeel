import  { useState } from 'react';
import { Bell, MessageSquare, User, Menu, X, Home, BarChart2, Settings, Heart } from 'lucide-react';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Main Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-500 to-black w-6 h-6 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-3 h-3 text-white" />
                </div>
                <span className="ml-2 text-sm font-bold bg-gradient-to-r from-purple-600 to-black text-transparent bg-clip-text">
                  StreamFeel
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink icon={<Home className="w-3 h-3" />} text="Home" active />
              <NavLink icon={<BarChart2 className="w-3 h-3" />} text="Analytics" />
              <NavLink icon={<Heart className="w-3 h-3" />} text="Favorites" />
              <NavLink icon={<Settings className="w-3 h-3" />} text="Settings" />
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <button className="p-2 hover:bg-gray-100 rounded-full relative">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Messages */}
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MessageSquare className="w-4 h-4 text-gray-600" />
              </button>

              {/* Profile */}
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-black flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full"
              >
                {isOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white/95 backdrop-blur-lg z-40">
          <div className="p-4 space-y-4">
            <MobileNavLink icon={<Home className="w-6 h-6" />} text="Home" active />
            <MobileNavLink icon={<BarChart2 className="w-6 h-6" />} text="Analytics" />
            <MobileNavLink icon={<Heart className="w-6 h-6" />} text="Favorites" />
            <MobileNavLink icon={<Settings className="w-6 h-6" />} text="Settings" />
          </div>
        </div>
      )}
    </div>
  );
};

// Desktop Navigation Link Component
const NavLink = ({ icon, text, active }) => (
  <a
    href="*"
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      active
        ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600'
        : 'hover:bg-gray-50 text-gray-600'
    }`}
  >
    {icon}
    <span className={`text-sm ${active ? 'text-purple-600' : ''}`}>{text}</span>
  </a>
);

// Mobile Navigation Link Component
const MobileNavLink = ({ icon, text, active }) => (
  <a
    href="*"
    className={`flex items-center space-x-4 p-4 rounded-xl ${
      active
        ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600'
        : 'text-gray-600'
    }`}
  >
    {icon}
    <span className="font-medium text-lg">{text}</span>
  </a>
);

export default NavBar;



