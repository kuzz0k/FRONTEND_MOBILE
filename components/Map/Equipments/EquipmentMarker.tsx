import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Callout, Marker } from "react-native-maps";
import { EquipmentType } from "../../../types/types";

interface EqipmentMarkerProps {
  equipments: EquipmentType[]
}

export const EquipmentMarker: FC<EqipmentMarkerProps> = ({equipments}) => {
  if (!equipments || equipments.length <= 0) return null;

  const EquipmentMarkerView = ({ equipment }: { equipment: EquipmentType }) => {
    return (
      <View style={[styles.equipmentMarker, { 
        backgroundColor: equipment.connected ? '#00FF09' : '#FF0000' 
      }]}>
        <Text style={styles.equipmentText}>RLS</Text>
      </View>
    );
  };

  return (
    <>
      {equipments.map(equip => (
        <Marker
          key={equip.id}
          coordinate={{ latitude: equip.coordinates.lat, longitude: equip.coordinates.lng }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <EquipmentMarkerView equipment={equip} />
          <Callout>
            <View style={styles.popupWrapper}>
              <Text style={styles.popupTitle}>Информация об оборудовании</Text>
              <Text style={styles.popupString}>
                Название устройства: <Text style={styles.boldText}>{equip.name}</Text>
              </Text>
              <Text style={styles.popupString}>
                Статус: <Text style={{
                  color: equip.connected ? 'green' : 'red', 
                  fontWeight: 'bold'
                }}>
                  {equip.connected ? "ON" : "OFF"}
                </Text>
              </Text>
              <Text style={styles.popupString}>
                Модель: <Text style={styles.boldText}>{equip.model}</Text>
              </Text>
              <Text style={styles.popupString}>
                Тип: <Text style={styles.boldText}>{equip.type}</Text>
              </Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </>
  )
}

const styles = StyleSheet.create({
  equipmentMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  equipmentText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 8,
  },
  popupWrapper: {
    padding: 10,
    minWidth: 200,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  popupString: {
    fontSize: 14,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
  },
});
