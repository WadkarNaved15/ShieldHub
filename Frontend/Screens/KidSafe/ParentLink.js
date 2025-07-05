import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { UserContext } from '../../Context/User';
import apiCall from '../../functions/axios';
// import { Navigation } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const ParentLink = () => {
  const { user } = useContext(UserContext); // parent is logged in
  
  const navigation = useNavigation();
  const [kidCode, setKidCode] = useState('');
  const [linkedKids, setLinkedKids] = useState([]);

  // Restrict access for kids
  if (user?.role === 'kid') {
    return (
      <View style={styles.blockedView}>
        <Text style={styles.blockedText}>
          🚫 Access Denied: You are registered as a kid and not allowed to access this screen.
        </Text>
      </View>
    );
  }

  useEffect(() => {
    fetchLinkedKids();
  }, []);

  const fetchLinkedKids = async () => {
  const res = await apiCall({ url: '/parent/kids', method: 'GET' });
  console.log("📦 /parent/kids Response:", res);

  if (res.success) {
    setLinkedKids(res.kids);
  } else {
    console.warn("❌ Failed to fetch kids", res?.message);
  }
};


  const handleLink = async () => {
    if (!kidCode.trim()) return;
    const res = await apiCall({ url: '/parent/link-kid', method: 'POST', data: { kidCode } });
    console.log('🔁 Link Response:', res);

    if (res?.success) {
      setKidCode('');
      fetchLinkedKids(); // Refresh kid list
      alert('Kid linked successfully!');
    } else {
      alert(res?.message || 'Failed to link kid.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👋 Welcome, {user.fullName}</Text>

      <Text style={styles.subheading}>Your Connected Kids</Text>
      <Text style={{ marginBottom: 10 }}>Total: {linkedKids.length}</Text>

      {linkedKids.length > 0 ? (
        <View style={styles.kidList}>
          {linkedKids.map((kid, index) => (
           <TouchableOpacity
  key={kid._id || index}
  style={styles.kidCard}
  onPress={() => navigation.navigate('ParentHome', { kid })}
>
  <Text style={styles.kidName}>{kid.fullName || 'Unnamed'}</Text>
  <Text style={styles.kidInfo}>Gender: {kid.gender}</Text>
  <Text style={styles.kidInfo}>Age: {kid.age}</Text>
</TouchableOpacity>

          ))}
        </View>
      ) : (
        <Text style={styles.noKids}>No kids linked yet.</Text>
      )}

      <View style={styles.addKidBox}>
        <Text style={styles.subheading}>➕ Add New Child</Text>
        
        <Text style={styles.infoText}>Enter the 6-digit code from your child's device:</Text>
        <TextInput
          placeholder="Enter Code (e.g. 7X23LK)"
          value={kidCode}
          onChangeText={setKidCode}
          style={styles.input}
        />
        <TouchableOpacity style={styles.linkButton} onPress={handleLink}>
          <Text style={styles.linkButtonText}>Link Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  blockedView: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
  backgroundColor: '#FFF1F2',
},
blockedText: {
  fontSize: 18,
  color: '#DC2626',
  textAlign: 'center',
  fontWeight: 'bold',
},

  container: {
    padding: 20,
    backgroundColor: '#FFF7ED',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 20,
  },
  subheading: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 10,
  },
  kidList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kidCard: {
    backgroundColor: '#EDE9FE',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    width: '48%',
  },
  kidName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  kidInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  noKids: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  addKidBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F3F4F6',
    borderRadius: 15,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    fontSize: 16,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkButton: {
    marginTop: 15,
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default ParentLink;
