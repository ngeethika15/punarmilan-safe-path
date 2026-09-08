import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useDisaster } from '../context/DisasterContext';

type Tab = 'OVERVIEW' | 'SOS' | 'CHATBOT' | 'MESH';

export default function DisasterNetworkScreen() {
  const { sosRequests, addSOSRequest } = useDisaster();

  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');

  const [chatInput, setChatInput] = useState('');

  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'bot'; text: string }>
  >([
    {
      sender: 'bot',
      text:
        'Hello. I am the offline Disaster Mental Health & Safety Assistant. How are you feeling?',
    },
  ]);

  /* -------------------------------------------------------
     CHATBOT
  ------------------------------------------------------- */

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();

    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: userMsg,
      },
    ]);

    setChatInput('');

    setTimeout(() => {
      let botResponse =
        'Thank you for sharing. Please remain near registered relief volunteers.';

      const lower = userMsg.toLowerCase();

      if (
        lower.includes('panic') ||
        lower.includes('scared') ||
        lower.includes('trauma') ||
        lower.includes('afraid')
      ) {
        botResponse =
          '⚠️ High distress detected. Please stay with another person if possible. A relief counselor can be requested through the response network.';
      } else if (
        lower.includes('food') ||
        lower.includes('water') ||
        lower.includes('rescue') ||
        lower.includes('medicine') ||
        lower.includes('medical')
      ) {
        addSOSRequest({
          id: `SOS-${901 + sosRequests.length}`,
          location: 'User Current GPS Bounds',
          needs: ['Food/Water Supply', 'General Assistance'],
          urgency: 'HIGH',
          timestamp: 'Just now via Mental Health Assistant',
        });

        botResponse =
          '🆘 An urgent assistance request has been created and added to the shared response queue.';
      } else if (
        lower.includes('safe') ||
        lower.includes('okay') ||
        lower.includes('fine')
      ) {
        botResponse =
          '🟢 Thank you for confirming. Stay connected with your family or relief volunteers and keep emergency communication available.';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse,
        },
      ]);
    }, 600);
  };

  /* -------------------------------------------------------
     HELPERS
  ------------------------------------------------------- */

  const criticalCount = sosRequests.filter(
    (item) => item.urgency === 'CRITICAL'
  ).length;

  const highCount = sosRequests.filter(
    (item) => item.urgency === 'HIGH'
  ).length;

  const safetyScore = 72;

  /* -------------------------------------------------------
     TAB BUTTON
  ------------------------------------------------------- */

  const renderTab = (
    tab: Tab,
    icon: string,
    title: string,
    count?: number
  ) => {
    const selected = activeTab === tab;

    return (
      <TouchableOpacity
        style={[styles.tab, selected && styles.activeTab]}
        onPress={() => setActiveTab(tab)}
      >
        <Text
          style={[
            styles.tabText,
            selected && styles.activeTabText,
          ]}
        >
          {icon} {title}
          {count !== undefined ? ` (${count})` : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  /* -------------------------------------------------------
     OVERVIEW
  ------------------------------------------------------- */

  const renderOverview = () => {
    return (
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SYSTEM STATUS */}

        <View style={styles.systemBar}>
          <View>
            <Text style={styles.systemTitle}>
              🛰️ Disaster Intelligence Center
            </Text>

            <Text style={styles.systemSubtitle}>
              Emergency monitoring & community response
            </Text>
          </View>

          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>ONLINE</Text>
          </View>
        </View>

        {/* MAIN ALERT */}

        <View style={styles.criticalAlert}>
          <View style={styles.alertTopRow}>
            <View style={styles.alertLabelContainer}>
              <Text style={styles.alertIcon}>🚨</Text>

              <View>
                <Text style={styles.alertTitle}>
                  ACTIVE EMERGENCY
                </Text>

                <Text style={styles.alertSubtitle}>
                  Flood Risk Warning
                </Text>
              </View>
            </View>

            <View style={styles.criticalBadge}>
              <Text style={styles.criticalBadgeText}>
                HIGH
              </Text>
            </View>
          </View>

          <Text style={styles.alertLocation}>
            📍 Sector 4 Flood Plain
          </Text>

          <Text style={styles.alertDescription}>
            Heavy rainfall and rising water levels reported.
            Avoid low-lying roads and move toward designated
            relief locations.
          </Text>

          <Text style={styles.demoSource}>
            Government / SACHET integration-ready • Demo alert
          </Text>

          <View style={styles.alertActions}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() =>
                Alert.alert(
                  'Safe Path',
                  'Opening safe route guidance for the affected area.'
                )
              }
            >
              <Text style={styles.primaryActionText}>
                🧭 Safe Path
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() =>
                Alert.alert(
                  'Nearby Help',
                  'Searching for relief camps and emergency facilities.'
                )
              }
            >
              <Text style={styles.secondaryActionText}>
                🏕️ Nearby Help
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SAFETY SCORE */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            🛡️ Current Disaster Risk
          </Text>

          <Text style={styles.sectionSubtitle}>
            Based on available local signals
          </Text>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreNumber}>
              {safetyScore}
            </Text>

            <Text style={styles.scoreOutOf}>
              / 100
            </Text>

            <Text style={styles.scoreLabel}>
              SAFETY SCORE
            </Text>
          </View>

          <View style={styles.scoreRight}>
            <Text style={styles.scoreStatus}>
              🟡 MODERATE RISK
            </Text>

            <Text style={styles.scoreDescription}>
              Stay alert and monitor emergency updates.
            </Text>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${safetyScore}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* RISK GRID */}

        <View style={styles.riskGrid}>
          <RiskCard
            icon="🌧️"
            title="Rain"
            value="HIGH"
            description="Heavy rainfall"
            level="high"
          />

          <RiskCard
            icon="🌊"
            title="Flood"
            value="HIGH"
            description="Water level rising"
            level="high"
          />

          <RiskCard
            icon="💨"
            title="Wind"
            value="LOW"
            description="Normal conditions"
            level="low"
          />

          <RiskCard
            icon="🌡️"
            title="Heat"
            value="LOW"
            description="Normal temperature"
            level="low"
          />
        </View>

        {/* RESPONSE SUMMARY */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            🆘 Response Operations
          </Text>

          <Text style={styles.sectionSubtitle}>
            Requests requiring attention
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            value={String(sosRequests.length)}
            label="Active SOS"
            icon="🆘"
          />

          <StatCard
            value={String(criticalCount)}
            label="Critical"
            icon="🔴"
          />

          <StatCard
            value={String(highCount)}
            label="High Priority"
            icon="🟠"
          />
        </View>

        {/* SOS PREVIEW */}

        {sosRequests.length > 0 ? (
          <View style={styles.whiteCard}>
            <View style={styles.cardHeadingRow}>
              <View>
                <Text style={styles.darkCardTitle}>
                  🚨 Latest Emergency Requests
                </Text>

                <Text style={styles.darkCardSubtitle}>
                  Shared across the response network
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setActiveTab('SOS')}
              >
                <Text style={styles.viewAll}>
                  View all →
                </Text>
              </TouchableOpacity>
            </View>

            {sosRequests.slice(0, 3).map((sos) => (
              <SOSPreview
                key={sos.id}
                id={sos.id}
                location={sos.location}
                urgency={sos.urgency}
                needs={sos.needs.join(', ')}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🟢</Text>

            <Text style={styles.emptyTitle}>
              No active SOS requests
            </Text>

            <Text style={styles.emptyText}>
              The emergency response queue is currently clear.
            </Text>
          </View>
        )}

        {/* NETWORK + HELP */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            📡 Network & Emergency Resources
          </Text>
        </View>

        <View style={styles.twoColumn}>
          <TouchableOpacity
            style={styles.infoCard}
            onPress={() => setActiveTab('MESH')}
          >
            <Text style={styles.infoIcon}>📡</Text>

            <Text style={styles.infoTitle}>
              Mesh Network
            </Text>

            <Text style={styles.infoValue}>
              🟢 12 Nodes
            </Text>

            <Text style={styles.infoDescription}>
              P2P relay network active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoCard}
            onPress={() =>
              Alert.alert(
                'Nearby Emergency Help',
                'Relief Camp • 1.2 km\nHospital • 2.4 km\nWater Point • 0.8 km'
              )
            }
          >
            <Text style={styles.infoIcon}>🏥</Text>

            <Text style={styles.infoTitle}>
              Nearby Help
            </Text>

            <Text style={styles.infoValue}>
              3 Locations
            </Text>

            <Text style={styles.infoDescription}>
              Camps, hospitals & water
            </Text>
          </TouchableOpacity>
        </View>

        {/* QUICK ACTIONS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            ⚡ Quick Actions
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => setActiveTab('SOS')}
          >
            <Text style={styles.quickIcon}>🆘</Text>
            <Text style={styles.quickText}>SOS Queue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => setActiveTab('CHATBOT')}
          >
            <Text style={styles.quickIcon}>🧠</Text>
            <Text style={styles.quickText}>Mental Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => setActiveTab('MESH')}
          >
            <Text style={styles.quickIcon}>📡</Text>
            <Text style={styles.quickText}>Mesh Network</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() =>
              Alert.alert(
                'Emergency Contacts',
                'Emergency services and registered response volunteers are available through the emergency system.'
              )
            }
          >
            <Text style={styles.quickIcon}>📞</Text>
            <Text style={styles.quickText}>Emergency</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            ⚠️ Demo environment: Government alerts and mesh
            statistics shown here are integration-ready examples.
          </Text>
        </View>
      </ScrollView>
    );
  };

  /* -------------------------------------------------------
     SOS
  ------------------------------------------------------- */

  const renderSOS = () => {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeading}>
          <Text style={styles.pageTitle}>
            🆘 Emergency Response Queue
          </Text>

          <Text style={styles.pageSubtitle}>
            Active SOS needs shared across the disaster network
          </Text>
        </View>

        <View style={styles.responseBanner}>
          <Text style={styles.responseBannerIcon}>📊</Text>

          <View style={{ flex: 1 }}>
            <Text style={styles.responseBannerTitle}>
              {sosRequests.length} Active Requests
            </Text>

            <Text style={styles.responseBannerText}>
              Critical and high-priority cases require immediate
              attention.
            </Text>
          </View>
        </View>

        {sosRequests.length === 0 ? (
          <View style={styles.emptyLarge}>
            <Text style={styles.emptyIcon}>🟢</Text>

            <Text style={styles.emptyTitle}>
              Response queue is clear
            </Text>

            <Text style={styles.emptyText}>
              No active emergency requests are currently available.
            </Text>
          </View>
        ) : (
          sosRequests.map((sos) => (
            <View key={sos.id} style={styles.fullSOSCard}>
              <View style={styles.sosHeader}>
                <View>
                  <Text style={styles.sosId}>
                    {sos.id}
                  </Text>

                  <Text style={styles.sosTime}>
                    🕒 {sos.timestamp}
                  </Text>
                </View>

                <View
                  style={[
                    styles.urgencyBadge,
                    sos.urgency === 'CRITICAL'
                      ? styles.criticalBackground
                      : styles.highBackground,
                  ]}
                >
                  <Text
                    style={[
                      styles.urgencyText,
                      sos.urgency === 'CRITICAL'
                        ? styles.criticalText
                        : styles.highText,
                    ]}
                  >
                    {sos.urgency}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.sosInfo}>
                📍 <Text style={styles.bold}>Location:</Text>{' '}
                {sos.location}
              </Text>

              <Text style={styles.sosInfo}>
                📦 <Text style={styles.bold}>Needs:</Text>{' '}
                {sos.needs.join(', ')}
              </Text>

              <View style={styles.sosActions}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() =>
                    Alert.alert(
                      'Response Assigned',
                      `${sos.id} has been assigned for response coordination.`
                    )
                  }
                >
                  <Text style={styles.acceptButtonText}>
                    ✓ Respond
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={() =>
                    Alert.alert(
                      'Location',
                      `Target location:\n${sos.location}`
                    )
                  }
                >
                  <Text style={styles.locationButtonText}>
                    📍 View Location
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  /* -------------------------------------------------------
     MENTAL HEALTH
  ------------------------------------------------------- */

  const renderChatbot = () => {
    return (
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <View style={styles.chatIconCircle}>
            <Text style={styles.chatIconText}>🧠</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.chatTitle}>
              Disaster Mental Health Support
            </Text>

            <Text style={styles.chatSubtitle}>
              Offline-first safety & emotional support
            </Text>
          </View>

          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>
              OFFLINE
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.supportNotice}>
            <Text style={styles.supportNoticeTitle}>
              💙 You are not alone
            </Text>

            <Text style={styles.supportNoticeText}>
              This assistant provides basic emotional support
              and can help create an assistance request. It does
              not replace professional medical care.
            </Text>
          </View>

          {chatMessages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.chatBubble,
                msg.sender === 'user'
                  ? styles.userBubble
                  : styles.botBubble,
              ]}
            >
              <Text
                style={
                  msg.sender === 'user'
                    ? styles.userText
                    : styles.botText
                }
              >
                {msg.text}
              </Text>
            </View>
          ))}

          <View style={styles.quickFeelingRow}>
            {['🙂 Okay', '😟 Anxious', '😨 Scared', '🚨 Help'].map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.feelingButton}
                  onPress={() => {
                    setChatInput(item);
                  }}
                >
                  <Text style={styles.feelingText}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type how you are feeling or request help..."
            placeholderTextColor="#94A3B8"
            value={chatInput}
            onChangeText={setChatInput}
            multiline
          />

          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSendMessage}
          >
            <Text style={styles.sendBtnText}>
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* -------------------------------------------------------
     MESH
  ------------------------------------------------------- */

  const renderMesh = () => {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeading}>
          <Text style={styles.pageTitle}>
            📡 Peer-to-Peer Mesh Network
          </Text>

          <Text style={styles.pageSubtitle}>
            Relay emergency information when cellular connectivity
            is unavailable
          </Text>
        </View>

        <View style={styles.meshStatusCard}>
          <View style={styles.meshStatusTop}>
            <View>
              <Text style={styles.meshStatusTitle}>
                🟢 NETWORK OPERATIONAL
              </Text>

              <Text style={styles.meshStatusSubtitle}>
                Emergency relay network active
              </Text>
            </View>

            <Text style={styles.meshSignal}>
              📶
            </Text>
          </View>

          <View style={styles.meshStats}>
            <MeshStat value="12" label="Active Nodes" />
            <MeshStat value="8" label="Relay Nodes" />
            <MeshStat value="2" label="Weak Links" />
            <MeshStat value="37" label="Messages Relayed" />
          </View>
        </View>

        {/* NETWORK VISUAL */}

        <View style={styles.networkCard}>
          <Text style={styles.networkTitle}>
            Network Topology
          </Text>

          <Text style={styles.networkSubtitle}>
            Approximate local peer connections
          </Text>

          <View style={styles.networkVisual}>
            <View style={styles.nodeLineTop} />

            <View style={styles.networkNodeMain}>
              <Text style={styles.nodeMainText}>
                YOU
              </Text>
            </View>

            <View style={styles.nodeRow}>
              <NetworkNode label="NODE 01" />
              <NetworkNode label="NODE 02" />
              <NetworkNode label="NODE 03" />
            </View>

            <View style={styles.nodeRow}>
              <NetworkNode label="RELAY" />
              <NetworkNode label="RELAY" />
              <NetworkNode label="NODE 06" />
            </View>
          </View>
        </View>

        {/* SYNC */}

        <View style={styles.syncCard}>
          <View>
            <Text style={styles.syncTitle}>
              🔄 Last Synchronization
            </Text>

            <Text style={styles.syncTime}>
              12 seconds ago
            </Text>

            <Text style={styles.syncDescription}>
              Emergency state is ready to be relayed between
              connected peers.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.syncButton}
            onPress={() =>
              Alert.alert(
                'Mesh Broadcast',
                'Emergency state synchronized across active nodes.'
              )
            }
          >
            <Text style={styles.syncButtonText}>
              📡 Force Sync
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.meshWarning}>
          <Text style={styles.meshWarningTitle}>
            ⚠️ Connectivity resilience
          </Text>

          <Text style={styles.meshWarningText}>
            Mesh communication is designed as a resilience layer.
            Production deployment requires platform-specific
            Bluetooth / Wi-Fi Direct / local-network implementation
            and secure message authentication.
          </Text>
        </View>
      </ScrollView>
    );
  };

  /* -------------------------------------------------------
     MAIN UI
  ------------------------------------------------------- */

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>
              🛰️ DISASTER NET
            </Text>

            <Text style={styles.headerSubtitle}>
              Emergency Intelligence & Action Center
            </Text>
          </View>

          <View style={styles.headerOnline}>
            <View style={styles.headerOnlineDot} />
            <Text style={styles.headerOnlineText}>
              LIVE
            </Text>
          </View>
        </View>
      </View>

      {/* TABS */}

      <View style={styles.tabContainer}>
        {renderTab('OVERVIEW', '📊', 'Overview')}
        {renderTab('SOS', '🆘', 'Response', sosRequests.length)}
        {renderTab('CHATBOT', '🧠', 'Mental Health')}
        {renderTab('MESH', '📡', 'Mesh')}
      </View>

      {/* CONTENT */}

      <View style={styles.content}>
        {activeTab === 'OVERVIEW' && renderOverview()}
        {activeTab === 'SOS' && renderSOS()}
        {activeTab === 'CHATBOT' && renderChatbot()}
        {activeTab === 'MESH' && renderMesh()}
      </View>
    </View>
  );
}

/* ==========================================================
   SMALL COMPONENTS
========================================================== */

function RiskCard({
  icon,
  title,
  value,
  description,
  level,
}: {
  icon: string;
  title: string;
  value: string;
  description: string;
  level: 'high' | 'low';
}) {
  return (
    <View style={styles.riskCard}>
      <Text style={styles.riskIcon}>{icon}</Text>

      <Text style={styles.riskTitle}>
        {title}
      </Text>

      <Text
        style={[
          styles.riskValue,
          level === 'high'
            ? styles.highRisk
            : styles.lowRisk,
        ]}
      >
        {value}
      </Text>

      <Text style={styles.riskDescription}>
        {description}
      </Text>
    </View>
  );
}

function StatCard({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

function SOSPreview({
  id,
  location,
  urgency,
  needs,
}: {
  id: string;
  location: string;
  urgency: string;
  needs: string;
}) {
  return (
    <View style={styles.previewCard}>
      <View style={styles.previewTop}>
        <Text style={styles.previewId}>
          {id}
        </Text>

        <View
          style={[
            styles.previewBadge,
            urgency === 'CRITICAL'
              ? styles.previewCritical
              : styles.previewHigh,
          ]}
        >
          <Text
            style={[
              styles.previewBadgeText,
              urgency === 'CRITICAL'
                ? styles.criticalText
                : styles.highText,
            ]}
          >
            {urgency}
          </Text>
        </View>
      </View>

      <Text style={styles.previewDetail}>
        📍 {location}
      </Text>

      <Text style={styles.previewDetail}>
        📦 {needs}
      </Text>
    </View>
  );
}

function MeshStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.meshStat}>
      <Text style={styles.meshStatValue}>
        {value}
      </Text>

      <Text style={styles.meshStatLabel}>
        {label}
      </Text>
    </View>
  );
}

function NetworkNode({ label }: { label: string }) {
  return (
    <View style={styles.networkNode}>
      <View style={styles.nodeDot} />

      <Text style={styles.nodeLabel}>
        {label}
      </Text>
    </View>
  );
}

/* ==========================================================
   STYLES
========================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1324',
  },

  header: {
    backgroundColor: '#1E293B',
    paddingTop: 48,
    paddingHorizontal: 18,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#38BDF8',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 3,
  },

  headerOnline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2E29',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  headerOnlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },

  headerOnlineText: {
    color: '#22C55E',
    fontWeight: '800',
    fontSize: 10,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    minHeight: 47,
    justifyContent: 'center',
  },

  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#38BDF8',
  },

  tabText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },

  activeTabText: {
    color: '#38BDF8',
  },

  content: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 15,
    paddingBottom: 35,
  },

  /* SYSTEM */

  systemBar: {
    backgroundColor: '#162033',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  systemTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },

  systemSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 3,
  },

  onlineBadge: {
    backgroundColor: '#0F2E29',
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },

  onlineText: {
    color: '#22C55E',
    fontSize: 9,
    fontWeight: '900',
  },

  /* ALERT */

  criticalAlert: {
    backgroundColor: '#FFF7F7',
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 17,
  },

  alertTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  alertLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  alertIcon: {
    fontSize: 25,
    marginRight: 9,
  },

  alertTitle: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '900',
  },

  alertSubtitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },

  criticalBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  criticalBadgeText: {
    color: '#DC2626',
    fontSize: 9,
    fontWeight: '900',
  },

  alertLocation: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
  },

  alertDescription: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  demoSource: {
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 8,
    fontStyle: 'italic',
  },

  alertActions: {
    flexDirection: 'row',
    marginTop: 12,
  },

  primaryAction: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 6,
  },

  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },

  secondaryAction: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 6,
  },

  secondaryActionText: {
    color: '#0369A1',
    fontWeight: '800',
    fontSize: 11,
  },

  /* SECTION */

  sectionHeader: {
    marginBottom: 9,
    marginTop: 2,
  },

  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
  },

  /* SCORE */

  scoreCard: {
    backgroundColor: '#162033',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  scoreLeft: {
    width: 100,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#334155',
    paddingRight: 12,
  },

  scoreNumber: {
    color: '#F8FAFC',
    fontSize: 38,
    fontWeight: '900',
  },

  scoreOutOf: {
    color: '#64748B',
    fontSize: 10,
    marginTop: -7,
  },

  scoreLabel: {
    color: '#38BDF8',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 6,
  },

  scoreRight: {
    flex: 1,
    paddingLeft: 15,
  },

  scoreStatus: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '900',
  },

  scoreDescription: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },

  progressBackground: {
    height: 7,
    backgroundColor: '#334155',
    borderRadius: 10,
    marginTop: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: 7,
    backgroundColor: '#38BDF8',
    borderRadius: 10,
  },

  /* RISK */

  riskGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  riskCard: {
    width: '48.5%',
    backgroundColor: '#162033',
    borderRadius: 11,
    padding: 12,
    marginBottom: 9,
  },

  riskIcon: {
    fontSize: 21,
  },

  riskTitle: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },

  riskValue: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },

  highRisk: {
    color: '#FB7185',
  },

  lowRisk: {
    color: '#4ADE80',
  },

  riskDescription: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
  },

  /* STATS */

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  statCard: {
    width: '31.5%',
    backgroundColor: '#162033',
    borderRadius: 11,
    padding: 11,
    alignItems: 'center',
  },

  statIcon: {
    fontSize: 17,
  },

  statValue: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 3,
  },

  statLabel: {
    color: '#64748B',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },

  /* WHITE CARD */

  whiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 13,
    marginBottom: 17,
  },

  cardHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },

  darkCardTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
  },

  darkCardSubtitle: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
  },

  viewAll: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '800',
  },

  previewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 9,
    padding: 10,
    marginTop: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  previewId: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
  },

  previewBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  previewCritical: {
    backgroundColor: '#FEE2E2',
  },

  previewHigh: {
    backgroundColor: '#FEF3C7',
  },

  previewBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },

  previewDetail: {
    color: '#475569',
    fontSize: 10,
    marginTop: 4,
  },

  /* EMPTY */

  emptyCard: {
    backgroundColor: '#162033',
    borderRadius: 13,
    padding: 22,
    alignItems: 'center',
    marginBottom: 17,
  },

  emptyLarge: {
    backgroundColor: '#162033',
    borderRadius: 14,
    padding: 45,
    alignItems: 'center',
    marginTop: 10,
  },

  emptyIcon: {
    fontSize: 30,
  },

  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 8,
  },

  emptyText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 16,
  },

  /* INFO */

  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  infoCard: {
    width: '48.5%',
    backgroundColor: '#162033',
    borderRadius: 12,
    padding: 13,
  },

  infoIcon: {
    fontSize: 24,
  },

  infoTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 5,
  },

  infoValue: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 5,
  },

  infoDescription: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 3,
    lineHeight: 13,
  },

  /* QUICK ACTION */

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  quickAction: {
    width: '48.5%',
    backgroundColor: '#162033',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  quickIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  quickText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '800',
  },

  footerNote: {
    marginTop: 8,
    backgroundColor: '#151D2D',
    borderRadius: 9,
    padding: 10,
  },

  footerText: {
    color: '#64748B',
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
  },

  /* PAGE */

  pageHeading: {
    marginBottom: 14,
  },

  pageTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
  },

  pageSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },

  /* RESPONSE */

  responseBanner: {
    backgroundColor: '#162033',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  responseBannerIcon: {
    fontSize: 27,
    marginRight: 12,
  },

  responseBannerTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
  },

  responseBannerText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
    lineHeight: 14,
  },

  fullSOSCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 14,
    marginBottom: 10,
  },

  sosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sosId: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
  },

  sosTime: {
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 3,
  },

  urgencyBadge: {
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  criticalBackground: {
    backgroundColor: '#FEE2E2',
  },

  highBackground: {
    backgroundColor: '#FEF3C7',
  },

  urgencyText: {
    fontSize: 9,
    fontWeight: '900',
  },

  criticalText: {
    color: '#DC2626',
  },

  highText: {
    color: '#D97706',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },

  sosInfo: {
    color: '#475569',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 17,
  },

  bold: {
    fontWeight: '900',
    color: '#334155',
  },

  sosActions: {
    flexDirection: 'row',
    marginTop: 12,
  },

  acceptButton: {
    flex: 1,
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 5,
  },

  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  locationButton: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginLeft: 5,
  },

  locationButtonText: {
    color: '#0369A1',
    fontSize: 11,
    fontWeight: '900',
  },

  /* CHAT */

  chatContainer: {
    flex: 1,
    padding: 14,
  },

  chatHeader: {
    backgroundColor: '#162033',
    borderRadius: 12,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  chatIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#26354D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  chatIconText: {
    fontSize: 22,
  },

  chatTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '900',
  },

  chatSubtitle: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 3,
  },

  offlineBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
  },

  offlineText: {
    color: '#CBD5E1',
    fontSize: 8,
    fontWeight: '900',
  },

  chatScroll: {
    flex: 1,
  },

  chatContent: {
    paddingBottom: 10,
  },

  supportNotice: {
    backgroundColor: '#172B3A',
    borderWidth: 1,
    borderColor: '#164E63',
    borderRadius: 10,
    padding: 11,
    marginBottom: 10,
  },

  supportNoticeTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '900',
  },

  supportNoticeText: {
    color: '#94A3B8',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  chatBubble: {
    padding: 11,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '85%',
  },

  userBubble: {
    backgroundColor: '#0284C7',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 3,
  },

  botBubble: {
    backgroundColor: '#1E293B',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 3,
  },

  userText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 17,
  },

  botText: {
    color: '#F8FAFC',
    fontSize: 12,
    lineHeight: 17,
  },

  quickFeelingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },

  feelingButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginRight: 6,
    marginBottom: 6,
  },

  feelingText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 8,
  },

  chatInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 90,
    backgroundColor: '#1E293B',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 11,
    marginRight: 7,
  },

  sendBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 9,
  },

  sendBtnText: {
    color: '#082F49',
    fontWeight: '900',
    fontSize: 11,
  },

  /* MESH */

  meshStatusCard: {
    backgroundColor: '#162033',
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  meshStatusTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  meshStatusTitle: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '900',
  },

  meshStatusSubtitle: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
  },

  meshSignal: {
    fontSize: 28,
  },

  meshStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },

  meshStat: {
    width: '24%',
    alignItems: 'center',
  },

  meshStatValue: {
    color: '#38BDF8',
    fontSize: 21,
    fontWeight: '900',
  },

  meshStatLabel: {
    color: '#64748B',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 3,
  },

  networkCard: {
    backgroundColor: '#162033',
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  networkTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
  },

  networkSubtitle: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
  },

  networkVisual: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  nodeLineTop: {
    width: 2,
    height: 12,
    backgroundColor: '#38BDF8',
  },

  networkNodeMain: {
    width: 70,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  nodeMainText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  nodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 17,
  },

  networkNode: {
    alignItems: 'center',
  },

  nodeDot: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#38BDF8',
    marginBottom: 5,
  },

  nodeLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '800',
  },

  syncCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  syncTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },

  syncTime: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },

  syncDescription: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  syncButton: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 12,
  },

  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  meshWarning: {
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: '#44403C',
    borderRadius: 10,
    padding: 12,
  },

  meshWarningTitle: {
    color: '#FACC15',
    fontSize: 11,
    fontWeight: '900',
  },

  meshWarningText: {
    color: '#A8A29E',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 5,
  },
});