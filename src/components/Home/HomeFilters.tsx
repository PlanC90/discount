import React from 'react';

interface HomeFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  categories: string[];
  countries: string[];
  brands: string[];
}

const HomeFilters: React.FC<HomeFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedCountry,
  setSelectedCountry,
  selectedBrand,
  setSelectedBrand,
  categories,
  countries,
  brands,
}) =>{
  return (
    <>
      <input
        type="text"
        placeholder="Search coupons..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input mb-4 w-full sm:w-auto"
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
    </>
  );
};

export default HomeFilters;
