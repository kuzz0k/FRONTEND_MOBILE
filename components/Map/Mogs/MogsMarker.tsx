import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Callout, Marker } from "react-native-maps";
import { Mog } from "../../../types/types";

interface MogsMarkerProps {
  mogs: Mog[],
}

export const MogsMarker: FC<MogsMarkerProps> = ({mogs}) => {
  const MogMarkerView = ({ mog }: { mog: Mog }) => {
    const cuttedUsername = `${mog.username[0]}${mog.username[1]}`
    const bgColor = mog.connected ? (mog.ready ? '#00be06' : 'red') : 'grey';

    return (
      <View style={[styles.customMogMarker, { backgroundColor: bgColor }]}>
        <Text style={styles.cuttedUsername}>{cuttedUsername}</Text>
      </View>
    );
  };

  return (
    <>
      {mogs.map(mog => (
        <Marker
          key={mog.username}
          coordinate={!mog.coordinates ? { latitude: 0, longitude: 0 } : 
            { latitude: mog.coordinates.lat, longitude: mog.coordinates.lng }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <MogMarkerView mog={mog} />
          <Callout>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>{mog.username}</Text>
              <Text style={styles.calloutText}>
                Статус: <Text style={{ color: mog.connected ? 'green' : 'red', fontWeight: 'bold' }}>
                  {mog.connected ? (mog.ready ? 'ГОТОВ' : 'НЕ ГОТОВ') : 'ОТКЛЮЧЕН'}
                </Text>
              </Text>
              <Text style={styles.calloutText}>Позывной: {mog.callSign}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </>
  )
}

const styles = StyleSheet.create({
  customMogMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  cuttedUsername: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  calloutContainer: {
    padding: 10,
    minWidth: 150,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutText: {
    fontSize: 14,
    marginBottom: 2,
  },
});
