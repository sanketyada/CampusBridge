import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLink =
    "px-4 py-2 text-gray-600 font-medium hover:text-indigo-600 transition duration-300";

  const activeLink = "text-indigo-600 border-b-2 border-indigo-600";

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="text-2xl font-bold text-indigo-600">
            MyApp
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className={({ isActive }) =>
              `${navLink} ${isActive ? activeLink : ""}`
            }>
              Home
            </NavLink>

            <NavLink to="/collab" className={({ isActive }) =>
              `${navLink} ${isActive ? activeLink : ""}`
            }>
              Collab Alumni
            </NavLink>

            <NavLink to="/ai_model" className={({ isActive }) =>
              `${navLink} ${isActive ? activeLink : ""}`
            }>
              AI Model
            </NavLink>

            <NavLink to="/book" className={({ isActive }) =>
              `${navLink} ${isActive ? activeLink : ""}`
            }>
              Collage Essential
            </NavLink>

            <NavLink to="/style" className={({ isActive }) =>
              `${navLink} ${isActive ? activeLink : ""}`
            }>
              Style
            </NavLink>
          </div>

          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Login */}
            <button className="text-gray-600 hover:text-indigo-600 font-medium transition">
              Login
            </button>

            {/* Sign Up CTA */}
            <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 shadow-md hover:shadow-lg">
              Sign Up
            </button>

          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              <div className="space-y-1">
                <span className="block w-6 h-0.5 bg-gray-800"></span>
                <span className="block w-6 h-0.5 bg-gray-800"></span>
                <span className="block w-6 h-0.5 bg-gray-800"></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md px-6 py-4 space-y-3">
          <NavLink to="/" className="block text-gray-600">Home</NavLink>
          <NavLink to="/collab" className="block text-gray-600">Collab Alumni</NavLink>
          <NavLink to="/ai_model" className="block text-gray-600">AI Model</NavLink>
          <NavLink to="/book" className="block text-gray-600">Collage Essential</NavLink>
          <NavLink to="/style" className="block text-gray-600">Style</NavLink>

          <div className="pt-3 border-t space-y-2">
            <button className="w-full text-left text-gray-600">Login</button>
            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}