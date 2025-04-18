import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Auth } from '../components/Auth';
import { Account } from '../components/Account';
import HomeFilters from './Home/HomeFilters';
import CouponGrid from './Home/CouponGrid';
import { useSearchParams } from 'react-router-dom';

function Home() {
  const [session, setSession] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [couponsPerPage, setCouponsPerPage] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchCategories();
    fetchCountries();
    fetchBrands();
  }, [searchTerm, selectedCategory, selectedCountry, selectedBrand, currentPage, couponsPerPage]);

  const fetchCoupons = async () => {
    setLoading(true);
    let query = supabase
      .from('coupons')
      .select('*', { count: 'exact' })
      .eq('approved', true);

    if (searchTerm) {
      query = query.ilike('title', `%${searchTerm}%`);
    }

    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }

    if (selectedCountry && selectedCountry !== 'all') {
      query = query.eq('country', selectedCountry);
    }

    if (selectedBrand) {
      query = query.eq('brand', selectedBrand);
    }

    const from = (currentPage - 1) * couponsPerPage;
    const to = from + couponsPerPage - 1;

    const { data, count, error } = await query.range(from, to);

    if (error) {
      console.error('Error fetching coupons:', error);
    } else {
      setCoupons(data || []);
      setTotalCount(count || 0);
    }

    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('coupon_categories')
      .select('name');
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data.map(cat => cat.name));
    }
  };

  const fetchCountries = async () => {
    const { data, error } = await supabase
      .from('coupon_countries')
      .select('code');
    if (error) {
      console.error('Error fetching countries:', error);
    } else {
      setCountries(data.map(country => country.code));
    }
  };

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from('coupon_brands')
      .select('name');
    if (error) {
      console.error('Error fetching brands:', error);
    } else {
      setBrands(data.map(brand => brand.name));
    }
  };

  const handleCouponsPerPageChange = (newCouponsPerPage: number) => {
    setCurrentPage(1); // Reset to first page
    setCouponsPerPage(newCouponsPerPage);
  };

  const pageNumbers = Array.from({ length: Math.ceil(totalCount / couponsPerPage) }, (_, i) => i + 1);

  return (
    <div className="container px-4 py-6 mx-auto">
      {!session ? <Auth /> : <Account session={session} />}

      <HomeFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        categories={categories}
        countries={countries}
        brands={brands}
      />

      <div className="flex items-center mb-4">
        <label htmlFor="couponsPerPage" className="mr-2">Coupons per page:</label>
        <select
          id="couponsPerPage"
          value={couponsPerPage}
          onChange={(e) => handleCouponsPerPageChange(Number(e.target.value))}
          className="form-select border rounded px-2 py-1"
        >
          <option value="6">6</option>
          <option value="12">12</option>
          <option value="24">24</option>
          <option value="48">48</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading coupons...</div>
      ) : (
        <CouponGrid
          loading={loading}
          currentCoupons={coupons}
          getCouponColumns={() => ''}
        />
      )}

      <div className="flex justify-center mt-6 flex-wrap gap-2">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`px-4 py-2 rounded border transition duration-200 ${currentPage === number ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
