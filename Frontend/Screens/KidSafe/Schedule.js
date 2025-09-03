import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import apiCall from '../../functions/axios';

const Schedule = () => {
  const [kids, setKids] = useState([]);
  const [selectedKid, setSelectedKid] = useState('');
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const navigation = useNavigation();


  useEffect(() => {
    (async () => {
      const res = await apiCall({ method: 'GET', url: '/parent/kids' });
      if (res.success) setKids(res.kids);
    })();
  }, []);

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }); // e.g., "Thursday, 3 July 2025"
    setCurrentDate(formatted);
  }, []);

  const validateTime = (timeStr) => /^([0-1]?\d|2[0-3]):([0-5]\d)$/.test(timeStr); // allows "8:45" or "08:45"

 const handleCreateSchedule = async () => {
  console.log("Selected Kid ID:", selectedKid);
  console.log("Kids Array:", kids);

  // FIX: match using loose equality OR cast to string
  const selectedKidObj = kids.find((kid) => kid._id == selectedKid);
  console.log("Matched Kid Object:", selectedKidObj);

  if (!selectedKidObj) {
    return Alert.alert('Kid not found', 'Selected kid not found in the list');
  }

  if (!subject || !startTime || !endTime) {
    return Alert.alert('Missing fields', 'Please fill all fields');
  }

  if (!validateTime(startTime) || !validateTime(endTime)) {
    return Alert.alert('Invalid time', 'Time must be in HH:MM format (e.g. 8:45 or 14:00)');
  }

  const payload = {
    kidName: selectedKidObj.fullName,
    subject,
    startTime,
    endTime,
  };

  const res = await apiCall({ method: 'POST', url: '/parent/schedule/create', data: payload });

  if (res.success) {
    Alert.alert('✅ Schedule Created');
    setSubject('');
    setStartTime('');
    setEndTime('');
  } else {
    Alert.alert('❌ Error', res.error || 'Something went wrong');
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
    

     <View style={styles.topRow}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
    <Text style={styles.backText}>⬅ Back</Text>
  </TouchableOpacity>
  <Text style={styles.dateHeader}>📅 {currentDate}</Text>
</View>



      <Text style={styles.heading}>📘 Create Kid's Schedule</Text>

      <View style={styles.section}>
        <Text style={styles.label}>👦 Select Kid</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kidScroll}>
          {kids.length > 0 ? (
            kids.map((kid) => (
              <TouchableOpacity
                key={kid._id}
                style={[
                  styles.kidBadge,
                  selectedKid === kid._id && styles.kidBadgeSelected,
                ]}
                onPress={() => setSelectedKid(kid._id.toString())}  // <-- make sure it's a string

              >
                <Text
                  style={[
                    styles.kidName,
                    selectedKid === kid._id && { color: '#fff' },
                  ]}
                >
                  {kid.fullName}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: '#888' }}>No kids linked yet</Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>📚 Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Math, Science"
          value={subject}
          onChangeText={setSubject}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>🕒 Start Time (HH:MM)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 8:30"
          value={startTime}
          onChangeText={setStartTime}
        />
        <Text style={styles.helperText}>Format: HH:MM (e.g. 08:45 or 8:45)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>🕓 End Time (HH:MM)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 9:30"
          value={endTime}
          onChangeText={setEndTime}
        />
        <Text style={styles.helperText}>Format: HH:MM (e.g. 09:45 or 9:45)</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreateSchedule}>
        <Text style={styles.buttonText}>📤 Save Schedule</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFF7ED',
    flexGrow: 1,
  },
  topRow: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#334155',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#1E293B',
  },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
 topRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
},

backButton: {
  padding: 5,
},

backText: {
  fontSize: 16,
  color: '#2563EB',
  fontWeight: '600',
},


  kidScroll: {
    flexDirection: 'row',
    marginTop: 10,
  },
  kidBadge: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    marginRight: 10,
  },
  kidBadgeSelected: {
    backgroundColor: '#2563EB',
  },
  kidName: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Schedule;
