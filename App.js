import React, { useState, useEffect } from 'react';
import { View, Modal, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import QRCode from 'react-native-qrcode-svg';
import { getVenues, getMedalStandings, getInjuryReport, getDNFandDQ } from './services/api';

const App = () => {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showInjuries, setShowInjuries] = useState(false);
  const [showMedals, setShowMedals] = useState(false);
  const [showDNF, setShowDNF] = useState(false);
  const [venues, setVenues] = useState([]);
  const [medals, setMedals] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [dnfData, setDnfData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [venuesRes, medalsRes, injuriesRes, dnfRes] = await Promise.all([
        getVenues(),
        getMedalStandings(),
        getInjuryReport(),
        getDNFandDQ(),
      ]);

      if (venuesRes.success) setVenues(venuesRes.data);
      if (medalsRes.success) setMedals(medalsRes.data);
      if (injuriesRes.success) setInjuries(injuriesRes.data);
      if (dnfRes.success) setDnfData(dnfRes.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Winter theme map style - white and light blue with roads hidden
  const mapStyle = [
    {
      elementType: 'geometry',
      stylers: [
        {
          color: '#f5f5f5',
        },
      ],
    },
    {
      elementType: 'labels.icon',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#616161',
        },
      ],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#f5f5f5',
        },
      ],
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#bdbdbd',
        },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [
        {
          color: '#eeeeee',
        },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#757575',
        },
      ],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [
        {
          color: '#e5e5e5',
        },
      ],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#9e9e9e',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
        {
          color: '#ffffff',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#e0e0e0',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#616161',
        },
      ],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [
        {
          color: '#f0f0f0',
        },
      ],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#d0d0d0',
        },
      ],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#616161',
        },
      ],
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry',
      stylers: [
        {
          color: '#e5e5e5',
        },
      ],
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [
        {
          color: '#eeeeee',
        },
      ],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [
        {
          color: '#c9e8ff',
        },
      ],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#9e9e9e',
        },
      ],
    },
  ];

  const handleMarkerPress = (venue) => {
    setSelectedVenue(venue);
  };

  const closeModal = () => {
    setSelectedVenue(null);
  };

  const closeInjuryModal = () => {
    setShowInjuries(false);
  };

  const closeMedalModal = () => {
    setShowMedals(false);
  };

  const closeDNFModal = () => {
    setShowDNF(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 45.4642,
          longitude: 9.1900,
          latitudeDelta: 3,
          longitudeDelta: 3,
        }}
        customMapStyle={mapStyle}
      >
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            coordinate={{
              latitude: venue.latitude,
              longitude: venue.longitude,
            }}
            title={venue.name}
            description={venue.sport}
            onPress={() => handleMarkerPress(venue)}
          />
        ))}
      </MapView>

      {selectedVenue && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={selectedVenue !== null}
        >
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.tradingCard}>
              <Text style={styles.eventName}>{selectedVenue.event}</Text>
              
              {selectedVenue.status === 'Finished' && selectedVenue.winner !== 'TBD' && (
                <View style={styles.winnerSection}>
                  <Text style={styles.medalIcon}>🥇</Text>
                  <Text style={styles.winnerText}>{selectedVenue.winner}</Text>
                </View>
              )}

              <View style={styles.scoreSection}>
                <Text style={styles.scoreLabel}>Score:</Text>
                <Text style={styles.scoreValue}>{selectedVenue.score}</Text>
              </View>

              <View style={styles.statusSection}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={styles.statusValue}>{selectedVenue.status}</Text>
              </View>

              <View style={styles.analystBox}>
                <Text style={styles.analystTitle}>The Analyst Says:</Text>
                <Text style={styles.analystText}>{selectedVenue.why}</Text>
              </View>

              <View style={styles.termPill}>
                <Text style={styles.termText}>{selectedVenue.term}</Text>
              </View>

              <View style={styles.qrCodeContainer}>
                <Text style={styles.qrCodeLabel}>Venue Details QR Code</Text>
                <View style={styles.qrCodeBox}>
                  <QRCode
                    value={`${selectedVenue.name}|${selectedVenue.sport}|${selectedVenue.status}`}
                    size={180}
                    color="#000000"
                    backgroundColor="#ffffff"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}

      {showInjuries && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showInjuries}
        >
          <View style={styles.injuryModalOverlay}>
            <ScrollView style={styles.injuryModalContent}>
              <Text style={styles.injuryTitle}>🚑 Injury Report</Text>
              {injuries.map((injury) => (
                <View key={injury.id} style={styles.injuryItem}>
                  <Text style={styles.injuryAthlete}>
                    {injury.flag} {injury.athlete} ({injury.country})
                  </Text>
                  <Text style={styles.injurySport}>{injury.sport}</Text>
                  <View style={styles.injuryDetails}>
                    <Text style={styles.injuryType}>{injury.injury}</Text>
                    <Text style={[
                      styles.injuryStatus,
                      injury.status === 'Questionable' || injury.status === 'Out'
                        ? styles.statusQuestionable
                        : styles.statusProbable,
                    ]}>
                      {injury.status}
                    </Text>
                  </View>
                  {injury.details && (
                    <Text style={styles.injuryDetailsText}>{injury.details}</Text>
                  )}
                  {injury.upcomingEvent && (
                    <Text style={styles.upcomingEvent}>
                      Next: {injury.upcomingEvent} ({injury.eventDate})
                    </Text>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.injuryCloseButton}
                onPress={closeInjuryModal}
              >
                <Text style={styles.injuryCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}

      {showMedals && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showMedals}
        >
          <View style={styles.injuryModalOverlay}>
            <ScrollView style={styles.injuryModalContent}>
              <Text style={styles.injuryTitle}>🏅 Medal Standings</Text>
              {medals.map((medal) => (
                <View key={medal.rank} style={styles.medalItem}>
                  <View style={styles.medalHeader}>
                    <Text style={styles.medalRank}>#{medal.rank}</Text>
                    <Text style={styles.medalCountry}>{medal.flag} {medal.country}</Text>
                  </View>
                  <View style={styles.medalCounts}>
                    <View style={styles.medalCount}>
                      <Text style={styles.medalLabel}>🥇</Text>
                      <Text style={styles.medalNumber}>{medal.gold}</Text>
                    </View>
                    <View style={styles.medalCount}>
                      <Text style={styles.medalLabel}>🥈</Text>
                      <Text style={styles.medalNumber}>{medal.silver}</Text>
                    </View>
                    <View style={styles.medalCount}>
                      <Text style={styles.medalLabel}>🥉</Text>
                      <Text style={styles.medalNumber}>{medal.bronze}</Text>
                    </View>
                    <View style={styles.medalCount}>
                      <Text style={styles.medalLabel}>Total</Text>
                      <Text style={styles.medalNumberTotal}>{medal.total}</Text>
                    </View>
                  </View>
                  {medal.whyWinning && (
                    <View style={styles.whyWinningBox}>
                      <Text style={styles.whyWinningTitle}>Why they're winning:</Text>
                      <Text style={styles.whyWinningText}>{medal.whyWinning}</Text>
                    </View>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.injuryCloseButton}
                onPress={closeMedalModal}
              >
                <Text style={styles.injuryCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}

      {showDNF && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDNF}
        >
          <View style={styles.injuryModalOverlay}>
            <ScrollView style={styles.injuryModalContent}>
              <Text style={styles.injuryTitle}>❌ DNF & DQ Report</Text>
              {dnfData.map((item) => (
                <View key={item.id} style={styles.dnfItem}>
                  <View style={styles.dnfHeader}>
                    <Text style={[
                      styles.dnfBadge,
                      item.type === 'DQ' ? styles.dnfBadgeDQ : styles.dnfBadgeDNF
                    ]}>
                      {item.type}
                    </Text>
                    <Text style={styles.dnfDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.dnfAthlete}>
                    {item.flag} {item.athlete} ({item.country})
                  </Text>
                  <Text style={styles.dnfEvent}>{item.event} - {item.sport}</Text>
                  <Text style={styles.dnfReason}>{item.reason}</Text>
                  {item.videoAvailable && (
                    <Text style={styles.videoAvailable}>📹 Video Available</Text>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.injuryCloseButton}
                onPress={closeDNFModal}
              >
                <Text style={styles.injuryCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowInjuries(true)}
      >
        <Text style={styles.fabIcon}>🚑</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fab, { bottom: 90 }]}
        onPress={() => setShowMedals(true)}
      >
        <Text style={styles.fabIcon}>🏅</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fab, { bottom: 160 }]}
        onPress={() => setShowDNF(true)}
      >
        <Text style={styles.fabIcon}>❌</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={fetchAllData}
      >
        <Text style={styles.refreshIcon}>🔄</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tradingCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  eventName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 18,
    textAlign: 'center',
  },
  winnerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#ffd700',
  },
  medalIcon: {
    fontSize: 36,
    marginRight: 10,
  },
  winnerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffd700',
  },
  scoreSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  statusSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e74c3c',
  },
  analystBox: {
    backgroundColor: '#e8e8e8',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  analystTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  analystText: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
  },
  termPill: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  termText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  qrCodeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  qrCodeBox: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '300',
  },
  refreshButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
  refreshIcon: {
    color: '#ffffff',
    fontSize: 24,
  },
  injuryModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  injuryModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 25,
    width: '85%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  injuryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  injuryItem: {
    marginBottom: 18,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  injuryAthlete: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  injurySport: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
  },
  injuryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  injuryType: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
  },
  injuryStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusQuestionable: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  statusProbable: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  injuryDetailsText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  upcomingEvent: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 6,
    fontWeight: '500',
  },
  injuryCloseButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  injuryCloseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Medal Modal Styles
  medalItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  medalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medalRank: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginRight: 10,
  },
  medalCountry: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  medalCounts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  medalCount: {
    alignItems: 'center',
  },
  medalLabel: {
    fontSize: 18,
    marginBottom: 4,
  },
  medalNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  medalNumberTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e74c3c',
  },
  whyWinningBox: {
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  whyWinningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
  },
  whyWinningText: {
    fontSize: 12,
    color: '#444444',
    lineHeight: 18,
  },
  // DNF/DQ Modal Styles
  dnfItem: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  dnfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dnfBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '700',
  },
  dnfBadgeDNF: {
    backgroundColor: '#ffa500',
    color: '#ffffff',
  },
  dnfBadgeDQ: {
    backgroundColor: '#e74c3c',
    color: '#ffffff',
  },
  dnfDate: {
    fontSize: 11,
    color: '#666666',
  },
  dnfAthlete: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  dnfEvent: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
  },
  dnfReason: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 18,
    marginBottom: 6,
  },
  videoAvailable: {
    fontSize: 11,
    color: '#3498db',
    fontWeight: '500',
  },
});

export default App;
