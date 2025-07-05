const React = require('react');
const { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ScrollView } = require('react-native');
const {
    Shield,
    Candy: Cane,
    BookOpen,
    Globe,
    Briefcase,
    Home,
    AlertCircle,
    Layout,
    User,
    Settings,
  } = require('lucide-react-native');
const { navigate } = require('../services/navigationService');
const {saveToken} = require('../functions/secureStorage');

// Mock user data
const user = {
  name: "Sarah",
  safeZone: true,
};

const modules = [
  {
    id: 'hershield',
    name: 'HerShield',
    icon: Shield,
    tagline: 'Immediate Safety, Trusted Community',
    color: ['#7C3AED', '#5B21B6'],
    active: true,
    navigateTo: 'Home',
  },
  {
    id: 'seniorshield',
    name: 'SeniorShield',
    icon: Cane,
    tagline: 'Protection and Peace of Mind for Loved Ones',
    color: ['#3B82F6', '#1E40AF'],
    active: false,
  },
  {
    id: 'kidsafe',
    name: 'KidSafe',
    icon: BookOpen,
    tagline: 'Safety That Grows With Them',
    color: ['#FB923C', '#EA580C'],
    active: true,
    // navigateTo: 'KidSafeHome',
    navigateTo: 'KidSectionLanding',

  },
  // {
  //   id: 'travelmode',
  //   name: 'TravelMode',
  //   icon: Globe,
  //   tagline: 'Explore Safely, Share Confidently',
  //   color: ['#14B8A6', '#0F766E'],
  //   active: false,
  // },
  // {
  //   id: 'worksafe',
  //   name: 'WorkSafe',
  //   icon: Briefcase,
  //   tagline: 'Stay Safe, Even After Hours',
  //   color: ['#334155', '#0F172A'],
  //   active: false,
  // },
];

const ModuleCard = ({ module }) => {
  function handleModulePress() {
    saveToken("module",module.navigateTo);
    navigate(module.navigateTo);
  }
  const Icon = module.icon;
  return (
    <TouchableOpacity onPress={() => handleModulePress()}>
    <View style={[styles.moduleCard, { backgroundColor: module.color[0] }]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Icon color="white" size={24} />
        </View>
        <TouchableOpacity>
          <Settings color="white" size={20} />
        </TouchableOpacity>
      </View>
      <Text style={styles.moduleTitle}>{module.name}</Text>
      <Text style={styles.moduleTagline}>{module.tagline}</Text>
      <View style={styles.moduleFooter}>
        <Text style={[styles.moduleStatus, { backgroundColor: module.active ? '#22C55E' : 'rgba(255,255,255,0.2)' }]}>
          {module.active ? 'Active' : 'Inactive'}
        </Text>
        {/* <TouchableOpacity style={styles.enterButton}>
          <Text style={styles.enterText}>Enter</Text>
        </TouchableOpacity> */}
      </View>
    </View>
    </TouchableOpacity>
  );
};

const NavItem = ({ icon: Icon, label, active = false }) => (
  <TouchableOpacity  style={styles.navItem}>
    <Icon color={active ? '#7C3AED' : '#6B7280'} size={24} />
    <Text style={[styles.navText, { color: active ? '#7C3AED' : '#6B7280' }]}>{label}</Text>
  </TouchableOpacity>
);

function Modules() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Emergency Button */}
      {/* <TouchableOpacity style={styles.emergencyButton}>
        <AlertCircle color="white" size={20} />
        <Text style={styles.emergencyText}>Emergency</Text>
      </TouchableOpacity> */}

      {/* Header */}
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>Welcome back {user.fullName}</Text>
        <View style={styles.safeZoneStatus}>
          <View style={styles.greenDot} />
          <Text style={styles.statusText}>
            {user.safeZone ? "You're in a safe zone" : "Safety status unknown"}
          </Text>
        </View>

        {/* Modules */}
        <View style={styles.grid}>
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </View>
        <View style={styles.footerBrand}>
  <Text style={styles.footerText}>Powered by </Text>
  <Text style={styles.footerLogo}>ShieldHub</Text>
</View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navBar}>
        <NavItem icon={Home} label="Dashboard" active />
        <NavItem icon={AlertCircle} label="Emergency" />
        <NavItem icon={Layout} label="Modes" />
        <NavItem icon={User} label="Profiles" />
        <NavItem icon={Settings} label="Settings" />
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  emergencyButton: {
    position: 'absolute',
    top: 20,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  emergencyText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  safeZoneStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  statusText: {
    color: '#6B7280',
  },
  grid: {
    marginTop: 24,
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    // justifyContent: 'space-between',
    gap: 12,
  },
  moduleCard: {
    width: '90%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 10,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
  },
  moduleTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  moduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleStatus: {
    fontSize: 12,
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  enterButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  enterText: {
    color: 'white',
    fontSize: 13,
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 11,
    marginTop: 4,
  },
  footerBrand: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 80, // Ensures it's above the navbar
    flexDirection: 'row',
  },
  
  footerText: {
    fontSize: 13,
    color: '#9CA3AF', // Tailwind gray-400
  },
  
  footerLogo: {
    fontSize: 13,
    color: '#7C3AED', // HerShield primary
    fontWeight: '700',
    marginLeft: 4,
  },  
});

module.exports = Modules





















