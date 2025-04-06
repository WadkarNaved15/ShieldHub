const React = require('react');
const { useState} = React;
const { View, Text, TextInput, TouchableOpacity, Image, FlatList, ScrollView, StyleSheet } = require('react-native');
const { Search, ShoppingCart, Heart, Info, AlertTriangle, Users, Shield, Zap } =require('lucide-react-native');
const Footer = require('../../Components/Footer');

const categories = [
  { id: 1, name: 'Safety Gadgets', icon: <AlertTriangle size={20} color="black" /> },
  { id: 2, name: 'Self-Defense Training', icon: <Zap size={20} color="black" /> },
  { id: 3, name: 'Emergency Assistance', icon: <Shield size={20} color="black" /> },
  { id: 4, name: 'Community Offerings', icon: <Users size={20} color="black" /> },
];

const products = [
  {
    id: 1,
    name: 'Smart Personal Alarm',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1611175694989-4870fafa4494?w=500&q=80',
    category: 'Safety Gadgets',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Self-Defense Basics Course',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80',
    category: 'Self-Defense Training',
    rating: 4.9,
  },
  {
    id: 3,
    name: 'GPS Safety Tracker',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1589401806207-2381455bce76?w=500&q=80',
    category: 'Safety Gadgets',
    rating: 4.7,
  },
  {
    id: 4,
    name: 'Emergency Response Service',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&q=80',
    category: 'Emergency Assistance',
    rating: 4.9,
  },
];

const Marketplace = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(
    (product) =>
      (activeCategory === 'All' || product.category === activeCategory) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.productPrice}>${item.price}</Text>
        <View style={styles.rating}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyText}>Buy Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoButton}>
          <Info size={20} color="#7157e4" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>HerShield Marketplace</Text>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search products..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity>
            <ShoppingCart size={26} color="#7157e4" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setActiveCategory(category.name)}
            style={[
              styles.categoryButton,
              activeCategory === category.name && styles.categoryButtonActive,
            ]}
          >
            {category.icon}
            <Text style={[styles.categoryText, activeCategory === category.name && styles.categoryTextActive]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2} // Two columns
        contentContainerStyle={styles.productGrid}
      />
      <Footer page="Marketplace"/>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: { backgroundColor: 'white', padding: 15 ,textAlign:'center'},
  headerText: { fontSize: 22, fontWeight: 'bold', color: '#7157e4' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  searchInput: {
    backgroundColor: '#E8E8E8',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flex: 1,
    marginRight: 10,
    color: 'black',
  },

  // Categories
  categoryContainer: { paddingVertical: 10 ,height: 80},
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
  },
  categoryButtonActive: { backgroundColor: '#7157e4' },
  categoryText: { marginLeft: 5, color: 'black' },
  categoryTextActive: { color: 'white' },

  // Products Grid
  productGrid: { padding: 10,paddingBottom:100 },
  productCard: {
    backgroundColor: 'white',
    width: '48%', // Two columns
    margin: '1%', // Spacing
    borderRadius: 10,
    padding: 10,
  },
  productImage: { width: '100%', height: 150, borderRadius: 10 },
  productName: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  productPrice: { color: '#7157e4', fontSize: 18, fontWeight: 'bold' },
  rating: { flexDirection: 'row', alignItems: 'center' },
  star: { color: '#f1c40f', fontSize: 18 },
  ratingText: { marginLeft: 5 },

  // Buttons
  buttonRow: { flexDirection: 'row', marginTop: 10 },
  buyButton: {
    flex: 1,
    backgroundColor: '#7157e4',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buyText: { color: 'white', fontWeight: 'bold' },
  infoButton: { marginLeft: 10, borderWidth: 1, borderColor: '#7157e4', padding: 10, borderRadius: 5 },
});
module.exports = Marketplace;
