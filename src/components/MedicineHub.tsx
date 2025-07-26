import React, { useState } from 'react';
import { Search, Pill, ShoppingCart, ExternalLink, Filter, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useLanguage } from '../context/LanguageContext';

interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  rating: number;
  inStock: boolean;
  store: string;
  storeUrl: string;
  prescription: boolean;
}

const MedicineHub: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t } = useLanguage();

  const medicines: Medicine[] = [
    {
      id: '1',
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      price: 25,
      description: 'Effective pain relief and fever reducer',
      rating: 4.5,
      inStock: true,
      store: 'PharmEasy',
      storeUrl: 'https://pharmeasy.in',
      prescription: false
    },
    {
      id: '2',
      name: 'Crocin Advance',
      category: 'Pain Relief',
      price: 35,
      description: 'Fast relief from headache and body pain',
      rating: 4.3,
      inStock: true,
      store: 'Netmeds',
      storeUrl: 'https://netmeds.com',
      prescription: false
    },
    {
      id: '3',
      name: 'Dolo 650',
      category: 'Fever',
      price: 30,
      description: 'Effective fever reducer and pain reliever',
      rating: 4.4,
      inStock: true,
      store: '1mg',
      storeUrl: 'https://1mg.com',
      prescription: false
    },
    {
      id: '4',
      name: 'Cetirizine 10mg',
      category: 'Allergy',
      price: 20,
      description: 'Antihistamine for allergy relief',
      rating: 4.2,
      inStock: true,
      store: 'Apollo Pharmacy',
      storeUrl: 'https://apollopharmacy.in',
      prescription: false
    },
    {
      id: '5',
      name: 'Azithromycin 500mg',
      category: 'Antibiotic',
      price: 120,
      description: 'Broad-spectrum antibiotic',
      rating: 4.1,
      inStock: true,
      store: 'PharmEasy',
      storeUrl: 'https://pharmeasy.in',
      prescription: true
    },
    {
      id: '6',
      name: 'Omeprazole 20mg',
      category: 'Digestive',
      price: 45,
      description: 'Acid reducer for stomach problems',
      rating: 4.3,
      inStock: true,
      store: 'Netmeds',
      storeUrl: 'https://netmeds.com',
      prescription: false
    }
  ];

  const categories = ['all', 'Pain Relief', 'Fever', 'Allergy', 'Antibiotic', 'Digestive'];

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBuyNow = (medicine: Medicine) => {
    window.open(medicine.storeUrl, '_blank');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Medicine Hub</h1>
        <p className="text-lg text-muted-foreground">
          Find and purchase medicines from trusted online pharmacies
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <Card className="mb-8 border-warning bg-warning/5">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Pill className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning">Important Notice</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Prescription medicines require valid doctor's prescription. Always consult with healthcare professionals before taking any medication.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medicine Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMedicines.map((medicine) => (
          <Card key={medicine.id} className="medical-card hover:shadow-medical transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{medicine.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{medicine.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">₹{medicine.price}</p>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{medicine.rating}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{medicine.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {medicine.prescription && (
                  <Badge variant="destructive" className="text-xs">
                    Prescription Required
                  </Badge>
                )}
                <Badge variant={medicine.inStock ? 'default' : 'secondary'} className="text-xs">
                  {medicine.inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="text-muted-foreground">Available at</p>
                  <p className="font-medium">{medicine.store}</p>
                </div>
                <Button
                  onClick={() => handleBuyNow(medicine)}
                  className="gap-2"
                  disabled={!medicine.inStock}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Buy Now
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMedicines.length === 0 && (
        <div className="text-center py-12">
          <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No medicines found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}

      {/* Trusted Partners */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="text-center">Trusted Pharmacy Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {['PharmEasy', 'Netmeds', '1mg', 'Apollo Pharmacy'].map((partner) => (
              <div key={partner} className="p-4 rounded-lg border bg-muted/20">
                <p className="font-medium">{partner}</p>
                <p className="text-xs text-muted-foreground mt-1">Verified Partner</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineHub;