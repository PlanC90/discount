import React from 'react';
import CouponCard from './CouponCard';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  bannerLoaded: boolean;
  handleBannerLoad: () => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  detectedCountry: string;
  featuredCoupons: any[];
  loading: boolean;
  currentCoupons: any[];
  getCouponColumns: () => string;
  paginate: (pageNumber: number) => void;
  pageNumbers: number[];
  categories: string[];
  countries: string[];
  brands: string[];
  currentPage: number;
}

const Home: React.FC<HomeProps> = ({
  searchTerm,
  setSearchTerm,
  bannerLoaded,
  handleBannerLoad,
  selectedCategory,
  setSelectedCategory,
  selectedCountry,
  setSelectedCountry,
  selectedBrand,
  setSelectedBrand,
  detectedCountry,
  featuredCoupons,
  loading,
  currentCoupons,
  getCouponColumns,
  paginate,
  pageNumbers,
  categories,
  countries,
  brands,
  currentPage,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const couponVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <>
      <input
        type="text"
        placeholder="Search coupons..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input mb-4 w-full sm:w-auto"
      />
      <img
        src="https://cdn.glitch.global/c0240ef5-b1d3-409c-a790-588d18d5cf32/memex-banner-3.jpg"
        alt="Discount Banner"
        className={`coupon-banner mb-4 ${bannerLoaded ? 'loaded' : 'loading'}`}
        onLoad={handleBannerLoad}
      />

      {/* Category, Country and Brand Selectors */}
      <div className="flex justify-between mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="form-input w-1/3 mr-2"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="form-input w-1/3 mr-2"
        >
          <option value="">All Countries</option>
          <option value="all">Select All Countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="form-input w-1/3"
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Detected Country Display */}
      {detectedCountry && (
        <div className="mb-4">
          <p className="text-white">Detected Country: {detectedCountry}</p>
        </div>
      )}

      <motion.div
        className={`grid ${getCouponColumns()} gap-6`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : currentCoupons.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No approved coupons match your search</p>
        ) : (
          currentCoupons.map((coupon) => (
            <motion.div key={coupon.id} variants={couponVariants}>
              <CouponCard
                key={coupon.id}
                coupon={coupon}
              />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      <nav className="pagination">
        <ul className="pagination-list">
          {pageNumbers.map(number => (
            <li key={number} className="pagination-item">
              <button onClick={() => paginate(number)} className={`pagination-link ${number === currentPage ? 'active' : ''}`}>
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Home;
