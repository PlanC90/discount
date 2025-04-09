import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface Brand {
  brand: string;
}

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('brand')
          .not('brand', 'is', null)
          .order('brand', { ascending: true });

        if (error) {
          throw error;
        }

        // Extract unique brand names from the data
        const uniqueBrands = [...new Set(data.map((item: any) => item.brand))];
        setBrands(uniqueBrands);
      } catch (error: any) {
        toast.error(`Failed to fetch brands: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return (
    <div className="brands-container">
      <h2 className="brands-title">All Brands</h2>
      {loading ? (
        <p>Loading brands...</p>
      ) : (
        <ul className="brands-list">
          {brands.map((brand, index) => (
            <li key={index} className="brand-item">{brand}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Brands;
